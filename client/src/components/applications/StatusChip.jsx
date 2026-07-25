import { Chip, Card, CardContent, Typography, Box, LinearProgress, Divider } from '@mui/material';
import PsychologyIcon from '@mui/icons-material/Psychology';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const statusConfig = {
  applied:   { label: 'Applied',    color: 'default' },
  screening: { label: 'Screening',  color: 'info' },
  interview: { label: 'Interview',  color: 'warning' },
  offered:   { label: 'Offered',    color: 'success' },
  rejected:  { label: 'Rejected',   color: 'error' },
};

export const StatusChip = ({ status }) => {
  const cfg = statusConfig[status] || { label: status, color: 'default' };
  return <Chip label={cfg.label} color={cfg.color} size="small" />;
};

const recommendationColors = {
  'Strong Hire': '#22c55e',
  'Hire':        '#3b82f6',
  'Maybe':       '#f59e0b',
  'Reject':      '#ef4444',
};

export const AIAnalysisCard = ({ analysis }) => {
  if (!analysis?.isAnalyzed) {
    return (
      <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
        <PsychologyIcon sx={{ fontSize: 36, color: 'text.secondary', mb: 1 }} />
        <Typography variant="body2" color="text.secondary">AI analysis not yet run</Typography>
      </Card>
    );
  }

  const scoreColor = analysis.matchScore >= 70 ? '#22c55e' : analysis.matchScore >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <Card variant="outlined">
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <PsychologyIcon color="primary" />
          <Typography variant="h6" fontWeight={600}>AI Analysis</Typography>
        </Box>

        {/* Score */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2" color="text.secondary">Match Score</Typography>
            <Typography variant="body2" fontWeight={700} sx={{ color: scoreColor }}>{analysis.matchScore}%</Typography>
          </Box>
          <LinearProgress variant="determinate" value={analysis.matchScore} sx={{ height: 8, borderRadius: 4, '& .MuiLinearProgress-bar': { bgcolor: scoreColor } }} />
        </Box>

        {/* Recommendation */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>Recommendation</Typography>
          <Chip label={analysis.recommendation} size="small" sx={{ bgcolor: recommendationColors[analysis.recommendation], color: '#fff', fontWeight: 600 }} />
        </Box>

        <Divider sx={{ my: 1.5 }} />

        {/* Summary */}
        {analysis.summary && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight={600} gutterBottom>Summary</Typography>
            <Typography variant="body2" color="text.secondary">{analysis.summary}</Typography>
          </Box>
        )}

        {/* Skills */}
        {analysis.extractedSkills?.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight={600} gutterBottom>Matched Skills</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {analysis.extractedSkills.map((s) => (
                <Chip key={s} label={s} size="small" color="primary" variant="outlined" />
              ))}
            </Box>
          </Box>
        )}

        {/* Strengths */}
        {analysis.strengths?.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight={600} gutterBottom>Strengths</Typography>
            {analysis.strengths.map((s, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, mb: 0.5 }}>
                <CheckCircleIcon sx={{ fontSize: 14, color: 'success.main', mt: 0.2 }} />
                <Typography variant="body2" color="text.secondary">{s}</Typography>
              </Box>
            ))}
          </Box>
        )}

        {/* Gaps */}
        {analysis.gaps?.length > 0 && (
          <Box>
            <Typography variant="body2" fontWeight={600} gutterBottom>Gaps</Typography>
            {analysis.gaps.map((g, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, mb: 0.5 }}>
                <CancelIcon sx={{ fontSize: 14, color: 'error.main', mt: 0.2 }} />
                <Typography variant="body2" color="text.secondary">{g}</Typography>
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};