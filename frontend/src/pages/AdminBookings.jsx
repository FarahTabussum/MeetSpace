import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, CircularProgress, IconButton, Alert, Tabs, Tab,
  MenuItem, FormControl, InputLabel, Select,
} from '@mui/material';
import {
  ArrowBack, Cancel, MeetingRoom, Schedule, People, ViewList, CalendarMonth,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../api/axios';
import AdminLayout from '../components/AdminLayout';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [filterDate, setFilterDate] = useState('');
  const [filterRoom, setFilterRoom] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [rooms, setRooms] = useState([]);
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

  const fetchRooms = async () => {
    try {
      const res = await api.get('/rooms/');
      setRooms(res.data);
    } catch (err) {
      // silent fail
    }
  };

  useEffect(() => { fetchBookings(); fetchRooms(); }, []);

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

  const filteredBookings = bookings.filter((b) => {
    if (filterDate && b.date !== filterDate) return false;
    if (filterRoom && b.room !== parseInt(filterRoom)) return false;
    if (filterStatus && b.status !== filterStatus) return false;
    return true;
  });

  // Calendar helpers
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());

  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDay = getFirstDayOfMonth(calYear, calMonth);
  const monthName = new Date(calYear, calMonth).toLocaleString('default', { month: 'long' });

  const getBookingsForDay = (day) => {
    const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return bookings.filter((b) => b.date === dateStr && b.status === 'active');
  };

  const renderCalendar = () => {
    const cells = [];
    for (let i = 0; i < firstDay; i++) {
      cells.push(<Box key={`empty-${i}`} sx={{ height: 100, border: '1px solid #e0e0e0' }} />);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const dayBookings = getBookingsForDay(day);
      cells.push(
        <Box key={day} sx={{ height: 100, border: '1px solid #e0e0e0', p: 0.5, overflow: 'auto', bgcolor: dayBookings.length > 0 ? 'primary.50' : 'white' }}>
          <Typography variant="caption" fontWeight="bold">{day}</Typography>
          {dayBookings.slice(0, 2).map((b) => (
            <Chip
              key={b.id}
              label={`${b.room_details?.room_number} ${b.start_time}`}
              size="small"
              color="primary"
              sx={{ display: 'flex', mt: 0.5, fontSize: '0.7rem', height: 20 }}
            />
          ))}
          {dayBookings.length > 2 && (
            <Typography variant="caption" color="text.secondary">+{dayBookings.length - 2} more</Typography>
          )}
        </Box>
      );
    }
    return cells;
  };

  return (
    <AdminLayout>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate(-1)}><ArrowBack /></IconButton>
        <Typography variant="h5" fontWeight="bold">All Bookings</Typography>
      </Box>

      {/* Tabs */}
      <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
        <Tab icon={<ViewList />} label="List View" />
        <Tab icon={<CalendarMonth />} label="Calendar View" />
      </Tabs>

      {/* List View */}
      {tabValue === 0 && (
        <Paper elevation={2}>
          {/* Filters */}
          <Box sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap', borderBottom: '1px solid #e0e0e0' }}>
            <TextField
              label="Filter by Date" type="date" value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              size="small"
              sx={{ minWidth: 200, ml: 0.5 }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Room</InputLabel>
              <Select value={filterRoom} onChange={(e) => setFilterRoom(e.target.value)} label="Room">
                <MenuItem value="">All Rooms</MenuItem>
                {rooms.map((r) => <MenuItem key={r.id} value={r.id}>{r.room_number}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} label="Status">
                <MenuItem value="">All</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
            <Button variant="outlined" size="small" onClick={() => { setFilterDate(''); setFilterRoom(''); setFilterStatus(''); }}>
              Clear Filters
            </Button>
          </Box>

          {/* Table */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'primary.main' }}>
                  <TableCell sx={{ color: 'white' }}>Meeting Title</TableCell>
                  <TableCell sx={{ color: 'white' }}>Room</TableCell>
                  <TableCell sx={{ color: 'white' }}>Booked By</TableCell>
                  <TableCell sx={{ color: 'white' }}>Date</TableCell>
                  <TableCell sx={{ color: 'white' }}>Time</TableCell>
                  <TableCell sx={{ color: 'white' }}>Participants</TableCell>
                  <TableCell sx={{ color: 'white' }}>Status</TableCell>
                  <TableCell sx={{ color: 'white' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center"><CircularProgress /></TableCell>
                  </TableRow>
                ) : filteredBookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">No bookings found.</TableCell>
                  </TableRow>
                ) : (
                  filteredBookings.map((booking) => (
                    <TableRow key={booking.id} hover>
                      <TableCell>{booking.meeting_title}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <MeetingRoom color="primary" fontSize="small" />
                          {booking.room_details?.room_number || booking.room}
                        </Box>
                      </TableCell>
                      <TableCell>{booking.user_details?.first_name} {booking.user_details?.last_name}</TableCell>
                      <TableCell>{booking.date}</TableCell>
                      <TableCell>{booking.start_time} - {booking.end_time}</TableCell>
                      <TableCell>{booking.number_of_participants}</TableCell>
                      <TableCell>
                        <Chip
                          label={booking.status === 'active' ? 'Active' : 'Cancelled'}
                          color={booking.status === 'active' ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {booking.status === 'active' && (
                          <IconButton onClick={() => openCancelDialog(booking)} color="error">
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
      )}

      {/* Calendar View */}
      {tabValue === 1 && (
        <Paper elevation={2} sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Button variant="outlined" size="small" onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); } else setCalMonth(calMonth - 1); }}>
              Previous
            </Button>
            <Typography variant="h6">{monthName} {calYear}</Typography>
            <Button variant="outlined" size="small" onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); } else setCalMonth(calMonth + 1); }}>
              Next
            </Button>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0 }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <Box key={d} sx={{ textAlign: 'center', p: 1, bgcolor: 'grey.100', fontWeight: 'bold' }}>
                {d}
              </Box>
            ))}
            {renderCalendar()}
          </Box>
        </Paper>
      )}

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
                <Alert severity="warning">
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
    </AdminLayout>
  );
}
