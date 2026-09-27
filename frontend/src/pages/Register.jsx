import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  InputAdornment,
  Grid,
  Chip,
  Divider,
} from "@mui/material";
import {
  PersonAdd,
  Email,
  Badge,
  Work,
  ArrowBack,
  CheckCircle,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import api from "../api/axios";
import Navbar from "../components/Navbar";
export default function Register() {
  const [form, setForm] = useState({
    pin: "",
    first_name: "",
    last_name: "",
    email: "",
    designation: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/register/", form);
      setRegistered(true);
      toast.success("Account created successfully!");
    } catch (err) {
      const data = err.response?.data;
      if (data) {
        const messages = Object.entries(data).map(
          ([key, val]) =>
            `${key}: ${Array.isArray(val) ? val.join(", ") : val}`,
        );
        setError(messages.join(". "));
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };
  /* ========================= Registration Success Page ========================= */ if (
    registered
  ) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9ff" }}>
        {" "}
        <Navbar />{" "}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            py: 6,
            px: 2,
          }}
        >
          {" "}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            style={{ width: "100%", maxWidth: 440 }}
          >
            {" "}
            <Paper
              elevation={8}
              sx={{
                borderRadius: 4,
                overflow: "hidden",
                textAlign: "center",
                p: 5,
              }}
            >
              {" "}
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  bgcolor: "success.light",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 3,
                }}
              >
                {" "}
                <CheckCircle
                  sx={{ fontSize: 40, color: "success.main" }}
                />{" "}
              </Box>{" "}
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {" "}
                Registration Successful!{" "}
              </Typography>{" "}
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {" "}
                Your account has been created. Use the default password below to
                sign in.{" "}
              </Typography>{" "}
              <Alert severity="warning" sx={{ mb: 3, textAlign: "left" }}>
                {" "}
                <Typography variant="body2" fontWeight="bold" gutterBottom>
                  {" "}
                  Your Default Password:{" "}
                </Typography>{" "}
                <Chip
                  label="Welcome@123"
                  color="warning"
                  sx={{ fontWeight: "bold", fontSize: "1rem" }}
                />{" "}
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  {" "}
                  You will be required to change it on your first login.{" "}
                </Typography>{" "}
              </Alert>{" "}
              <Button
                fullWidth
                variant="contained"
                onClick={() => navigate("/login")}
                sx={{
                  py: 1.5,
                  borderRadius: 3,
                  textTransform: "none",
                  fontWeight: "bold",
                  fontSize: "1.1rem",
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                }}
              >
                {" "}
                Go to Login{" "}
              </Button>{" "}
            </Paper>{" "}
          </motion.div>{" "}
        </Box>{" "}
      </Box>
    );
  }
  /* ========================= Registration Form ========================= */ return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9ff" }}>
      {" "}
      <Navbar />{" "}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: 6,
          px: 2,
        }}
      >
        {" "}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ width: "100%", maxWidth: 500 }}
        >
          {" "}
          <Paper elevation={8} sx={{ borderRadius: 4, overflow: "hidden" }}>
            {" "}
            {/* Header */}{" "}
            <Box
              sx={{
                background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
                p: 4,
                textAlign: "center",
                color: "white",
              }}
            >
              {" "}
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  bgcolor: "rgba(255,255,255,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 2,
                }}
              >
                {" "}
                <PersonAdd sx={{ fontSize: 32 }} />{" "}
              </Box>{" "}
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {" "}
                Create Account{" "}
              </Typography>{" "}
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {" "}
                Join MeetSpace and start booking rooms{" "}
              </Typography>{" "}
            </Box>{" "}
            {/* Form */}{" "}
            <Box sx={{ p: 4 }}>
              {" "}
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {" "}
                  {error}{" "}
                </Alert>
              )}{" "}
              <Box component="form" onSubmit={handleSubmit}>
                {" "}
                <Grid container spacing={2}>
                  {" "}
                  {/* PIN */}{" "}
                  <Grid size={12}>
                    {" "}
                    <TextField
                      fullWidth
                      label="PIN"
                      value={form.pin}
                      onChange={(e) =>
                        setForm({ ...form, pin: e.target.value })
                      }
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            {" "}
                            <Badge color="action" />{" "}
                          </InputAdornment>
                        ),
                      }}
                      placeholder="e.g., 1001"
                    />{" "}
                  </Grid>{" "}
                  {/* First Name */}{" "}
                  <Grid size={{ xs: 12, md: 6 }}>
                    {" "}
                    <TextField
                      fullWidth
                      label="First Name"
                      value={form.first_name}
                      onChange={(e) =>
                        setForm({ ...form, first_name: e.target.value })
                      }
                      required
                    />{" "}
                  </Grid>{" "}
                  {/* Last Name */}{" "}
                  <Grid size={{ xs: 12, md: 6 }}>
                    {" "}
                    <TextField
                      fullWidth
                      label="Last Name"
                      value={form.last_name}
                      onChange={(e) =>
                        setForm({ ...form, last_name: e.target.value })
                      }
                      required
                    />{" "}
                  </Grid>{" "}
                  {/* Email */}{" "}
                  <Grid size={12}>
                    {" "}
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            {" "}
                            <Email color="action" />{" "}
                          </InputAdornment>
                        ),
                      }}
                    />{" "}
                  </Grid>{" "}
                  {/* Designation */}{" "}
                  <Grid size={12}>
                    {" "}
                    <TextField
                      fullWidth
                      label="Designation"
                      value={form.designation}
                      onChange={(e) =>
                        setForm({ ...form, designation: e.target.value })
                      }
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            {" "}
                            <Work color="action" />{" "}
                          </InputAdornment>
                        ),
                      }}
                      placeholder="e.g., Software Engineer"
                    />{" "}
                  </Grid>{" "}
                  {/* Register Button */}{" "}
                  <Grid size={12}>
                    {" "}
                    <Button
                      fullWidth
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={loading}
                      startIcon={
                        loading ? <CircularProgress size={20} /> : <PersonAdd />
                      }
                      sx={{
                        py: 1.5,
                        borderRadius: 3,
                        textTransform: "none",
                        fontWeight: "bold",
                        fontSize: "1.1rem",
                        background:
                          "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
                        boxShadow: "0 4px 15px rgba(17,153,142,0.4)",
                      }}
                    >
                      {" "}
                      {loading ? "Creating Account..." : "Register"}{" "}
                    </Button>{" "}
                  </Grid>{" "}
                </Grid>{" "}
              </Box>{" "}
              {/* Divider */} <Divider sx={{ my: 3 }} /> {/* Sign In */}{" "}
              <Box sx={{ textAlign: "center" }}>
                {" "}
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  {" "}
                  Already have an account?{" "}
                </Typography>{" "}
                <Button
                  variant="outlined"
                  onClick={() => navigate("/login")}
                  sx={{
                    borderRadius: 3,
                    textTransform: "none",
                    fontWeight: "bold",
                  }}
                >
                  {" "}
                  Sign In{" "}
                </Button>{" "}
              </Box>{" "}
              {/* Back to Home */}{" "}
              <Box sx={{ textAlign: "center", mt: 2 }}>
                {" "}
                <Button
                  startIcon={<ArrowBack />}
                  onClick={() => navigate("/")}
                  size="small"
                  sx={{ textTransform: "none" }}
                >
                  {" "}
                  Back to Home{" "}
                </Button>{" "}
              </Box>{" "}
            </Box>{" "}
          </Paper>{" "}
        </motion.div>{" "}
      </Box>{" "}
    </Box>
  );
}
