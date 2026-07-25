// ApplicantDashboard.jsx
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CardContent, Button, Chip, Avatar } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { getMyApplications } from '../../api/applicationApi';
import { useAuth } from '../../context/AuthContext';
import { StatusChip } from '../../components/applications/StatusChip';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export function ApplicantDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['my-applications'],
    queryFn: () => getMyApplications({ limit: 5 }).then((r) => r.data),
  });

  const statusCount = (status) => data?.applications?.filter((a) => a.status === status).length || 0;

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Welcome, {user?.name?.split(' ')[0]} 👋</Typography>
          <Typography color="text.secondary">Track your job applications</Typography>
        </Box>
        <Button variant="contained" onClick={() => navigate('/jobs')}>Browse Jobs</Button>
      </Box>

      {/* Stats */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
        {[
          { label: 'Total Applied', value: data?.total || 0, color: 'primary.main' },
          { label: 'In Interview', value: statusCount('interview'), color: 'warning.main' },
          { label: 'Offers', value: statusCount('offered'), color: 'success.main' },
        ].map((s) => (
          <Card key={s.label} sx={{ flex: '1 1 140px', minWidth: 140 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" fontWeight={700} sx={{ color: s.color }}>{s.value}</Typography>
              <Typography variant="body2" color="text.secondary">{s.label}</Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Recent Applications */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" fontWeight={600}>Recent Applications</Typography>
            <Button size="small" onClick={() => navigate('/applicant/applications')}>View All</Button>
          </Box>

          {isLoading ? <LoadingSpinner /> : data?.applications?.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary" gutterBottom>No applications yet</Typography>
              <Button variant="contained" onClick={() => navigate('/jobs')}>Browse Jobs</Button>
            </Box>
          ) : (
            data?.applications?.map((app) => (
              <Box key={app._id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5, borderBottom: '1px solid rgba(148,163,184,0.1)' }}>
                <Box>
                  <Typography fontWeight={500}>{app.job?.title}</Typography>
                  <Typography variant="caption" color="text.secondary">{app.job?.recruiter?.company} · {new Date(app.createdAt).toLocaleDateString()}</Typography>
                </Box>
                <StatusChip status={app.status} />
              </Box>
            ))
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

// MyApplications.jsx
export function MyApplications() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['my-applications-full'],
    queryFn: () => getMyApplications({ limit: 50 }).then((r) => r.data),
  });

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>My Applications</Typography>
        <Button variant="contained" onClick={() => navigate('/jobs')}>Browse More Jobs</Button>
      </Box>

      {isLoading ? <LoadingSpinner /> : data?.applications?.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography color="text.secondary" gutterBottom>You haven't applied to any jobs yet.</Typography>
          <Button variant="contained" onClick={() => navigate('/jobs')}>Browse Jobs</Button>
        </Box>
      ) : (
        data?.applications?.map((app) => (
          <Card key={app._id} sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 44, height: 44 }}>{app.job?.title?.charAt(0)}</Avatar>
                  <Box>
                    <Typography fontWeight={600}>{app.job?.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{app.job?.recruiter?.company}</Typography>
                    <Typography variant="caption" color="text.secondary">Applied {new Date(app.createdAt).toLocaleDateString()}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Chip label={app.job?.location} size="small" variant="outlined" />
                  <StatusChip status={app.status} />
                  <Button size="small" href={app.resumeUrl} target="_blank" rel="noopener noreferrer">Resume</Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );
}