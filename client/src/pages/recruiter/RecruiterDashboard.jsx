import { useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CardContent, Grid, Button, Chip } from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import PeopleIcon from '@mui/icons-material/People';
import AddIcon from '@mui/icons-material/Add';
import { useQuery } from '@tanstack/react-query';
import { getMyJobs } from '../../api/jobApi';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

const StatCard = ({ icon, label, value, color }) => (
  <Card>
    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: `${color}.main`, display: 'flex', opacity: 0.9 }}>{icon}</Box>
      <Box>
        <Typography variant="h4" fontWeight={700}>{value ?? '—'}</Typography>
        <Typography variant="body2" color="text.secondary">{label}</Typography>
      </Box>
    </CardContent>
  </Card>
);

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['my-jobs'],
    queryFn: () => getMyJobs({ limit: 5 }).then((r) => r.data),
  });

  const totalApplications = data?.jobs?.reduce((sum, j) => sum + (j.applicationCount || 0), 0) || 0;
  const activeJobs = data?.jobs?.filter((j) => j.status === 'active').length || 0;

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Welcome, {user?.name?.split(' ')[0]} 👋</Typography>
          <Typography color="text.secondary">{user?.company}</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/recruiter/jobs/create')}>
          Post a Job
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <StatCard icon={<WorkIcon sx={{ color: '#fff' }} />} label="Active Jobs" value={activeJobs} color="primary" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard icon={<PeopleIcon sx={{ color: '#fff' }} />} label="Total Applications" value={totalApplications} color="secondary" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard icon={<WorkIcon sx={{ color: '#fff' }} />} label="Total Jobs Posted" value={data?.total || 0} color="success" />
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight={600}>Recent Job Postings</Typography>
            <Button size="small" onClick={() => navigate('/recruiter/jobs')}>View All</Button>
          </Box>

          {isLoading ? <LoadingSpinner /> : data?.jobs?.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary" gutterBottom>No jobs posted yet</Typography>
              <Button variant="contained" onClick={() => navigate('/recruiter/jobs/create')}>Post Your First Job</Button>
            </Box>
          ) : (
            data?.jobs?.map((job) => (
              <Box key={job._id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5, borderBottom: '1px solid rgba(148,163,184,0.1)' }}>
                <Box>
                  <Typography variant="body1" fontWeight={500}>{job.title}</Typography>
                  <Typography variant="caption" color="text.secondary">{job.location} · {job.applicationCount || 0} applicants</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip label={job.status} size="small" color={job.status === 'active' ? 'success' : 'default'} />
                  <Button size="small" onClick={() => navigate(`/recruiter/jobs/${job._id}/applications`)}>View</Button>
                </Box>
              </Box>
            ))
          )}
        </CardContent>
      </Card>
    </Box>
  );
}