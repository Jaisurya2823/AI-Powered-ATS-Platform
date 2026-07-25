import { Box, CircularProgress, Typography, Button } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

export const LoadingSpinner = ({ message = 'Loading...' }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '40vh', gap: 2 }}>
    <CircularProgress color="primary" />
    <Typography color="text.secondary">{message}</Typography>
  </Box>
);

export const PageError = ({ message = 'Something went wrong.', onRetry }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '40vh', gap: 2 }}>
    <ErrorOutlineIcon sx={{ fontSize: 48, color: 'error.main' }} />
    <Typography color="text.secondary" textAlign="center">{message}</Typography>
    {onRetry && <Button variant="outlined" onClick={onRetry}>Try Again</Button>}
  </Box>
);