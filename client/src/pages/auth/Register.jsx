import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Box, Card, CardContent, Typography, TextField, Button, Alert, ToggleButton, ToggleButtonGroup } from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import { registerUser } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [role, setRole] = useState('applicant');
  const [form, setForm] = useState({ name: '', email: '', password: '', company: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { setError('Name, email and password are required.'); return; }
    if (role === 'recruiter' && !form.company) { setError('Company name is required for recruiters.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }

    setLoading(true);
    try {
      const payload = { name: form.name, email: form.email, password: form.password, role };
      if (role === 'recruiter') payload.company = form.company;
      if (role === 'applicant' && form.phone) payload.phone = form.phone;

      const { data } = await registerUser(payload);
      login(data.token, data.user);
      navigate(role === 'recruiter' ? '/recruiter/dashboard' : '/applicant/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2, bgcolor: 'background.default' }}>
      <Card sx={{ width: '100%', maxWidth: 480 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" textAlign="center" fontWeight={700} gutterBottom>Create Account</Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>Join the ATS Platform</Typography>

          {/* Role Toggle */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <ToggleButtonGroup value={role} exclusive onChange={(_, v) => v && setRole(v)} size="small">
              <ToggleButton value="applicant" sx={{ px: 3 }}>
                <PersonIcon sx={{ mr: 1, fontSize: 18 }} /> Applicant
              </ToggleButton>
              <ToggleButton value="recruiter" sx={{ px: 3 }}>
                <BusinessIcon sx={{ mr: 1, fontSize: 18 }} /> Recruiter
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Full Name" name="name" value={form.name} onChange={handleChange} />
            <TextField label="Email" name="email" type="email" value={form.email} onChange={handleChange} />
            <TextField label="Password" name="password" type="password" value={form.password} onChange={handleChange} helperText="Minimum 6 characters" />
            {role === 'recruiter' && (
              <TextField label="Company Name" name="company" value={form.company} onChange={handleChange} />
            )}
            {role === 'applicant' && (
              <TextField label="Phone (optional)" name="phone" value={form.phone} onChange={handleChange} />
            )}
            <Button type="submit" variant="contained" size="large" disabled={loading} sx={{ mt: 1 }}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </Box>

          <Typography variant="body2" textAlign="center" mt={3} color="text.secondary">
            Already have an account?{' '}
            <Typography component={Link} to="/login" variant="body2" color="primary.main" sx={{ textDecoration: 'none', fontWeight: 600 }}>
              Sign In
            </Typography>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}