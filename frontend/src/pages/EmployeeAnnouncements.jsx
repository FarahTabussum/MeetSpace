import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, CircularProgress, Button, Tooltip,
} from '@mui/material';
import { Campaign, AttachFile, Person, Schedule } from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../api/axios';
import EmployeeLayout from '../components/EmployeeLayout';

export default function EmployeeAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await api.get('/announcements/');
        setAnnouncements(res.data);
      } catch (err) {
        toast.error('Failed to load announcements.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  return (
    <EmployeeLayout>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>Announcement</Typography>

      <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.main' }}>
              <TableCell sx={{ color: 'white', width: '50%' }}>Announcement</TableCell>
              <TableCell sx={{ color: 'white' }}>Attachment</TableCell>
              <TableCell sx={{ color: 'white' }}>From</TableCell>
              <TableCell sx={{ color: 'white' }}>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center"><CircularProgress /></TableCell>
              </TableRow>
            ) : announcements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Box sx={{ py: 4 }}>
                    <Campaign sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
                    <Typography color="text.secondary">No announcements yet.</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              announcements.map((a) => (
                <TableRow key={a.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{a.message || '—'}</Typography>
                  </TableCell>
                  <TableCell>
                    {a.attachment ? (
                      <Tooltip title="Open attachment">
                        <Button
                          size="small"
                          startIcon={<AttachFile fontSize="small" />}
                          href={a.attachment_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                        >
                          {a.attachment_name}
                        </Button>
                      </Tooltip>
                    ) : (
                      <Typography variant="body2" color="text.secondary">—</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Person fontSize="small" color="action" />
                      <Typography variant="body2">{a.created_by_name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Schedule fontSize="small" color="action" />
                      <Typography variant="body2">
                        {new Date(a.created_at).toLocaleString()}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </EmployeeLayout>
  );
}
