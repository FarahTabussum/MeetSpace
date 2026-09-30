import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box, Typography, Paper, Grid, Card, CardContent, Chip, CircularProgress,
  List, ListItem, Divider, Button, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Alert, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Radio, RadioGroup,
  FormControlLabel,
} from '@mui/material';
import {
  Event, Schedule, Cancel, Add, MeetingRoom, CheckCircle,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../api/axios';
import EmployeeLayout from '../components/EmployeeLayout';

const statusLabels = {
  pending: 'In Progress',
  approved: 'Approved',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
  alternatives: 'Alternatives',
};

const statusColors = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
  cancelled: 'default',
  alternatives: 'info',
};

export default function EmployeeDashboard() {
  const [data, setData] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const navigate = useNavigate();

  // Alternatives modal state
  const [altModalOpen, setAltModalOpen] = useState(false);
  const [altBooking, setAltBooking] = useState(null);
  const [selectedAltIndex, setSelectedAltIndex] = useState(null);
  const [altProcessing, setAltProcessing] = useState(false);

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

  useEffect(() => { fetchData(); }, []);

  const openCancelDialog = (booking) => {
    setSelectedBooking(booking);
    setCancelReason('');
    setCancelDialogOpen(true);
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      toast.error('Cancellation reason is required.');
      return;
    }
    setCancelling(true);
    try {
      await api.post(`/bookings/${selectedBooking.id}/cancel/`, { reason: cancelReason });
      toast.success('Booking cancelled successfully.');
      setCancelDialogOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Cancellation failed.');
    } finally {
      setCancelling(false);
    }
  };

  const openAltModal = (booking) => {
    setAltBooking(booking);
    setSelectedAltIndex(null);
    setAltModalOpen(true);
  };

  const handleAcceptAlternative = async () => {
    if (selectedAltIndex === null) {
      toast.error('Please select an alternative.');
      return;
    }
    setAltProcessing(true);
    try {
      await api.post(`/bookings/${altBooking.id}/accept-alternative/`, {
        alternative_index: selectedAltIndex,
      });
      toast.success('Alternative accepted. Booking updated.');
      setAltModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to accept alternative.');
    } finally {
      setAltProcessing(false);
    }
  };

  const handleRejectAlternatives = async () => {
    setAltProcessing(true);
    try {
      await api.post(`/bookings/${altBooking.id}/reject-alternative/`);
      toast.success('Alternatives rejected.');
      setAltModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to reject alternatives.');
    } finally {
      setAltProcessing(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const { stats } = data;
  const activeBookings = bookings.filter((b) => ['pending', 'approved', 'alternatives'].includes(b.status));
  const cancelledBookings = bookings.filter((b) => ['cancelled', 'rejected'].includes(b.status));

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

      {/* Active Bookings Table */}
      <Paper elevation={2} sx={{ p: 3, borderRadius: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Active Bookings ({activeBookings.length})</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'primary.main' }}>
                <TableCell sx={{ color: 'white' }}>Meeting Title</TableCell>
                <TableCell sx={{ color: 'white' }}>Room</TableCell>
                <TableCell sx={{ color: 'white' }}>Date</TableCell>
                <TableCell sx={{ color: 'white' }}>Time</TableCell>
                <TableCell sx={{ color: 'white' }}>Participants</TableCell>
                <TableCell sx={{ color: 'white' }}>Status</TableCell>
                <TableCell sx={{ color: 'white' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {activeBookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Box sx={{ py: 3 }}>
                      <MeetingRoom sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
                      <Typography color="text.secondary">No active bookings.</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                activeBookings.map((b) => (
                  <TableRow key={b.id} hover>
                    <TableCell>{b.meeting_title}</TableCell>
                    <TableCell>{b.room_details?.room_number || b.room}</TableCell>
                    <TableCell>{b.date}</TableCell>
                    <TableCell>{b.start_time}-{b.end_time}</TableCell>
                    <TableCell>{b.number_of_participants}</TableCell>
                    <TableCell>
                      <Chip
                        label={statusLabels[b.status] || b.status}
                        color={statusColors[b.status] || 'default'}
                        size="small"
                        sx={{ cursor: b.status === 'alternatives' ? 'pointer' : 'default' }}
                        onClick={b.status === 'alternatives' ? () => openAltModal(b) : undefined}
                      />
                    </TableCell>
                    <TableCell>
                      {b.status !== 'approved' && (
                        <IconButton onClick={() => openCancelDialog(b)} color="error" size="small">
                          <Cancel />
                        </IconButton>
                      )}
                      {b.status === 'approved' && (
                        <IconButton onClick={() => openCancelDialog(b)} color="error" size="small">
                          <Cancel />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Cancelled Bookings */}
      <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Cancelled Bookings ({cancelledBookings.length})</Typography>
          {cancelledBookings.length > 0 && (
            <Button variant="outlined" color="error" size="small" onClick={() => { setBookings(bookings.filter((b) => !['cancelled', 'rejected'].includes(b.status))); toast.success('Cancelled bookings cleared.'); }}>
              Clear All
            </Button>
          )}
        </Box>
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
                    <Chip label={statusLabels[b.status] || b.status} color={statusColors[b.status] || 'default'} size="small" />
                  </Box>
                </ListItem>
                {i < cancelledBookings.length - 1 && <Divider />}
              </Box>
            ))
          )}
        </List>
      </Paper>

      {/* Cancel Dialog */}
      <AnimatePresence>
        {cancelDialogOpen && selectedBooking && (
          <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)} maxWidth="sm" fullWidth
            component={motion.div}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                <Alert severity="info" action={
                  <Button color="inherit" size="small" onClick={() => setSelectedBooking(null)}>
                    Clear
                  </Button>
                }>
                  <strong>{selectedBooking.meeting_title}</strong><br />
                  {selectedBooking.room_details?.room_number} | {selectedBooking.date} | {selectedBooking.start_time} - {selectedBooking.end_time}
                </Alert>
                <TextField
                  fullWidth
                  label="Cancellation Reason"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  multiline
                  rows={3}
                  required
                  placeholder="Please provide a reason for cancellation"
                />
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setCancelDialogOpen(false)}>Keep Booking</Button>
              <Button onClick={handleCancel} variant="contained" color="error" disabled={cancelling}>
                {cancelling ? <CircularProgress size={20} /> : 'Confirm Cancellation'}
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </AnimatePresence>

      {/* Alternatives Modal */}
      <AnimatePresence>
        {altModalOpen && altBooking && (
          <Dialog open={altModalOpen} onClose={() => setAltModalOpen(false)} maxWidth="sm" fullWidth
            component={motion.div}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <DialogTitle>Alternative Booking Options</DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                <Alert severity="info">
                  The admin has suggested alternative options for your booking. Please select one to accept, or reject all.
                </Alert>

                {altBooking.alternatives && altBooking.alternatives.length > 0 ? (
                  <RadioGroup value={selectedAltIndex} onChange={(e) => setSelectedAltIndex(Number(e.target.value))}>
                    {altBooking.alternatives.map((alt, i) => (
                      <Paper
                        key={i}
                        variant="outlined"
                        sx={{
                          p: 2,
                          mb: 1,
                          borderRadius: 2,
                          cursor: 'pointer',
                          borderColor: selectedAltIndex === i ? 'primary.main' : 'divider',
                          borderWidth: selectedAltIndex === i ? 2 : 1,
                        }}
                        onClick={() => setSelectedAltIndex(i)}
                      >
                        <FormControlLabel
                          value={i}
                          control={<Radio />}
                          label={
                            <Box>
                              <Typography variant="subtitle2" fontWeight="bold">
                                Option {i + 1}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Room: {alt.room_number || alt.room || 'N/A'}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Date: {alt.date}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Time: {alt.start_time} - {alt.end_time}
                              </Typography>
                            </Box>
                          }
                          sx={{ width: '100%', alignItems: 'flex-start' }}
                        />
                      </Paper>
                    ))}
                  </RadioGroup>
                ) : (
                  <Typography color="text.secondary">No alternatives available.</Typography>
                )}

                <Typography variant="h6" fontWeight="bold" sx={{ mt: 2 }}>
                  Do you accept?
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2, gap: 1 }}>
              <Button onClick={() => setAltModalOpen(false)}>Cancel</Button>
              <Button onClick={handleRejectAlternatives} variant="outlined" color="error" disabled={altProcessing}>
                Reject All
              </Button>
              <Button onClick={handleAcceptAlternative} variant="contained" color="success" disabled={altProcessing || selectedAltIndex === null}>
                {altProcessing ? <CircularProgress size={20} /> : 'Accept'}
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </AnimatePresence>
    </EmployeeLayout>
  );
}
