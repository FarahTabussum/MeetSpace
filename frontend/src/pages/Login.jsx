import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Box, TextField, Button, Typography, Paper, Alert, CircularProgress,
  InputAdornment, IconButton, Divider,
} from '@mui/material';
import {
  Email, Lock, Visibility, VisibilityOff, Login as LoginIcon,
  ArrowBack, MeetingRoom,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../api/axios';
import Navbar from '../components/Navbar';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login/', { email, password });
      const { user, tokens } = res.data;

      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);
      localStorage.setItem('user', JSON.stringify(user));

      if (user.must_change_password) {
        navigate('/change-password');
      } else {
        navigate(user.role === 'HR-Admin' ? '/admin/dashboard' : '/employee/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9ff' }}>
      <Navbar />

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 6, px: 2 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ width: '100%', maxWidth: 440 }}
        >
          <Paper elevation={8} sx={{ borderRadius: 4, overflow: 'hidden' }}>
            {/* Header */}
            <Box sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', p: 4, textAlign: 'center', color: 'white' }}>
              <Box sx={{ width: 56, height: 56, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                <MeetingRoom sx={{ fontSize: 32 }} />
              </Box>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Welcome Back
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Sign in to access your dashboard
              </Typography>
            </Box>

            {/* Form */}
            <Box sx={{ p: 4 }}>
              {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <LoginIcon />}
                  sx={{
                    mt: 3, py: 1.5, borderRadius: 3, textTransform: 'none', fontWeight: 'bold', fontSize: '1.1rem',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 4px 15px rgba(102,126,234,0.4)',
                  }}
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Don't have an account?
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/register')}
                  sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 'bold' }}
                >
                  Create Account
                </Button>
              </Box>

              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Button startIcon={<ArrowBack />} onClick={() => navigate('/')} size="small" sx={{ textTransform: 'none' }}>
                  Back to Home
                </Button>
              </Box>
            </Box>
          </Paper>
        </motion.div>
      </Box>
    </Box>
  );
}
