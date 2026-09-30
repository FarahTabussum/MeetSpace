import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box, Typography, Paper, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, CircularProgress, IconButton, Button,
  Card, CardContent, Grid, Divider, Checkbox, FormControlLabel,
} from '@mui/material';
import {
  CheckCircle, Cancel, MeetingRoom, Schedule, People, Description, SwapHoriz,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../api/axios';
import AdminLayout from '../components/AdminLayout';

export default function AdminApprovals() {
  const [pendingBookings, setPendingBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [actionType, setActionType] = useState('approve');
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  // Alternatives state
  const [altDialogOpen, setAltDialogOpen] = useState(false);
  const [altWeekData, setAltWeekData] = useState([]);
  const [selectedAlts, setSelectedAlts] = useState([]);
  const [altProcessing, setAltProcessing] = useState(false);
  const [altDayFilter, setAltDayFilter] = useState('all');

  const fetchPendingBookings = async () => {
    try {
      const res = await api.get('/bookings/');
      const pending = res.data.filter((b) => b.status === 'pending');
      setPendingBookings(pending);
    } catch (err) {
      toast.error('Failed to load pending bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPendingBookings(); }, []);

  const openActionDialog = (booking, type) => {
    setSelectedBooking(booking);
    setActionType(type);
    setRejectReason('');
    setActionDialogOpen(true);
  };

  const handleAction = async () => {
    if (actionType === 'reject' && !rejectReason.trim()) {
      toast.error('Rejection reason is required.');
      return;
    }
    setProcessing(true);
    try {
      if (actionType === 'approve') {
        await api.post(`/bookings/${selectedBooking.id}/approve/`);
        toast.success('Booking approved. Confirmation email sent to employee.');
      } else if (actionType === 'reject') {
        await api.post(`/bookings/${selectedBooking.id}/reject/`, { reason: rejectReason });
        toast.success('Booking rejected. Notification email sent to employee.');
      }
      setActionDialogOpen(false);
      fetchPendingBookings();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Action failed.');
    } finally {
      setProcessing(false);
    }
  };

  // Fetch week availability for alternatives (rooms + time slots)
  const openAlternativesDialog = async (booking) => {
    setSelectedBooking(booking);
    setSelectedAlts([]);
    setAltDayFilter('all');
    setAltDialogOpen(true);
    setAltProcessing(true);
    try {
      const res = await api.get('/bookings/');
      const allBookings = res.data.filter((b) => b.status === 'approved');
      const roomsRes = await api.get('/rooms/');
      const allRooms = roomsRes.data.filter((r) => r.is_active);

      // Get the week's dates (same day as requested + 6 days)
      const baseDate = new Date(booking.date);
      const weekOptions = [];

      // Generate time slots (8 AM to 8 PM, 30-min intervals)
      const timeSlots = [];
      for (let hour = 8; hour < 20; hour++) {
        for (let min = 0; min < 60; min += 30) {
          const start = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
          const endHour = min + 30 >= 60 ? hour + 1 : hour;
          const endMin = (min + 30) % 60;
          const end = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;
          timeSlots.push({ start_time: start, end_time: end });
        }
      }

      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const currentDate = new Date(baseDate);
        currentDate.setDate(currentDate.getDate() + dayOffset);
        const dateStr = currentDate.toISOString().split('T')[0];

        // Check each room for this date
        for (const room of allRooms) {
          // Check each time slot for this room on this date
          for (const slot of timeSlots) {
            const hasConflict = allBookings.some((b) => {
              return b.room === room.id && b.date === dateStr &&
                b.start_time < slot.end_time && b.end_time > slot.start_time;
            });

            if (!hasConflict) {
              weekOptions.push({
                room_id: room.id,
                room_number: room.room_number,
                floor: room.floor,
                date: dateStr,
                start_time: slot.start_time,
                end_time: slot.end_time,
              });
            }
          }
        }
      }

      setAltWeekData(weekOptions);
    } catch (err) {
      toast.error('Failed to fetch availability.');
      setAltWeekData([]);
    } finally {
      setAltProcessing(false);
    }
  };

  const sameAlt = (a, alt) =>
    a.room_id === alt.room_id && a.date === alt.date &&
    a.start_time === alt.start_time && a.end_time === alt.end_time;

  const toggleAltSelection = (alt) => {
    setSelectedAlts((prev) => {
      const exists = prev.find((a) => sameAlt(a, alt));
      if (exists) {
        return prev.filter((a) => !sameAlt(a, alt));
      }
      return [...prev, alt];
    });
  };

  const isAltSelected = (alt) => {
    return selectedAlts.some((a) => sameAlt(a, alt));
  };

  const handleSuggestAlternatives = async () => {
    if (selectedAlts.length === 0) {
      toast.error('Please select at least one alternative.');
      return;
    }
    setAltProcessing(true);
    try {
      await api.post(`/bookings/${selectedBooking.id}/suggest-alternatives/`, {
        alternatives: selectedAlts,
      });
      toast.success('Alternatives suggested. Email sent to employee.');
      setAltDialogOpen(false);
      fetchPendingBookings();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to suggest alternatives.');
    } finally {
      setAltProcessing(false);
    }
  };

  return (
    <AdminLayout>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 4 }}>Booking Approvals</Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : pendingBookings.length === 0 ? (
        <Paper elevation={2} sx={{ p: 6, borderRadius: 3, textAlign: 'center' }}>
          <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>All Caught Up!</Typography>
          <Typography color="text.secondary">No pending booking requests.</Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {pendingBookings.map((booking, i) => (
            <Grid item xs={12} md={6} key={booking.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card elevation={2} sx={{ borderRadius: 3, borderLeft: '4px solid', borderColor: 'warning.main' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" fontWeight="bold">{booking.meeting_title}</Typography>
                      <Chip label="Pending" color="warning" size="small" />
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <People color="action" fontSize="small" />
                        <Typography variant="body2">
                          <strong>Employee:</strong> {booking.user_details?.first_name} {booking.user_details?.last_name} ({booking.user_details?.email})
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <MeetingRoom color="action" fontSize="small" />
                        <Typography variant="body2">
                          <strong>Room:</strong> {booking.room_details?.room_number} ({booking.room_details?.floor})
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Schedule color="action" fontSize="small" />
                        <Typography variant="body2">
                          <strong>Date:</strong> {booking.date} | <strong>Time:</strong> {booking.start_time} - {booking.end_time}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <People color="action" fontSize="small" />
                        <Typography variant="body2">
                          <strong>Participants:</strong> {booking.number_of_participants}
                        </Typography>
                      </Box>
                      {booking.requirements && (
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                          <Description color="action" fontSize="small" sx={{ mt: 0.5 }} />
                          <Typography variant="body2">
                            <strong>Requirements:</strong> {booking.requirements}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<Cancel />}
                        onClick={() => openActionDialog(booking, 'reject')}
                        size="small"
                      >
                        Reject
                      </Button>
                      <Button
                        variant="outlined"
                        color="info"
                        startIcon={<SwapHoriz />}
                        onClick={() => openAlternativesDialog(booking)}
                        size="small"
                      >
                        Alternatives
                      </Button>
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircle />}
                        onClick={() => openActionDialog(booking, 'approve')}
                        size="small"
                      >
                        Approve
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Approve/Reject Dialog */}
      <AnimatePresence>
        {actionDialogOpen && selectedBooking && (
          <Dialog open={actionDialogOpen} onClose={() => setActionDialogOpen(false)} maxWidth="sm" fullWidth
            component={motion.div}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <DialogTitle>
              {actionType === 'approve' ? 'Approve Booking' : 'Reject Booking'}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold">{selectedBooking.meeting_title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Employee: {selectedBooking.user_details?.first_name} {selectedBooking.user_details?.last_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Room: {selectedBooking.room_details?.room_number} | {selectedBooking.date} | {selectedBooking.start_time} - {selectedBooking.end_time}
                  </Typography>
                </Paper>

                {actionType === 'approve' ? (
                  <Chip
                    icon={<CheckCircle />}
                    label="A confirmation email will be sent to the employee."
                    color="success"
                    variant="outlined"
                  />
                ) : (
                  <TextField
                    fullWidth
                    label="Rejection Reason"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    multiline
                    rows={3}
                    required
                    placeholder="Please provide a reason for rejection"
                  />
                )}
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setActionDialogOpen(false)}>Cancel</Button>
              <Button
                onClick={handleAction}
                variant="contained"
                color={actionType === 'approve' ? 'success' : 'error'}
                disabled={processing}
              >
                {processing ? <CircularProgress size={20} /> : actionType === 'approve' ? 'Approve' : 'Reject'}
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </AnimatePresence>

      {/* Alternatives Dialog */}
      <AnimatePresence>
        {altDialogOpen && selectedBooking && (
          <Dialog open={altDialogOpen} onClose={() => setAltDialogOpen(false)} maxWidth="md" fullWidth
            component={motion.div}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <DialogTitle>Suggest Alternative Options</DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold">{selectedBooking.meeting_title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Requested: Room {selectedBooking.room_details?.room_number} on {selectedBooking.date} at {selectedBooking.start_time} - {selectedBooking.end_time}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Select alternative rooms, dates and time slots. Each option is selected individually — you can pick as many as you want.
                  </Typography>
                </Paper>

                {altProcessing ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : altWeekData.length === 0 ? (
                  <Typography color="text.secondary" align="center" py={4}>
                    No alternative options available for this week.
                  </Typography>
                ) : (
                  <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      Available Options ({altWeekData.length} found):
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
                      <Chip
                        label="All Days"
                        size="small"
                        color={altDayFilter === 'all' ? 'primary' : 'default'}
                        variant={altDayFilter === 'all' ? 'filled' : 'outlined'}
                        onClick={() => setAltDayFilter('all')}
                      />
                      {[...new Set(altWeekData.map((a) => a.date))].sort().map((d) => (
                        <Chip
                          key={d}
                          label={d}
                          size="small"
                          color={altDayFilter === d ? 'primary' : 'default'}
                          variant={altDayFilter === d ? 'filled' : 'outlined'}
                          onClick={() => setAltDayFilter(d)}
                        />
                      ))}
                    </Box>
                    <Grid container spacing={1}>
                      {altWeekData
                        .filter((alt) => altDayFilter === 'all' || alt.date === altDayFilter)
                        .map((alt, i) => (
                        <Grid item xs={12} sm={6} key={i}>
                          <Paper
                            variant="outlined"
                            sx={{
                              p: 1.5,
                              borderRadius: 2,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              '&:hover': { borderColor: 'primary.main', bgcolor: 'primary.50' },
                              borderColor: isAltSelected(alt) ? 'primary.main' : 'divider',
                              borderWidth: isAltSelected(alt) ? 2 : 1,
                            }}
                            onClick={() => toggleAltSelection(alt)}
                          >
                            <Checkbox
                              checked={isAltSelected(alt)}
                              onChange={() => toggleAltSelection(alt)}
                              onClick={(e) => e.stopPropagation()}
                              size="small"
                            />
                            <Box>
                              <Typography variant="body2" fontWeight="bold">
                                Room {alt.room_number} ({alt.floor})
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {alt.date} | {alt.start_time} - {alt.end_time}
                              </Typography>
                            </Box>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}

                {selectedAlts.length > 0 && (
                  <Chip
                    label={`${selectedAlts.length} option(s) selected`}
                    color="primary"
                    variant="outlined"
                  />
                )}
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setAltDialogOpen(false)}>Cancel</Button>
              <Button
                onClick={handleSuggestAlternatives}
                variant="contained"
                color="info"
                disabled={altProcessing || selectedAlts.length === 0}
              >
                {altProcessing ? <CircularProgress size={20} /> : `Suggest ${selectedAlts.length} Alternative(s)`}
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
