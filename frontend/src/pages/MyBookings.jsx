import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, CircularProgress, IconButton, Alert,
} from '@mui/material';
import {
  ArrowBack, Cancel, MeetingRoom, Schedule, People, CheckCircle, FilterList,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../api/axios';
import EmployeeLayout from '../components/EmployeeLayout';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [filterDate, setFilterDate] = useState('');
  const navigate = useNavigate();

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings/');
      setBookings(res.data);
    } catch (err) {
      toast.error('Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

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
      fetchBookings();
    } catch (err) {
      const msg = err.response?.data?.error || 'Cancellation failed.';
      toast.error(msg);
    } finally {
      setCancelling(false);
    }
  };

  const activeBookings = bookings.filter((b) => b.status === 'active');
  const cancelledBookings = bookings.filter((b) => b.status === 'cancelled');

  return (
    <EmployeeLayout>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate(-1)}><ArrowBack /></IconButton>
        <Typography variant="h5" fontWeight="bold">My Bookings</Typography>
      </Box>

      {/* Filter */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          label="Filter by Date" type="date" value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          size="small"
          sx={{ minWidth: 200, ml: 0.5 }}
        />
        {filterDate && (
          <Button variant="outlined" size="small" onClick={() => setFilterDate('')}>
            Clear Filter
          </Button>
        )}
      </Box>

      {/* Active Bookings */}
      <Typography variant="h6" gutterBottom>Active Bookings ({activeBookings.length})</Typography>
      <TableContainer component={Paper} elevation={2} sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.main' }}>
              <TableCell sx={{ color: 'white' }}>Meeting Title</TableCell>
              <TableCell sx={{ color: 'white' }}>Room</TableCell>
              <TableCell sx={{ color: 'white' }}>Date</TableCell>
              <TableCell sx={{ color: 'white' }}>Time</TableCell>
              <TableCell sx={{ color: 'white' }}>Participants</TableCell>
              <TableCell sx={{ color: 'white' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center"><CircularProgress /></TableCell>
              </TableRow>
            ) : activeBookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">No active bookings.</TableCell>
              </TableRow>
            ) : (
              activeBookings.map((booking) => (
                <TableRow key={booking.id} hover>
                  <TableCell>{booking.meeting_title}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <MeetingRoom color="primary" fontSize="small" />
                      {booking.room_details?.room_number || booking.room}
                    </Box>
                  </TableCell>
                  <TableCell>{booking.date}</TableCell>
                  <TableCell>{booking.start_time} - {booking.end_time}</TableCell>
                  <TableCell>{booking.number_of_participants}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => openCancelDialog(booking)} color="error">
                      <Cancel />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Cancelled Bookings */}
      <Typography variant="h6" gutterBottom>Cancelled Bookings ({cancelledBookings.length})</Typography>
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.700' }}>
              <TableCell sx={{ color: 'white' }}>Meeting Title</TableCell>
              <TableCell sx={{ color: 'white' }}>Room</TableCell>
              <TableCell sx={{ color: 'white' }}>Date</TableCell>
              <TableCell sx={{ color: 'white' }}>Time</TableCell>
              <TableCell sx={{ color: 'white' }}>Reason</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cancelledBookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">No cancelled bookings.</TableCell>
              </TableRow>
            ) : (
              cancelledBookings.map((booking) => (
                <TableRow key={booking.id} hover sx={{ bgcolor: 'grey.50' }}>
                  <TableCell>{booking.meeting_title}</TableCell>
                  <TableCell>{booking.room_details?.room_number || booking.room}</TableCell>
                  <TableCell>{booking.date}</TableCell>
                  <TableCell>{booking.start_time} - {booking.end_time}</TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {booking.cancellation_reason}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

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
                <Alert severity="info">
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
    </EmployeeLayout>
  );
}
