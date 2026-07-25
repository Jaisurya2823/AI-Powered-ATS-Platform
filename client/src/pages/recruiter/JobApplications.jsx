import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CardContent, Button, Select, MenuItem, FormControl, LinearProgress, Avatar, Chip, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Tooltip } from '@mui/material';
import PsychologyIcon from '@mui/icons-material/Psychology';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getJobApplications, updateApplicationStatus } from '../../api/applicationApi';
import { analyzeApplication, bulkAnalyze } from '../../api/aiApi';
import { getJobById } from '../../api/jobApi';
import { StatusChip, AIAnalysisCard } from '../../components/applications/StatusChip';
import { LoadingSpinner, PageError } from '../../components/common/LoadingSpinner';
import { useSnackbar } from '../../context/SnackbarContext';

const STATUSES = ['applied', 'screening', 'interview', 'offered', 'rejected'];

export default function JobApplications() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { showSnackbar } = useSnackbar();
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);
  const [note, setNote] = useState('');
  const [newStatus, setNewStatus] = useState('');

  const { data: job } = useQuery({ queryKey: ['job', jobId], queryFn: () => getJobById(jobId).then((r) => r.data.job) });
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['job-applications', jobId, statusFilter],
    queryFn: () => getJobApplications(jobId, { status: statusFilter || undefined, limit: 50 }).then((r) => r.data),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status, note }) => updateApplicationStatus(id, { status, note }),
    onSuccess: () => {
      qc.invalidateQueries(['job-applications', jobId]);
      setSelectedApp(null);
      showSnackbar('Application status updated.');
    },
    onError: (err) => showSnackbar(err.response?.data?.message || 'Failed to update status.', 'error'),
  });

  const analyzeMutation = useMutation({
    mutationFn: (appId) => analyzeApplication(appId),
    onSuccess: () => { qc.invalidateQueries(['job-applications', jobId]); showSnackbar('AI analysis complete!'); },
    onError: (err) => showSnackbar(err.response?.data?.message || 'AI analysis failed.', 'error'),
  });

  const bulkMutation = useMutation({
    mutationFn: () => bulkAnalyze(jobId),
    onSuccess: (res) => { qc.invalidateQueries(['job-applications', jobId]); showSnackbar(`Bulk analysis done: ${res.data.processed} analyzed.`); },
    onError: () => showSnackbar('Bulk analysis failed.', 'error'),
  });

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <PageError message="Failed to load applications." onRetry={refetch} />;

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto', p: 3 }}>
      <Button onClick={() => navigate('/recruiter/jobs')} sx={{ mb: 2, color: 'text.secondary' }}>← Back to Jobs</Button>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>{job?.title}</Typography>
          <Typography color="text.secondary">{data?.total || 0} applications</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select value={statusFilter} displayEmpty onChange={(e) => setStatusFilter(e.target.value)}>
              <MenuItem value="">All Statuses</MenuItem>
              {STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </Select>
          </FormControl>
          <Button variant="outlined" startIcon={<PsychologyIcon />} onClick={() => bulkMutation.mutate()} disabled={bulkMutation.isLoading}>
            {bulkMutation.isLoading ? 'Analyzing...' : 'Bulk AI Analyze'}
          </Button>
          <Button variant="contained" onClick={() => navigate(`/recruiter/jobs/${jobId}/rankings`)}>AI Rankings</Button>
        </Box>
      </Box>

      {bulkMutation.isLoading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

      {data?.applications?.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <Typography color="text.secondary">No applications found.</Typography>
        </Box>
      ) : (
        data?.applications?.map((app) => (
          <Card key={app._id} sx={{ mb: 2, '&:hover': { boxShadow: 4 } }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', fontWeight: 700 }}>{app.applicant?.name?.charAt(0)}</Avatar>
                  <Box>
                    <Typography fontWeight={600}>{app.applicant?.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{app.applicant?.email}</Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <StatusChip status={app.status} />
                  {app.aiAnalysis?.isAnalyzed && (
                    <Chip
                      label={`${app.aiAnalysis.matchScore}% match`}
                      size="small"
                      color={app.aiAnalysis.matchScore >= 70 ? 'success' : app.aiAnalysis.matchScore >= 40 ? 'warning' : 'error'}
                    />
                  )}
                  <Tooltip title={app.aiAnalysis?.isAnalyzed ? 'Re-run AI analysis' : 'Run AI analysis'}>
                    <Button size="small" variant="outlined" startIcon={<PsychologyIcon />}
                      onClick={() => analyzeMutation.mutate(app._id)} disabled={analyzeMutation.isLoading}>
                      {app.aiAnalysis?.isAnalyzed ? 'Re-analyze' : 'Analyze'}
                    </Button>
                  </Tooltip>
                  <Button size="small" variant="contained" onClick={() => { setSelectedApp(app); setNewStatus(app.status); setNote(''); }}>
                    Update Status
                  </Button>
                  <Tooltip title="View Resume">
                    <Button size="small" href={app.resumeUrl} target="_blank" rel="noopener noreferrer" endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}>
                      Resume
                    </Button>
                  </Tooltip>
                </Box>
              </Box>

              {app.aiAnalysis?.isAnalyzed && (
                <Box sx={{ mt: 2 }}>
                  <AIAnalysisCard analysis={app.aiAnalysis} />
                </Box>
              )}
            </CardContent>
          </Card>
        ))
      )}

      {/* Status Update Dialog */}
      <Dialog open={Boolean(selectedApp)} onClose={() => setSelectedApp(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Status — {selectedApp?.applicant?.name}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <FormControl fullWidth>
            <Select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
              {STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField label="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} multiline rows={3} placeholder="Add a note for this status change..." />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => setSelectedApp(null)}>Cancel</Button>
          <Button variant="contained" onClick={() => statusMutation.mutate({ id: selectedApp._id, status: newStatus, note })} disabled={statusMutation.isLoading}>
            {statusMutation.isLoading ? 'Updating...' : 'Update Status'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}