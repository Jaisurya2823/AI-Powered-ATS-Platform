import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Typography, Chip, Box, Button } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';
import PeopleIcon from '@mui/icons-material/People';

const jobTypeColors = {
  'full-time': 'primary',
  'part-time': 'secondary',
  contract: 'warning',
  internship: 'success',
  remote: 'info',
};

export default function JobCard({ job }) {
  const navigate = useNavigate();

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: 6 } }}>
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Box>
          <Typography variant="h6" fontWeight={600} gutterBottom>{job.title}</Typography>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            {job.recruiter?.company || 'Company'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <LocationOnIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">{job.location}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <WorkIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
            <Chip label={job.jobType} size="small" color={jobTypeColors[job.jobType] || 'default'} />
          </Box>
          {job.applicationCount > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <PeopleIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">{job.applicationCount} applicants</Typography>
            </Box>
          )}
        </Box>

        {job.skills?.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {job.skills.slice(0, 4).map((skill) => (
              <Chip key={skill} label={skill} size="small" variant="outlined" sx={{ fontSize: 11 }} />
            ))}
            {job.skills.length > 4 && (
              <Chip label={`+${job.skills.length - 4}`} size="small" variant="outlined" sx={{ fontSize: 11 }} />
            )}
          </Box>
        )}

        <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {job.description}
        </Typography>

        <Button variant="contained" size="small" onClick={() => navigate(`/jobs/${job._id}`)} sx={{ mt: 'auto' }}>
          View Job
        </Button>
      </CardContent>
    </Card>
  );
}