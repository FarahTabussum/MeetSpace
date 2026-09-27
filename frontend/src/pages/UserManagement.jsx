import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, Switch, FormControlLabel, Alert, CircularProgress,
} from '@mui/material';
import {
  Add, Edit, Upload, ArrowBack, CheckCircle, Cancel,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../api/axios';
import AdminLayout from '../components/AdminLayout';

const defaultForm = {
  pin: '', first_name: '', last_name: '', email: '',
  designation: '', role: 'Employee', is_active: true,
};

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [csvUploading, setCsvUploading] = useState(false);
  const [csvResult, setCsvResult] = useState(null);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const res = await api.get('/auth/users/');
      setUsers(res.data);
    } catch (err) {
      toast.error('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const openAddDialog = () => {
    setEditingUser(null);
    setForm(defaultForm);
    setDialogOpen(true);
  };

  const openEditDialog = (user) => {
    setEditingUser(user);
    setForm({
      pin: user.pin, first_name: user.first_name, last_name: user.last_name,
      email: user.email, designation: user.designation, role: user.role,
      is_active: user.is_active,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingUser) {
        await api.put(`/auth/users/${editingUser.id}/`, form);
        toast.success('User updated successfully.');
      } else {
        await api.post('/auth/users/', form);
        toast.success('User created successfully.');
      }
      setDialogOpen(false);
      fetchUsers();
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.detail || 'Save failed.';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (user) => {
    const action = user.is_active ? 'deactivate' : 'activate';
    try {
      await api.post(`/auth/users/${user.id}/status/`, { action });
      toast.success(`User ${action}d successfully.`);
      fetchUsers();
    } catch (err) {
      toast.error(`Failed to ${action} user.`);
    }
  };

  const handleCsvUpload = async () => {
    if (!csvFile) {
      toast.error('Please select a CSV file.');
      return;
    }
    setCsvUploading(true);
    setCsvResult(null);
    const formData = new FormData();
    formData.append('file', csvFile);
    try {
      const res = await api.post('/auth/users/upload-csv/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setCsvResult(res.data);
      toast.success(res.data.message);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'CSV upload failed.');
    } finally {
      setCsvUploading(false);
    }
  };

  return (
    <AdminLayout>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate(-1)}><ArrowBack /></IconButton>
          <Typography variant="h5" fontWeight="bold">User Management</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box>
            <input
              type="file"
              accept=".csv"
              id="csv-upload"
              style={{ display: 'none' }}
              onChange={(e) => setCsvFile(e.target.files[0])}
            />
            <label htmlFor="csv-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<Upload />}
                disabled={csvUploading}
              >
                Upload CSV
              </Button>
            </label>
            {csvFile && (
              <Button
                variant="contained"
                sx={{ ml: 1 }}
                onClick={handleCsvUpload}
                disabled={csvUploading}
              >
                {csvUploading ? <CircularProgress size={20} /> : 'Confirm Upload'}
              </Button>
            )}
          </Box>
          <Button variant="contained" startIcon={<Add />} onClick={openAddDialog}>
            Add User
          </Button>
        </Box>
      </Box>

      {/* CSV Result */}
      {csvResult && (
        <Alert
          severity={csvResult.error_count > 0 ? 'warning' : 'success'}
          sx={{ mb: 2 }}
          onClose={() => setCsvResult(null)}
        >
          {csvResult.message}
          {csvResult.errors.length > 0 && (
            <Box sx={{ mt: 1 }}>
              {csvResult.errors.map((e, i) => (
                <div key={i}>Row {e.row}: {e.errors.join(', ')}</div>
              ))}
            </Box>
          )}
        </Alert>
      )}

      {/* Users Table */}
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.main' }}>
              <TableCell sx={{ color: 'white' }}>PIN</TableCell>
              <TableCell sx={{ color: 'white' }}>Name</TableCell>
              <TableCell sx={{ color: 'white' }}>Email</TableCell>
              <TableCell sx={{ color: 'white' }}>Designation</TableCell>
              <TableCell sx={{ color: 'white' }}>Role</TableCell>
              <TableCell sx={{ color: 'white' }}>Status</TableCell>
              <TableCell sx={{ color: 'white' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center"><CircularProgress /></TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">No users found.</TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>{user.pin}</TableCell>
                  <TableCell>{user.first_name} {user.last_name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.designation}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.role}
                      color={user.role === 'HR-Admin' ? 'error' : 'primary'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.is_active ? 'Active' : 'Inactive'}
                      color={user.is_active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => openEditDialog(user)} color="primary">
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleToggleStatus(user)} color={user.is_active ? 'warning' : 'success'}>
                      {user.is_active ? <Cancel /> : <CheckCircle />}
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
            <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                <TextField label="PIN" value={form.pin} onChange={(e) => setForm({ ...form, pin: e.target.value })} required />
                <TextField label="First Name" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} required />
                <TextField label="Last Name" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} required />
                <TextField label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                <TextField label="Designation" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} required />
                <TextField
                  select label="Role" value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <MenuItem value="Employee">Employee</MenuItem>
                  <MenuItem value="HR-Admin">HR-Admin</MenuItem>
                </TextField>
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
