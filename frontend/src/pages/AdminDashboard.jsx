import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Box, Typography, Paper, Grid, Card, CardContent, Chip, CircularProgress,
  List, ListItem, ListItemText, Divider, IconButton,
} from '@mui/material';
import {
  ArrowBack, People, MeetingRoom, Event, Cancel, TrendingUp, Schedule,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../api/axios';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/auth/dashboard/admin/');
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

  const { stats, recent_bookings } = data;

  const statCards = [
    { label: 'Total Employees', value: stats.total_employees, icon: <People />, color: '#1976d2' },
    { label: 'Total Rooms', value: stats.total_rooms, icon: <MeetingRoom />, color: '#388e3c' },
    { label: "Today's Bookings", value: stats.total_bookings_today, icon: <Event />, color: '#f57c00' },
    { label: 'Upcoming Bookings', value: stats.upcoming_bookings, icon: <TrendingUp />, color: '#7b1fa2' },
    { label: 'Cancelled Bookings', value: stats.cancelled_bookings, icon: <Cancel />, color: '#d32f2f' },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate(-1)}><ArrowBack /></IconButton>
        <Typography variant="h5" fontWeight="bold">Admin Dashboard</Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((card, i) => (
          <Grid item xs={12} sm={6} md={4} lg={2.4} key={i}>
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

      {/* Recent Bookings */}
      <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>Recent Bookings</Typography>
        <List>
          {recent_bookings.length === 0 ? (
            <Typography color="text.secondary">No recent bookings.</Typography>
          ) : (
            recent_bookings.map((b, i) => (
              <Box key={b.id}>
                <ListItem>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                    <Schedule color="primary" />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" fontWeight="medium">{b.meeting_title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Room {b.room} | {b.date} | {b.start_time}-{b.end_time} | by {b.user}
                      </Typography>
                    </Box>
                    <Chip label="Active" color="success" size="small" />
                  </Box>
                </ListItem>
                {i < recent_bookings.length - 1 && <Divider />}
              </Box>
            ))
          )}
        </List>
      </Paper>
    </Box>
  );
}
