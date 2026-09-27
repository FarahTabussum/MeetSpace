import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AppBar, Toolbar, Typography, Button, Box, Container, Chip,
} from '@mui/material';
import {
  MeetingRoom, Login, PersonAdd, Logout, Dashboard, Home,
} from '@mui/icons-material';
import api from '../api/axios';
import { toast } from 'react-toastify';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const isLoggedIn = !!localStorage.getItem('access_token');

  const handleLogout = async () => {
    try {
      const refresh = localStorage.getItem('refresh_token');
      await api.post('/auth/logout/', { refresh });
    } catch (err) {
      // silent fail
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully.');
    navigate('/');
  };

  return (
    <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between', py: 0.5 }}>
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }} onClick={() => navigate('/')}>
            <Box sx={{ width: 36, height: 36, borderRadius: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MeetingRoom sx={{ color: 'white', fontSize: 22 }} />
            </Box>
            <Typography variant="h6" fontWeight="bold" sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              MeetSpace
            </Typography>
          </Box>

          {/* Nav Links */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              onClick={() => navigate('/')}
              startIcon={<Home />}
              sx={{
                color: location.pathname === '/' ? 'primary.main' : 'text.primary',
                fontWeight: location.pathname === '/' ? 'bold' : 'normal',
                borderRadius: 2,
                px: 2,
                textTransform: 'none',
              }}
            >
              Home
            </Button>
            {isLoggedIn && (
              <Button
                onClick={() => navigate(user?.role === 'HR-Admin' ? '/admin/dashboard' : '/employee/dashboard')}
                startIcon={<Dashboard />}
                sx={{
                  color: 'text.primary',
                  fontWeight: 'normal',
                  borderRadius: 2,
                  px: 2,
                  textTransform: 'none',
                }}
              >
                Dashboard
              </Button>
            )}
          </Box>

          {/* Auth Buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isLoggedIn ? (
              <>
                <Chip
                  label={user?.role === 'HR-Admin' ? 'Admin' : 'Employee'}
                  color={user?.role === 'HR-Admin' ? 'secondary' : 'primary'}
                  size="small"
                  sx={{ fontWeight: 'bold' }}
                />
                <Button
                  variant="outlined"
                  startIcon={<Logout />}
                  onClick={handleLogout}
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outlined"
                  startIcon={<Login />}
                  onClick={() => navigate('/login')}
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}
                >
                  Login
                </Button>
                <Button
                  variant="contained"
                  startIcon={<PersonAdd />}
                  onClick={() => navigate('/register')}
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'bold', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                >
                  Register
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
