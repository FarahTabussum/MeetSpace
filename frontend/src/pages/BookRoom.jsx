import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box, Typography, Button, Paper, TextField, MenuItem, Chip, Dialog,
  DialogTitle, DialogContent, DialogActions, Alert, CircularProgress,
  Card, CardContent, Grid, Divider, IconButton,
} from '@mui/material';
import {
  ArrowBack, MeetingRoom, Schedule, People, CheckCircle, AccessTime, CalendarMonth,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../api/axios';

export default function BookRoom() {
  const [form, setForm] = useState({
    date: '', start_time: '', end_time: '', number_of_participants: 1,
  });
  const [availableRooms, setAvailableRooms] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchDone, setSearchDone] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [booking, setBooking] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSearchDone(false);
    setAvailableRooms([]);
    setSuggestions([]);

    try {
      const res = await api.post('/availability/', form);
      setAvailableRooms(res.data.available_rooms);
      setSuggestions(res.data.suggestions || []);
      setSearchDone(true);
    } catch (err) {
      const msg = err.response?.data?.error || 'Search failed.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRoom = (room) => {
    setSelectedRoom(room);
    setConfirmOpen(true);
  };

  const handleConfirmBooking = async () => {
    setBooking(true);
    try {
      await api.post('/bookings/', {
        meeting_title: meetingTitle,
        date: form.date,
        start_time: form.start_time,
        end_time: form.end_time,
        number_of_participants: form.number_of_participants,
        room: selectedRoom.id,
      });
      toast.success('Room booked successfully!');
      setConfirmOpen(false);
      navigate('/employee/bookings');
    } catch (err) {
      const msg = err.response?.data?.error || 'Booking failed.';
      toast.error(msg);
    } finally {
      setBooking(false);
    }
  };

  const handleSuggestionSelect = (suggestion) => {
    setForm({
      ...form,
      date: suggestion.date,
      start_time: suggestion.start_time,
      end_time: suggestion.end_time,
    });
    handleSelectRoom(suggestion.room);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate(-1)}><ArrowBack /></IconButton>
        <Typography variant="h5" fontWeight="bold">Book a Room</Typography>
      </Box>

      {/* Search Form */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>Search Available Rooms</Typography>
        <Box component="form" onSubmit={handleSearch}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth label="Date" type="date" value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth label="Start Time" type="time" value={form.start_time}
                onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                required InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth label="End Time" type="time" value={form.end_time}
                onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                required InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth label="Participants" type="number" value={form.number_of_participants}
                onChange={(e) => setForm({ ...form, number_of_participants: parseInt(e.target.value) || 1 })}
                inputProps={{ min: 1 }} required
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                fullWidth type="submit" variant="contained" size="large"
                disabled={loading} sx={{ py: 1.5 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Search Available Rooms'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Available Rooms */}
      {searchDone && availableRooms.length > 0 && (
        <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            {availableRooms.length} room(s) available
          </Typography>
          <Grid container spacing={2}>
            {availableRooms.map((room) => (
              <Grid item xs={12} md={6} key={room.id}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card variant="outlined" sx={{ cursor: 'pointer', '&:hover': { borderColor: 'primary.main', boxShadow: 2 } }}
                    onClick={() => handleSelectRoom(room)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <MeetingRoom color="primary" />
                        <Typography variant="h6">{room.room_number}</Typography>
                      </Box>
                      <Typography color="text.secondary" gutterBottom>{room.floor}</Typography>
                      <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                        <Chip icon={<People />} label={`${room.min_occupancy}-${room.max_occupancy} people`} size="small" />
                        <Chip icon={<Schedule />} label={`${form.start_time} - ${form.end_time}`} size="small" />
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* No Rooms Available + Suggestions */}
      {searchDone && availableRooms.length === 0 && (
        <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            No rooms available for the selected time. Here are the next best available options:
          </Alert>
          {suggestions.length > 0 ? (
            <Grid container spacing={2}>
              {suggestions.map((s, i) => (
                <Grid item xs={12} md={6} key={i}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card variant="outlined" sx={{ cursor: 'pointer', '&:hover': { borderColor: 'primary.main', boxShadow: 2 } }}
                      onClick={() => handleSuggestionSelect(s)}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <MeetingRoom color="primary" />
                          <Typography variant="h6">{s.room.room_number}</Typography>
                          <Chip label={s.room.floor} size="small" variant="outlined" />
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                          <Chip
                            icon={<CalendarMonth />}
                            label={s.date}
                            size="small" color="primary"
                          />
                          <Chip
                            icon={<AccessTime />}
                            label={`${s.start_time} - ${s.end_time}`}
                            size="small" color="secondary"
                          />
                          <Chip
                            icon={<People />}
                            label={`${s.room.min_occupancy}-${s.room.max_occupancy} people`}
                            size="small"
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography color="text.secondary">No alternative time slots found. Try a different date or time.</Typography>
          )}
        </Paper>
      )}

      {/* Confirm Booking Dialog */}
      <AnimatePresence>
        {confirmOpen && selectedRoom && (
          <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="sm" fullWidth
            component={motion.div}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <DialogTitle>Confirm Booking</DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                <TextField
                  fullWidth label="Meeting Title" value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  required placeholder="e.g., Sprint Planning"
                />
                <Divider />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Chip icon={<MeetingRoom />} label={selectedRoom.room_number} color="primary" />
                  <Chip icon={<Schedule />} label={`${form.date} ${form.start_time}-${form.end_time}`} />
                  <Chip icon={<People />} label={`${form.number_of_participants} participants`} />
                </Box>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
              <Button onClick={handleConfirmBooking} variant="contained" disabled={booking || !meetingTitle}>
                {booking ? <CircularProgress size={20} /> : 'Confirm Booking'}
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </AnimatePresence>
    </Box>
  );
}
