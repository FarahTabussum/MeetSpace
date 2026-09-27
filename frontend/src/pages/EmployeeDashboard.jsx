import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Box, Typography, Paper, Grid, Card, CardContent, Chip, CircularProgress,
  List, ListItem, ListItemText, Divider, IconButton, Button,
} from '@mui/material';
import {
  ArrowBack, Event, Schedule, Cancel, Add, MeetingRoom,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../api/axios';

export default function EmployeeDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/auth/dashboard/employee/');
        setData(res.data);
      } catch (err) {
        toast.error('Failed to load dashboard.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const { stats, upcoming_bookings } = data;

  const statCards = [
    { label: 'Upcoming Bookings', value: stats.upcoming_count, icon: <Event />, color: '#1976d2' },
    { label: 'Past Bookings', value: stats.past_bookings, icon: <Schedule />, color: '#388e3c' },
    { label: 'Cancelled Bookings', value: stats.cancelled_bookings, icon: <Cancel />, color: '#d32f2f' },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate(-1)}><ArrowBack /></IconButton>
          <Typography variant="h5" fontWeight="bold">My Dashboard</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/employee/book')}>
          Book a Room
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((card, i) => (
          <Grid item xs={12} md={4} key={i}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card elevation={2} sx={{ borderTop: `4px solid ${card.color}` }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Box sx={{ color: card.color }}>{card.icon}</Box>
                    <Typography variant="h4" fontWeight="bold">{card.value}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">{card.label}</Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Upcoming Bookings */}
      <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>Upcoming Bookings</Typography>
        <List>
          {upcoming_bookings.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <MeetingRoom sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
              <Typography color="text.secondary">No upcoming bookings.</Typography>
              <Button variant="outlined" size="small" sx={{ mt: 1 }} onClick={() => navigate('/employee/book')}>
                Book a Room
              </Button>
            </Box>
          ) : (
            upcoming_bookings.map((b, i) => (
              <Box key={b.id}>
                <ListItem>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                    <Event color="primary" />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" fontWeight="medium">{b.meeting_title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Room {b.room} | {b.date} | {b.start_time}-{b.end_time}
                      </Typography>
                    </Box>
                    <Chip label="Active" color="success" size="small" />
                  </Box>
                </ListItem>
                {i < upcoming_bookings.length - 1 && <Divider />}
              </Box>
            ))
          )}
        </List>
      </Paper>
    </Box>
  );
}
