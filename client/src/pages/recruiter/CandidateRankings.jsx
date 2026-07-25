import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CardContent, Button, Avatar, Chip, LinearProgress, Select, MenuItem, FormControl, InputLabel, TextField } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { getCandidateRankings } from '../../api/aiApi';
import { getJobById } from '../../api/jobApi';
import { LoadingSpinner, PageError } from '../../components/common/LoadingSpinner';

const recColors = { 'Strong Hire': '#22c55e', Hire: '#3b82f6', Maybe: '#f59e0b', Reject: '#ef4444' };

export default function CandidateRankings() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [minScore, setMinScore] = useState(0);
  const [recommendation, setRecommendation] = useState('');

  const { data: job } = useQuery({ queryKey: ['job', jobId], queryFn: () => getJobById(jobId).then((r) => r.data.job) });
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['rankings', jobId, minScore, recommendation],
    queryFn: () => getCandidateRankings(jobId, { minScore, recommendation: recommendation || undefined, limit: 50 }).then((r) => r.data),
  });

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', p: 3 }}>
      <Button onClick={() => navigate(`/recruiter/jobs/${jobId}/applications`)} sx={{ mb: 2, color: 'text.secondary' }}>← Back to Applications</Button>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>AI Candidate Rankings</Typography>
          <Typography color="text.secondary">{job?.title} · {data?.total || 0} analyzed</Typography>
        </Box>
      </Box>

      {/* Stats */}
      {data?.stats && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              <Box><Typography variant="h5" fontWeight={700}>{Math.round(data.stats.avgScore || 0)}%</Typography><Typography variant="body2" color="text.secondary">Avg Score</Typography></Box>
              <Box><Typography variant="h5" fontWeight={700}>{data.stats.maxScore || 0}%</Typography><Typography variant="body2" color="text.secondary">Top Score</Typography></Box>
              <Box><Typography variant="h5" fontWeight={700}>{data.stats.totalAnalyzed || 0}</Typography><Typography variant="body2" color="text.secondary">Analyzed</Typography></Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField label="Min Score" type="number" value={minScore} onChange={(e) => setMinScore(Number(e.target.value))} size="small" sx={{ width: 120 }} inputProps={{ min: 0, max: 100 }} />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Recommendation</InputLabel>
          <Select value={recommendation} label="Recommendation" onChange={(e) => setRecommendation(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            {['Strong Hire', 'Hire', 'Maybe', 'Reject'].map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      {isLoading && <LoadingSpinner message="Loading rankings..." />}
      {isError && <PageError message="Failed to load rankings." onRetry={refetch} />}

      {!isLoading && !isError && data?.applications?.map((app, idx) => {
        const score = app.aiAnalysis?.matchScore || 0;
        const scoreColor = score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#ef4444';

        return (
          <Card key={app._id} sx={{ mb: 2, border: idx === 0 ? '1px solid #22c55e44' : undefined }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Typography variant="h5" fontWeight={700} sx={{ color: 'text.secondary', minWidth: 30 }}>#{idx + 1}</Typography>
                <Avatar sx={{ bgcolor: 'primary.main' }}>{app.applicant?.name?.charAt(0)}</Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography fontWeight={600}>{app.applicant?.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{app.applicant?.email}</Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h5" fontWeight={700} sx={{ color: scoreColor }}>{score}%</Typography>
                  <Chip label={app.aiAnalysis?.recommendation || '—'} size="small" sx={{ bgcolor: recColors[app.aiAnalysis?.recommendation] || '#64748b', color: '#fff', fontWeight: 600 }} />
                </Box>
              </Box>

              <Box sx={{ mt: 2 }}>
                <LinearProgress variant="determinate" value={score} sx={{ height: 6, borderRadius: 3, '& .MuiLinearProgress-bar': { bgcolor: scoreColor } }} />
              </Box>

              {app.aiAnalysis?.summary && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>{app.aiAnalysis.summary}</Typography>
              )}

              {app.aiAnalysis?.extractedSkills?.length > 0 && (
                <Box sx={{ mt: 1.5, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {app.aiAnalysis.extractedSkills.map((s) => <Chip key={s} label={s} size="small" variant="outlined" color="primary" />)}
                </Box>
              )}

              <Box sx={{ mt: 1.5, display: 'flex', gap: 1 }}>
                <Button size="small" href={app.resumeUrl} target="_blank" rel="noopener noreferrer" variant="outlined">Resume</Button>
              </Box>
            </CardContent>
          </Card>
        );
      })}

      {!isLoading && data?.applications?.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography color="text.secondary">No analyzed applications found. Run AI analysis from the Applications page first.</Typography>
        </Box>
      )}
    </Box>
  );
}