const Groq = require('groq-sdk');

let groqClient = null;

const getGroqClient = () => {
  if (!groqClient) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is not configured');
    }
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
};

/**
 * Truncate text to avoid exceeding model context window
 * ~4 chars per token, keeping under 4000 tokens for resume
 */
const truncateText = (text, maxChars = 12000) => {
  if (text.length <= maxChars) return text;
  return text.substring(0, maxChars) + '\n...[truncated]';
};

/**
 * Analyze a resume against a job description using Groq AI
 * @param {string} resumeText - Extracted resume text
 * @param {Object} job - Job document
 * @returns {Object} AI analysis result
 */
const analyzeResume = async (resumeText, job) => {
  const groq = getGroqClient();

  const truncatedResume = truncateText(resumeText);

  const systemPrompt = `You are an expert technical HR recruiter and resume analyst with 15+ years of experience. 
Your task is to objectively analyze a candidate's resume against a job description.
You MUST respond with ONLY a valid JSON object — no markdown, no explanation, no preamble.`;

  const userPrompt = `Analyze this resume against the job requirements and return a JSON evaluation.

JOB TITLE: ${job.title}

JOB DESCRIPTION:
${truncateText(job.description, 1500)}

REQUIRED SKILLS: ${job.skills.join(', ')}

REQUIREMENTS:
${truncateText(job.requirements, 1000)}

RESUME TEXT:
${truncatedResume}

Return ONLY this exact JSON structure (no other text):
{
  "matchScore": <integer from 0 to 100>,
  "extractedSkills": [<skills found in resume that match job requirements>],
  "summary": "<2-3 sentence objective candidate summary>",
  "strengths": [<3-5 specific strengths relevant to this job>],
  "gaps": [<2-4 missing skills or experience gaps>],
  "recommendation": "<exactly one of: Strong Hire, Hire, Maybe, Reject>"
}`;

  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    try {
      const completion = await groq.chat.completions.create({
        model: process.env.GROQ_MODEL || 'llama3-70b-8192',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.2,
        max_tokens: 1000,
      });

      const raw = completion.choices[0]?.message?.content;
      if (!raw) {
        throw new Error('Empty response from AI model');
      }

      // Clean response — remove any accidental markdown fences
      const cleaned = raw
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();

      const parsed = JSON.parse(cleaned);

      // Validate the parsed response has required fields
      validateAIResponse(parsed);

      return {
        isAnalyzed: true,
        matchScore: Math.round(parsed.matchScore),
        extractedSkills: parsed.extractedSkills || [],
        summary: parsed.summary || '',
        strengths: parsed.strengths || [],
        gaps: parsed.gaps || [],
        recommendation: parsed.recommendation || null,
        analyzedAt: new Date(),
      };
    } catch (error) {
      attempts++;
      console.error(`AI analysis attempt ${attempts} failed:`, error.message);

      if (attempts >= maxAttempts) {
        throw new Error(
          `AI analysis failed after ${maxAttempts} attempts: ${error.message}`
        );
      }

      // Wait before retry (exponential backoff)
      await new Promise((r) => setTimeout(r, 1000 * attempts));
    }
  }
};

const validateAIResponse = (parsed) => {
  const required = ['matchScore', 'extractedSkills', 'summary', 'strengths', 'gaps', 'recommendation'];
  for (const field of required) {
    if (parsed[field] === undefined) {
      throw new Error(`AI response missing required field: ${field}`);
    }
  }

  if (typeof parsed.matchScore !== 'number' || parsed.matchScore < 0 || parsed.matchScore > 100) {
    throw new Error('Invalid matchScore in AI response');
  }

  const validRecommendations = ['Strong Hire', 'Hire', 'Maybe', 'Reject'];
  if (!validRecommendations.includes(parsed.recommendation)) {
    // Try to normalize instead of throwing
    parsed.recommendation = 'Maybe';
  }
};

module.exports = { analyzeResume };