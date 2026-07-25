import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem, Avatar, Divider, Chip } from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import { COLORS } from '../../theme';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout, isLoggedIn, isRecruiter } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);

  const isActive = (path) => location.pathname.startsWith(path);

  const navBtnStyle = (path) => ({
    color: isActive(path) ? COLORS.primary : 'text.secondary',
    fontWeight: isActive(path) ? 600 : 400,
    position: 'relative',
    '&::after': isActive(path) ? {
      content: '""', position: 'absolute', bottom: -2, left: 8, right: 8,
      height: 2, borderRadius: 1, bgcolor: COLORS.primary,
    } : {},
  });

  const handleLogout = () => { logout(); setAnchorEl(null); navigate('/login'); };

  return (
    <AppBar position="sticky" elevation={0}
      sx={{ bgcolor: 'background.paper', borderBottom: `1px solid ${COLORS.border}`, backdropFilter: 'blur(8px)' }}>
      <Toolbar sx={{ gap: 0.5 }}>
        <Box component={Link} to="/" sx={{ display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'none', mr: 2 }}>
          <Box sx={{ p: 0.6, borderRadius: 1.5, bgcolor: `${COLORS.primary}20`, display: 'flex' }}>
            <WorkIcon sx={{ fontSize: 20, color: COLORS.primary }} />
          </Box>
          <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 700, fontSize: 17 }}>
            ATS<span style={{ color: COLORS.primary }}>Pro</span>
          </Typography>
        </Box>

        <Button component={Link} to="/jobs" sx={navBtnStyle('/jobs')}>Jobs</Button>

        {isLoggedIn && isRecruiter && (
          <>
            <Button component={Link} to="/recruiter/dashboard" sx={navBtnStyle('/recruiter/dashboard')}>Dashboard</Button>
            <Button component={Link} to="/recruiter/jobs" sx={navBtnStyle('/recruiter/jobs')}>My Jobs</Button>
          </>
        )}
        {isLoggedIn && !isRecruiter && (
          <Button component={Link} to="/applicant/dashboard" sx={navBtnStyle('/applicant')}>Dashboard</Button>
        )}

        <Box sx={{ flexGrow: 1 }} />

        {!isLoggedIn ? (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button component={Link} to="/login" variant="outlined" size="small" sx={{ borderColor: COLORS.border }}>Login</Button>
            <Button component={Link} to="/register" variant="contained" size="small">Register</Button>
          </Box>
        ) : (
          <>
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small" sx={{ ml: 1 }}>
              <Avatar sx={{ width: 34, height: 34, bgcolor: COLORS.primary, fontSize: 13, fontWeight: 700 }}>
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
              PaperProps={{ sx: { mt: 1, minWidth: 180 } }}>
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="body2" fontWeight={600}>{user?.name}</Typography>
                <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
                <Box mt={0.8}><Chip label={user?.role} size="small" color="primary" /></Box>
              </Box>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main', gap: 1 }}>Logout</MenuItem>
            </Menu>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}