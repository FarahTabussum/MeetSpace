import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Grid, Card, CardContent, Chip, CircularProgress,
  List, ListItem, Divider, Button, IconButton,
} from '@mui/material';
import {
  Event, Schedule, Cancel, Add, MeetingRoom, ArrowBack,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../api/axios';
import EmployeeLayout from '../components/EmployeeLayout';

export default function EmployeeDashboard() {
  const [data, setData] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboardRes, bookingsRes] = await Promise.all([
          api.get('/auth/dashboard/employee/'),
          api.get('/bookings/'),
        ]);
        setData(dashboardRes.data);
        setBookings(bookingsRes.data);
      } catch (err) {
        toast.error('Failed to load dashboard.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const { stats, upcoming_bookings } = data;
  const activeBookings = bookings.filter((b) => b.status === 'active');
  const cancelledBookings = bookings.filter((b) => b.status === 'cancelled');

  const statCards = [
    { label: 'Upcoming Bookings', value: stats.upcoming_count, icon: <Event />, color: '#667eea' },
    { label: 'Past Bookings', value: stats.past_bookings, icon: <Schedule />, color: '#11998e' },
    { label: 'Cancelled Bookings', value: stats.cancelled_bookings, icon: <Cancel />, color: '#d32f2f' },
  ];

  return (
    <EmployeeLayout>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">My Dashboard</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/employee/book')}
          sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 'bold', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
        >
          Book a Room
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((card, i) => (
          <Grid item xs={12} md={4} key={i}>
            <Card elevation={2} sx={{ borderRadius: 3, borderTop: `4px solid ${card.color}` }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Box sx={{ color: card.color }}>{card.icon}</Box>
                  <Typography variant="h4" fontWeight="bold">{card.value}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">{card.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Active Bookings */}
      <Paper elevation={2} sx={{ p: 3, borderRadius: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Active Bookings ({activeBookings.length})</Typography>
        <List>
          {activeBookings.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <MeetingRoom sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
              <Typography color="text.secondary">No active bookings.</Typography>
              <Button variant="outlined" size="small" sx={{ mt: 1 }} onClick={() => navigate('/employee/book')}>
                Book a Room
              </Button>
            </Box>
          ) : (
            activeBookings.map((b, i) => (
              <Box key={b.id}>
                <ListItem>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                    <Event color="primary" />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" fontWeight="medium">{b.meeting_title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Room {b.room_details?.room_number || b.room} | {b.date} | {b.start_time}-{b.end_time} | {b.number_of_participants} participants
                      </Typography>
                    </Box>
                    <Chip label="Active" color="success" size="small" />
                  </Box>
                </ListItem>
                {i < activeBookings.length - 1 && <Divider />}
              </Box>
            ))
          )}
        </List>
      </Paper>

      {/* Cancelled Bookings */}
      <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h6" gutterBottom>Cancelled Bookings ({cancelledBookings.length})</Typography>
        <List>
          {cancelledBookings.length === 0 ? (
            <Typography color="text.secondary">No cancelled bookings.</Typography>
          ) : (
            cancelledBookings.map((b, i) => (
              <Box key={b.id}>
                <ListItem>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                    <Cancel color="error" />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" fontWeight="medium">{b.meeting_title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Room {b.room_details?.room_number || b.room} | {b.date} | {b.start_time}-{b.end_time}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        Reason: {b.cancellation_reason}
                      </Typography>
                    </Box>
                    <Chip label="Cancelled" color="default" size="small" />
                  </Box>
                </ListItem>
                {i < cancelledBookings.length - 1 && <Divider />}
              </Box>
            ))
          )}
        </List>
      </Paper>
    </EmployeeLayout>
  );
}
