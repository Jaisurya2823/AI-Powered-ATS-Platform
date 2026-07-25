import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Chip, Button, Card, CardContent, Divider, Alert, LinearProgress } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getJobById } from '../../api/jobApi';
import { applyToJob } from '../../api/applicationApi';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner, PageError } from '../../components/common/LoadingSpinner';

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, isApplicant } = useAuth();
  const fileRef = useRef();
  const [file, setFile] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [applyError, setApplyError] = useState('');
  const [applySuccess, setApplySuccess] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['job', id],
    queryFn: () => getJobById(id).then((r) => r.data.job),
  });

  const applyMutation = useMutation({
    mutationFn: ({ jobId, formData }) => applyToJob(jobId, formData),
    onSuccess: () => { setApplySuccess(true); setFile(null); setCoverLetter(''); },
    onError: (err) => setApplyError(err.response?.data?.message || 'Failed to apply.'),
  });

  const handleApply = () => {
    setApplyError('');
    if (!file) { setApplyError('Please upload your resume.'); return; }
    const formData = new FormData();
    formData.append('resume', file);
    if (coverLetter) formData.append('coverLetter', coverLetter);
    applyMutation.mutate({ jobId: id, formData });
  };

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <PageError message="Job not found." onRetry={refetch} />;

  const job = data;

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: 3 }}>
      <Button onClick={() => navigate('/jobs')} sx={{ mb: 2, color: 'text.secondary' }}>← Back to Jobs</Button>

      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Left - Job Info */}
        <Box sx={{ flexGrow: 1 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h4" fontWeight={700} gutterBottom>{job.title}</Typography>
              <Typography variant="h6" color="text.secondary" gutterBottom>{job.recruiter?.company}</Typography>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, my: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <LocationOnIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Typography variant="body2">{job.location}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <WorkIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Chip label={job.jobType} size="small" color="primary" />
                </Box>
                {job.experienceRequired && (
                  <Chip label={job.experienceRequired} size="small" variant="outlined" />
                )}
              </Box>

              {job.skills?.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>Required Skills</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                    {job.skills.map((s) => <Chip key={s} label={s} size="small" color="primary" variant="outlined" />)}
                  </Box>
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" fontWeight={600} gutterBottom>Job Description</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>{job.description}</Typography>

              <Typography variant="subtitle1" fontWeight={600} gutterBottom>Requirements</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>{job.requirements}</Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Right - Apply Box */}
        <Box sx={{ minWidth: { md: 300 } }}>
          <Card sx={{ position: 'sticky', top: 80 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>Apply Now</Typography>

              {applySuccess ? (
                <Alert severity="success">Application submitted successfully!</Alert>
              ) : !isLoggedIn ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Typography variant="body2" color="text.secondary">Sign in to apply</Typography>
                  <Button variant="contained" onClick={() => navigate('/login')}>Sign In</Button>
                  <Button variant="outlined" onClick={() => navigate('/register')}>Create Account</Button>
                </Box>
              ) : !isApplicant ? (
                <Alert severity="info">Recruiters cannot apply to jobs.</Alert>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {applyError && <Alert severity="error">{applyError}</Alert>}

                  <Box>
                    <Button variant="outlined" fullWidth startIcon={<UploadFileIcon />} onClick={() => fileRef.current.click()}>
                      {file ? file.name : 'Upload Resume (PDF/DOCX)'}
                    </Button>
                    <input ref={fileRef} type="file" accept=".pdf,.docx" style={{ display: 'none' }} onChange={(e) => { setFile(e.target.files[0]); setApplyError(''); }} />
                    <Typography variant="caption" color="text.secondary">Max 5MB</Typography>
                  </Box>

                  <Box component="textarea"
                    placeholder="Cover letter (optional)"
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    style={{ resize: 'vertical', minHeight: 100, padding: 10, borderRadius: 8, background: 'transparent', color: '#f1f5f9', border: '1px solid rgba(148,163,184,0.3)', fontFamily: 'Inter, sans-serif', fontSize: 14 }}
                  />

                  {applyMutation.isLoading && <LinearProgress />}

                  <Button variant="contained" size="large" onClick={handleApply} disabled={applyMutation.isLoading}>
                    {applyMutation.isLoading ? 'Submitting...' : 'Submit Application'}
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}