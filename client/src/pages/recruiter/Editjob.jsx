import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Typography, Card, CardContent, TextField, Button, Alert, Select, MenuItem, FormControl, InputLabel, Chip, CircularProgress } from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getJobById, updateJob } from '../../api/jobApi';
import { useSnackbar } from '../../context/SnackbarContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

const JOB_TYPES = ['full-time', 'part-time', 'contract', 'internship', 'remote'];

export default function EditJob() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { showSnackbar } = useSnackbar();

  const [form, setForm] = useState(null);
  const [skillInput, setSkillInput] = useState('');
  const [error, setError] = useState('');

  const { data: job, isLoading } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => getJobById(jobId).then((r) => r.data.job),
    onSuccess: (data) => {
      setForm({
        title: data.title || '',
        description: data.description || '',
        requirements: data.requirements || '',
        location: data.location || '',
        jobType: data.jobType || 'full-time',
        experienceRequired: data.experienceRequired || '',
        skills: data.skills || [],
        status: data.status || 'active',
      });
    },
  });

  const mutation = useMutation({
    mutationFn: (data) => updateJob(jobId, data),
    onSuccess: () => {
      qc.invalidateQueries(['my-jobs']);
      qc.invalidateQueries(['job', jobId]);
      showSnackbar('Job updated successfully!');
      navigate('/recruiter/jobs');
    },
    onError: (err) => setError(err.response?.data?.message || 'Failed to update job.'),
  });

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const addSkill = () => {
    const skill = skillInput.trim();
    if (skill && !form.skills.includes(skill) && form.skills.length < 20) {
      setForm((p) => ({ ...p, skills: [...p.skills, skill] }));
      setSkillInput('');
    }
  };

  const removeSkill = (s) => setForm((p) => ({ ...p, skills: p.skills.filter((sk) => sk !== s) }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!form.title || !form.description || !form.requirements || !form.location || !form.jobType) {
      setError('All required fields must be filled.'); return;
    }
    mutation.mutate(form);
  };

  if (isLoading || !form) return <LoadingSpinner message="Loading job..." />;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Button onClick={() => navigate('/recruiter/jobs')} sx={{ mb: 2, color: 'text.secondary' }}>← Back</Button>
      <Typography variant="h4" fontWeight={700} mb={3}>Edit Job</Typography>

      <Card>
        <CardContent sx={{ p: 3 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField label="Job Title *" name="title" value={form.title} onChange={handleChange} />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="Location *" name="location" value={form.location} onChange={handleChange} sx={{ flex: 1 }} />
              <FormControl sx={{ minWidth: 160 }}>
                <InputLabel>Job Type *</InputLabel>
                <Select name="jobType" value={form.jobType} label="Job Type *" onChange={handleChange}>
                  {JOB_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="Experience Required" name="experienceRequired" value={form.experienceRequired} onChange={handleChange} sx={{ flex: 1 }} />
              <FormControl sx={{ minWidth: 160 }}>
                <InputLabel>Status</InputLabel>
                <Select name="status" value={form.status} label="Status" onChange={handleChange}>
                  {['active','draft','archived'].map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>

            <TextField label="Job Description *" name="description" value={form.description} onChange={handleChange} multiline rows={5} />
            <TextField label="Requirements *" name="requirements" value={form.requirements} onChange={handleChange} multiline rows={4} />

            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>Skills</Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField placeholder="Add a skill" value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }} size="small" sx={{ flex: 1 }} />
                <Button variant="outlined" onClick={addSkill} size="small">Add</Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                {form.skills.map((s) => (
                  <Chip key={s} label={s} size="small" onDelete={() => removeSkill(s)} color="primary" variant="outlined" />
                ))}
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              <Button variant="outlined" onClick={() => navigate('/recruiter/jobs')} sx={{ flex: 1 }}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={mutation.isLoading} sx={{ flex: 1 }}>
                {mutation.isLoading ? <CircularProgress size={20} /> : 'Save Changes'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}