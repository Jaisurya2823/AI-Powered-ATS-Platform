import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CardContent, Button, Chip, IconButton, Menu, MenuItem, Pagination, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PeopleIcon from '@mui/icons-material/People';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyJobs, archiveJob } from '../../api/jobApi';
import { useSnackbar } from '../../context/SnackbarContext';
import { LoadingSpinner, PageError } from '../../components/common/LoadingSpinner';
import { COLORS } from '../../theme';

export default function MyJobs() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { showSnackbar } = useSnackbar();
  const [page, setPage] = useState(1);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['my-jobs', page],
    queryFn: () => getMyJobs({ page, limit: 10 }).then((r) => r.data),
  });

  const archiveMutation = useMutation({
    mutationFn: (id) => archiveJob(id),
    onSuccess: () => {
      qc.invalidateQueries(['my-jobs']);
      showSnackbar('Job archived successfully.');
      setMenuAnchor(null);
    },
    onError: (err) => {
      showSnackbar(err.response?.data?.message || 'Failed to archive job.', 'error');
      setMenuAnchor(null);
    },
  });

  const openMenu = (e, job) => { e.stopPropagation(); setMenuAnchor(e.currentTarget); setSelectedJob(job); };
  const closeMenu = () => { setMenuAnchor(null); setSelectedJob(null); };

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>My Job Postings</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>{data?.total || 0} total jobs</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/recruiter/jobs/create')}>
          Post Job
        </Button>
      </Box>

      {isLoading && <LoadingSpinner />}
      {isError && <PageError message="Failed to load jobs." onRetry={refetch} />}

      {!isLoading && !isError && data?.jobs?.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 10, border: `1px dashed ${COLORS.border}`, borderRadius: 3 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>No jobs posted yet</Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>Start hiring by posting your first job</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/recruiter/jobs/create')}>
            Post Your First Job
          </Button>
        </Box>
      )}

      {data?.jobs?.map((job) => (
        <Card key={job._id} sx={{ mb: 2, '&:hover': { boxShadow: 4 } }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 0.8 }}>
                  <Typography variant="h6" fontWeight={600} noWrap>{job.title}</Typography>
                  <Chip
                    label={job.status}
                    size="small"
                    color={job.status === 'active' ? 'success' : job.status === 'draft' ? 'warning' : 'default'}
                  />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <LocationOnIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">{job.location}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <PeopleIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">{job.applicationCount || 0} applicants</Typography>
                  </Box>
                  <Chip label={job.jobType} size="small" variant="outlined" />
                </Box>
                {job.skills?.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {job.skills.slice(0, 5).map((s) => <Chip key={s} label={s} size="small" variant="outlined" sx={{ fontSize: 11 }} />)}
                    {job.skills.length > 5 && <Chip label={`+${job.skills.length - 5}`} size="small" variant="outlined" sx={{ fontSize: 11 }} />}
                  </Box>
                )}
              </Box>

              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexShrink: 0 }}>
                <Button size="small" variant="outlined" onClick={() => navigate(`/recruiter/jobs/${job._id}/applications`)}>
                  Applications
                </Button>
                <Button size="small" variant="outlined" color="secondary" onClick={() => navigate(`/recruiter/jobs/${job._id}/rankings`)}>
                  AI Rankings
                </Button>
                <IconButton size="small" onClick={(e) => openMenu(e, job)}>
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </CardContent>
        </Card>
      ))}

      {data?.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination count={data.totalPages} page={page} onChange={(_, v) => setPage(v)} color="primary" />
        </Box>
      )}

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
        <MenuItem onClick={() => { navigate(`/recruiter/jobs/${selectedJob?._id}/edit`); closeMenu(); }}>
          Edit Job
        </MenuItem>
        <MenuItem
          sx={{ color: 'error.main' }}
          onClick={() => { if (selectedJob) archiveMutation.mutate(selectedJob._id); }}
          disabled={archiveMutation.isLoading}
        >
          Archive Job
        </MenuItem>
      </Menu>
    </Box>
  );
}