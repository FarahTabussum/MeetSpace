import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, FormControlLabel, Switch, Alert, CircularProgress,
} from '@mui/material';
import {
  Add, Edit, ArrowBack, CheckCircle, Cancel, MeetingRoom,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../api/axios';
import AdminLayout from '../components/AdminLayout';

const defaultForm = {
  room_number: '', floor: '', min_occupancy: 1, max_occupancy: 10, is_active: true,
};

export default function RoomManagement() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const fetchRooms = async () => {
    try {
      const res = await api.get('/rooms/');
      setRooms(res.data);
    } catch (err) {
      toast.error('Failed to load rooms.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRooms(); }, []);

  const openAddDialog = () => {
    setEditingRoom(null);
    setForm(defaultForm);
    setDialogOpen(true);
  };

  const openEditDialog = (room) => {
    setEditingRoom(room);
    setForm({
      room_number: room.room_number,
      floor: room.floor,
      min_occupancy: room.min_occupancy,
      max_occupancy: room.max_occupancy,
      is_active: room.is_active,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (form.min_occupancy > form.max_occupancy) {
      toast.error('Min occupancy cannot be greater than max occupancy.');
      return;
    }
    setSaving(true);
    try {
      if (editingRoom) {
        await api.put(`/rooms/${editingRoom.id}/`, form);
        toast.success('Room updated successfully.');
      } else {
        await api.post('/rooms/', form);
        toast.success('Room created successfully.');
      }
      setDialogOpen(false);
      fetchRooms();
    } catch (err) {
      const msg = err.response?.data?.room_number?.[0] || err.response?.data?.detail || 'Save failed.';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (room) => {
    try {
      await api.put(`/rooms/${room.id}/`, { ...room, is_active: !room.is_active });
      toast.success(`Room ${room.is_active ? 'deactivated' : 'activated'} successfully.`);
      fetchRooms();
    } catch (err) {
      toast.error('Failed to update room status.');
    }
  };

  return (
    <AdminLayout>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate(-1)}><ArrowBack /></IconButton>
          <Typography variant="h5" fontWeight="bold">Room Management</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={openAddDialog}>
          Add Room
        </Button>
      </Box>

      {/* Rooms Table */}
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.main' }}>
              <TableCell sx={{ color: 'white' }}>Room Number</TableCell>
              <TableCell sx={{ color: 'white' }}>Floor</TableCell>
              <TableCell sx={{ color: 'white' }}>Min Occupancy</TableCell>
              <TableCell sx={{ color: 'white' }}>Max Occupancy</TableCell>
              <TableCell sx={{ color: 'white' }}>Status</TableCell>
              <TableCell sx={{ color: 'white' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center"><CircularProgress /></TableCell>
              </TableRow>
            ) : rooms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">No rooms found.</TableCell>
              </TableRow>
            ) : (
              rooms.map((room) => (
                <TableRow key={room.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <MeetingRoom color="primary" />
                      <Typography fontWeight="medium">{room.room_number}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{room.floor}</TableCell>
                  <TableCell>{room.min_occupancy}</TableCell>
                  <TableCell>{room.max_occupancy}</TableCell>
                  <TableCell>
                    <Chip
                      label={room.is_active ? 'Active' : 'Inactive'}
                      color={room.is_active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => openEditDialog(room)} color="primary">
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleToggleStatus(room)} color={room.is_active ? 'warning' : 'success'}>
                      {room.is_active ? <Cancel /> : <CheckCircle />}
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <AnimatePresence>
        {dialogOpen && (
          <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth
            component={motion.div}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <DialogTitle>{editingRoom ? 'Edit Room' : 'Add New Room'}</DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                <TextField
                  label="Room Number" value={form.room_number}
                  onChange={(e) => setForm({ ...form, room_number: e.target.value })}
                  required placeholder="e.g., 301"
                />
                <TextField
                  label="Floor" value={form.floor}
                  onChange={(e) => setForm({ ...form, floor: e.target.value })}
                  required placeholder="e.g., 3rd Floor"
                />
                <TextField
                  label="Minimum Occupancy" type="number" value={form.min_occupancy}
                  onChange={(e) => setForm({ ...form, min_occupancy: parseInt(e.target.value) || 1 })}
                  inputProps={{ min: 1 }}
                />
                <TextField
                  label="Maximum Occupancy" type="number" value={form.max_occupancy}
                  onChange={(e) => setForm({ ...form, max_occupancy: parseInt(e.target.value) || 1 })}
                  inputProps={{ min: 1 }}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.is_active}
                      onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    />
                  }
                  label="Active"
                />
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} variant="contained" disabled={saving}>
                {saving ? <CircularProgress size={20} /> : 'Save'}
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
