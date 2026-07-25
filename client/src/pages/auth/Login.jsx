import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Box, Card, CardContent, Typography, TextField, Button, Alert, InputAdornment, IconButton } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import WorkIcon from '@mui/icons-material/Work';
import { loginUser } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../theme';

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoggedIn, isRecruiter } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  if (isLoggedIn) {
    navigate(isRecruiter ? '/recruiter/dashboard' : '/applicant/dashboard', { replace: true });
    return null;
  }

  const handleChange = (e) => { setForm((p) => ({ ...p, [e.target.name]: e.target.value })); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Email and password are required.'); return; }
    setLoading(true);
    try {
      const { data } = await loginUser(form);
      login(data.token, data.user);
      navigate(data.user.role === 'recruiter' ? '/recruiter/dashboard' : '/applicant/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2, bgcolor: 'background.default',
      backgroundImage: `radial-gradient(ellipse at 20% 50%, ${COLORS.primary}10 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, ${COLORS.secondary}08 0%, transparent 50%)` }}>
      <Card sx={{ width: '100%', maxWidth: 420, boxShadow: 6 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3.5 }}>
            <Box sx={{ display: 'inline-flex', p: 1.5, borderRadius: 2.5, bgcolor: `${COLORS.primary}20`, mb: 2 }}>
              <WorkIcon sx={{ fontSize: 28, color: COLORS.primary }} />
            </Box>
            <Typography variant="h5" fontWeight={700}>Welcome back</Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>Sign in to your ATS account</Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2.5 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Email address" name="email" type="email" value={form.email} onChange={handleChange} autoComplete="email" autoFocus />
            <TextField
              label="Password" name="password" type={showPass ? 'text' : 'password'} value={form.password} onChange={handleChange}
              autoComplete="current-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPass((p) => !p)} size="small">
                      {showPass ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button type="submit" variant="contained" size="large" disabled={loading} sx={{ mt: 0.5, py: 1.2 }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </Box>

          <Typography variant="body2" textAlign="center" mt={3} color="text.secondary">
            Don't have an account?{' '}
            <Typography component={Link} to="/register" variant="body2" color="primary.main" sx={{ textDecoration: 'none', fontWeight: 600 }}>
              Create account
            </Typography>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}