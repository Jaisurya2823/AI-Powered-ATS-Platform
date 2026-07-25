import { useState } from 'react';
import { Box, Typography, TextField, Grid, InputAdornment, Select, MenuItem, FormControl, InputLabel, Pagination } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useQuery } from '@tanstack/react-query';
import { getActiveJobs } from '../../api/jobApi';
import JobCard from '../../components/jobs/JobCard';
import { LoadingSpinner, PageError } from '../../components/common/LoadingSpinner';

const JOB_TYPES = ['', 'full-time', 'part-time', 'contract', 'internship', 'remote'];

export default function JobBoard() {
  const [search, setSearch] = useState('');
  const [jobType, setJobType] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['jobs', { search, jobType, page }],
    queryFn: () => getActiveJobs({ search: search || undefined, jobType: jobType || undefined, page, limit: 9 }).then((r) => r.data),
    keepPreviousData: true,
  });

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>Find Your Next Role</Typography>
        <Typography color="text.secondary">Browse {data?.total || 0} open positions</Typography>
      </Box>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search jobs, skills..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          sx={{ flexGrow: 1, minWidth: 220 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
        />
        <FormControl sx={{ minWidth: 160 }}>
          <InputLabel>Job Type</InputLabel>
          <Select value={jobType} label="Job Type" onChange={(e) => { setJobType(e.target.value); setPage(1); }}>
            {JOB_TYPES.map((t) => <MenuItem key={t} value={t}>{t || 'All Types'}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      {isLoading && <LoadingSpinner message="Loading jobs..." />}
      {isError && <PageError message="Failed to load jobs." onRetry={refetch} />}

      {!isLoading && !isError && (
        <>
          {data?.jobs?.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography color="text.secondary">No jobs found. Try a different search.</Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {data?.jobs?.map((job) => (
                <Grid item xs={12} sm={6} md={4} key={job._id}>
                  <JobCard job={job} />
                </Grid>
              ))}
            </Grid>
          )}

          {data?.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination count={data.totalPages} page={page} onChange={(_, v) => setPage(v)} color="primary" />
            </Box>
          )}
        </>
      )}
    </Box>
  );
}