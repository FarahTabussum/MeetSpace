import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Chip,
  Tooltip,
} from "@mui/material";
import {
  Add,
  Campaign,
  AttachFile,
  Delete,
  Download,
  Person,
  Schedule,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import api from "../api/axios";
import AdminLayout from "../components/AdminLayout";

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get("/announcements/");
      setAnnouncements(res.data);
    } catch (err) {
      toast.error("Failed to load announcements.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const openDialog = () => {
    setMessage("");
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setDialogOpen(true);
  };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
  };

  const handleCreate = async () => {
    if (!message.trim() && !file) {
      toast.error("Add announcement text, an attachment, or both.");
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("message", message.trim());
      if (file) formData.append("attachment", file);

      await api.post("/announcements/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Announcement created successfully.");
      setDialogOpen(false);
      fetchAnnouncements();
    } catch (err) {
      toast.error(
        err.response?.data?.error || "Failed to create announcement.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/announcements/${id}/`);
      toast.success("Announcement deleted.");
      setAnnouncements(announcements.filter((a) => a.id !== id));
    } catch (err) {
      toast.error(
        err.response?.data?.error || "Failed to delete announcement.",
      );
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <AdminLayout>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" fontWeight="bold">
          Announcement
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={openDialog}
          sx={{
            borderRadius: 3,
            textTransform: "none",
            fontWeight: "bold",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          }}
        >
          Add Announcement
        </Button>
      </Box>

      {/* Table */}
      <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "primary.main" }}>
              <TableCell sx={{ color: "white", width: "45%" }}>
                Announcement
              </TableCell>
              <TableCell sx={{ color: "white" }}>Attachment</TableCell>
              <TableCell sx={{ color: "white" }}>Created By</TableCell>
              <TableCell sx={{ color: "white" }}>Date</TableCell>
              <TableCell sx={{ color: "white" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : announcements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Box sx={{ py: 4 }}>
                    <Campaign sx={{ fontSize: 48, color: "grey.400", mb: 1 }} />
                    <Typography color="text.secondary">
                      No announcements yet.
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              announcements.map((a, i) => (
                <TableRow key={a.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                      {a.message || "—"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {a.attachment ? (
                      <Tooltip title="Download attachment">
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
                      <Typography variant="body2" color="text.secondary">
                        —
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <Person fontSize="small" color="action" />
                      <Typography variant="body2">
                        {a.created_by_name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <Schedule fontSize="small" color="action" />
                      <Typography variant="body2">
                        {new Date(a.created_at).toLocaleString()}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      color="error"
                      size="small"
                      onClick={() => handleDelete(a.id)}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Announcement Dialog */}
      <AnimatePresence>
        {dialogOpen && (
          <Dialog
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
            maxWidth="sm"
            fullWidth
            component={motion.div}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <DialogTitle>Add Announcement</DialogTitle>
            <DialogContent>
              <Box
                sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
              >
                <Alert severity="info" sx={{ py: 0 }}>
                  Add announcement text, an attachment, or both — at least one is
                  required.
                </Alert>

                <TextField
                  fullWidth
                  label="Announcement Text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  multiline
                  rows={4}
                  placeholder="Write your announcement (optional if you attach a file)..."
                />

                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Attachment{" "}
                    <Typography component="span" color="text.secondary">
                      (optional)
                    </Typography>
                  </Typography>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<AttachFile />}
                    sx={{ textTransform: "none" }}
                  >
                    {file ? file.name : "Choose File"}
                    <input
                      ref={fileInputRef}
                      type="file"
                      hidden
                      onChange={handleFileChange}
                    />
                  </Button>

                  {file && (
                    <Alert
                      severity="info"
                      sx={{ mt: 1 }}
                      onClose={() => {
                        setFile(null);
                        if (fileInputRef.current)
                          fileInputRef.current.value = "";
                      }}
                    >
                      {file.name} ({formatBytes(file.size)})
                    </Alert>
                  )}
                </Box>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button
                onClick={handleCreate}
                variant="contained"
                disabled={saving || (!message.trim() && !file)}
              >
                {saving ? <CircularProgress size={20} /> : "Publish"}
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
