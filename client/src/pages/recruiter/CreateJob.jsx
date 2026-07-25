import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CardContent, TextField, Button, Select, MenuItem, FormControl, InputLabel, Chip, Alert, CircularProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createJob } from '../../api/jobApi';
import { useSnackbar } from '../../context/SnackbarContext';

const JOB_TYPES = ['full-time', 'part-time', 'contract', 'internship', 'remote'];

export default function CreateJob() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { showSnackbar } = useSnackbar();
  const [form, setForm] = useState({ title: '', description: '', requirements: '', location: '', jobType: 'full-time', experienceRequired: '', skills: [] });
  const [skillInput, setSkillInput] = useState('');
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: createJob,
    onSuccess: () => {
      qc.invalidateQueries(['my-jobs']);
      showSnackbar('Job posted successfully!');
      navigate('/recruiter/jobs');
    },
    onError: (err) => setError(err.response?.data?.message || 'Failed to create job.'),
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
      setError('Please fill all required fields.'); return;
    }
    mutation.mutate(form);
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Button onClick={() => navigate('/recruiter/jobs')} sx={{ mb: 2, color: 'text.secondary' }}>← Back</Button>
      <Typography variant="h4" fontWeight={700} mb={0.5}>Post a New Job</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>Fill in the details to attract the right candidates</Typography>

      <Card>
        <CardContent sx={{ p: 3 }}>
          {error && <Alert severity="error" sx={{ mb: 2.5 }}>{error}</Alert>}
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField label="Job Title *" name="title" value={form.title} onChange={handleChange} placeholder="e.g. Senior React Developer" />

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField label="Location *" name="location" value={form.location} onChange={handleChange} sx={{ flex: 1, minWidth: 180 }} placeholder="e.g. Chennai, India" />
              <FormControl sx={{ minWidth: 160 }}>
                <InputLabel>Job Type *</InputLabel>
                <Select name="jobType" value={form.jobType} label="Job Type *" onChange={handleChange}>
                  {JOB_TYPES.map((t) => <MenuItem key={t} value={t} sx={{ textTransform: 'capitalize' }}>{t}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>

            <TextField label="Experience Required" name="experienceRequired" value={form.experienceRequired} onChange={handleChange} placeholder="e.g. 2-4 years, Entry level, 5+ years" />
            <TextField label="Job Description *" name="description" value={form.description} onChange={handleChange} multiline rows={5} placeholder="Describe the role, day-to-day responsibilities, team structure..." />
            <TextField label="Requirements *" name="requirements" value={form.requirements} onChange={handleChange} multiline rows={4} placeholder="List must-have qualifications, skills, and experience..." />

            {/* Skills */}
            <Box>
              <Typography variant="body2" fontWeight={500} gutterBottom>Skills</Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                <TextField
                  placeholder="Add a skill and press Enter"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                  size="small"
                  sx={{ flex: 1 }}
                />
                <Button variant="outlined" onClick={addSkill} startIcon={<AddIcon />} size="small">Add</Button>
              </Box>
              {form.skills.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                  {form.skills.map((s) => (
                    <Chip key={s} label={s} size="small" onDelete={() => removeSkill(s)} color="primary" variant="outlined" />
                  ))}
                </Box>
              )}
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              <Button variant="outlined" onClick={() => navigate('/recruiter/jobs')} sx={{ flex: 1 }}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={mutation.isLoading} sx={{ flex: 2 }}>
                {mutation.isLoading ? <CircularProgress size={20} color="inherit" /> : 'Post Job'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}