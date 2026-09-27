import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  Paper,
  Chip,
} from "@mui/material";
import {
  MeetingRoom,
  Event,
  Schedule,
  People,
  ArrowRight,
  AccessTime,
} from "@mui/icons-material";
import Navbar from "../components/Navbar";

export default function Home() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <MeetingRoom sx={{ fontSize: 40 }} />,
      title: "Smart Room Booking",
      desc: "Find and book the perfect meeting room based on your needs, capacity, and availability.",
      color: "#667eea",
    },
    {
      icon: <Event sx={{ fontSize: 40 }} />,
      title: "Calendar View",
      desc: "Visualize all bookings in an intuitive calendar interface. Never double-book again.",
      color: "#764ba2",
    },
    {
      icon: <Schedule sx={{ fontSize: 40 }} />,
      title: "Smart Suggestions",
      desc: "When rooms are full, get intelligent alternative time slot suggestions instantly.",
      color: "#f093fb",
    },
    {
      icon: <People sx={{ fontSize: 40 }} />,
      title: "Team Collaboration",
      desc: "Coordinate with your team, manage bookings, and keep everyone on the same page.",
      color: "#4facfe",
    },
  ];

  const stats = [
    { value: "50+", label: "Meeting Rooms" },
    { value: "1000+", label: "Bookings Made" },
    { value: "99%", label: "Uptime" },
    { value: "24/7", label: "Available" },
  ];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9ff" }}>
      <Navbar />

      {/* =========================
          Hero Section
      ========================= */}
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          py: { xs: 6, md: 10 },
        }}
      >
        {/* Background circles */}
        <Box
          sx={{
            position: "absolute",
            top: -120,
            right: -120,
            width: 480,
            height: 480,
            borderRadius: "50%",
            background:
              "linear-gradient(135deg, rgba(102,126,234,0.12) 0%, rgba(118,75,162,0.12) 100%)",
          }}
        />

        <Box
          sx={{
            position: "absolute",
            bottom: -60,
            left: -60,
            width: 340,
            height: 340,
            borderRadius: "50%",
            background:
              "linear-gradient(135deg, rgba(240,147,251,0.12) 0%, rgba(79,172,254,0.12) 100%)",
          }}
        />

        <Container
          maxWidth="xl"
          sx={{
            position: "relative",
            zIndex: 1,
          }}
        >
          <Grid container spacing={{ xs: 6, md: 8 }} alignItems="center">
            {/* =========================
                LEFT - HERO TEXT
            ========================= */}
            <Grid size={{ xs: 12, md: 6 }}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Chip
                  label="Welcome to the Future of Meeting Rooms"
                  sx={{
                    mb: 3,
                    bgcolor: "primary.light",
                    color: "primary.main",
                    fontWeight: "bold",
                    px: 2,
                  }}
                />

                <Typography
                  variant="h2"
                  fontWeight="bold"
                  gutterBottom
                  sx={{
                    lineHeight: 1.2,
                  }}
                >
                  Book Meeting Rooms{" "}
                  <Box
                    component="span"
                    sx={{
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Effortlessly
                  </Box>
                </Typography>

                <Typography
                  variant="h6"
                  color="text.secondary"
                  sx={{
                    mb: 4,
                    lineHeight: 1.6,
                  }}
                >
                  MeetSpace helps you find, book, and manage meeting rooms with
                  smart availability checks, conflict detection, and intelligent
                  time suggestions.
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    flexWrap: "wrap",
                  }}
                >
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<ArrowRight />}
                    onClick={() => navigate("/register")}
                    sx={{
                      px: 4,
                      py: 1.5,
                      borderRadius: 3,
                      textTransform: "none",
                      fontWeight: "bold",
                      fontSize: "1.1rem",
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      boxShadow: "0 4px 15px rgba(102,126,234,0.4)",
                    }}
                  >
                    Get Started
                  </Button>

                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate("/login")}
                    sx={{
                      px: 4,
                      py: 1.5,
                      borderRadius: 3,
                      textTransform: "none",
                      fontWeight: "bold",
                      fontSize: "1.1rem",
                    }}
                  >
                    Sign In
                  </Button>
                </Box>
              </motion.div>
            </Grid>

            {/* =========================
                RIGHT - HERO IMAGE
            ========================= */}
            <Grid size={{ xs: 12, md: 6 }}>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.8,
                  delay: 0.2,
                }}
              >
                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                  }}
                >
                  {/* Animated Gradient Border */}
                  <motion.div
                    animate={{
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    style={{
                      position: "absolute",
                      inset: -4,
                      borderRadius: 20,
                      background:
                        "linear-gradient(135deg, #667eea, #764ba2, #f093fb, #4facfe, #667eea)",
                      backgroundSize: "300% 300%",
                      zIndex: 0,
                    }}
                  />

                  {/* Main Image */}
                  <Box
                    component="img"
                    src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=500&fit=crop"
                    alt="Meeting Room"
                    sx={{
                      position: "relative",
                      zIndex: 1,
                      width: "100%",
                      borderRadius: 4,
                      boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />

                  {/* =========================
                      TOP FLOATING CARD
                  ========================= */}
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <Paper
                      elevation={4}
                      sx={{
                        position: "absolute",
                        top: -20,
                        left: -20,
                        p: 2,
                        borderRadius: 3,
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        zIndex: 2,
                      }}
                    >
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 2,
                          bgcolor: "rgba(102,126,234,0.12)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#667eea",
                        }}
                      >
                        <MeetingRoom />
                      </Box>

                      <Box>
                        <Typography
                          variant="subtitle2"
                          fontWeight="bold"
                          sx={{
                            lineHeight: 1.2,
                          }}
                        >
                          50+ Rooms
                        </Typography>

                        <Typography variant="caption" color="text.secondary">
                          Available now
                        </Typography>
                      </Box>
                    </Paper>
                  </motion.div>

                  {/* =========================
                      BOTTOM FLOATING CARD
                  ========================= */}
                  <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{
                      duration: 3.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.5,
                    }}
                  >
                    <Paper
                      elevation={4}
                      sx={{
                        position: "absolute",
                        bottom: -20,
                        right: -10,
                        p: 2,
                        borderRadius: 3,
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        zIndex: 2,
                      }}
                    >
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 2,
                          bgcolor: "rgba(118,75,162,0.12)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#764ba2",
                        }}
                      >
                        <AccessTime />
                      </Box>

                      <Box>
                        <Typography
                          variant="subtitle2"
                          fontWeight="bold"
                          sx={{
                            lineHeight: 1.2,
                          }}
                        >
                          Instant
                        </Typography>

                        <Typography variant="caption" color="text.secondary">
                          Booking
                        </Typography>
                      </Box>
                    </Paper>
                  </motion.div>
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* =========================
          Stats Section
      ========================= */}
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {stats.map((stat, i) => (
            <Grid size={{ xs: 6, md: 3 }} key={i}>
              <motion.div
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  delay: i * 0.1,
                }}
              >
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    textAlign: "center",
                    borderRadius: 3,
                  }}
                >
                  <Typography
                    variant="h3"
                    fontWeight="bold"
                    sx={{
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {stat.value}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* =========================
          Features Section
      ========================= */}
      <Container
        maxWidth="xl"
        sx={{
          py: 8,
        }}
      >
        <Typography variant="h4" fontWeight="bold" align="center" gutterBottom>
          Everything You Need
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          align="center"
          sx={{
            mb: 6,
            maxWidth: 600,
            mx: "auto",
          }}
        >
          Powerful features to streamline your meeting room booking experience
        </Typography>

        <Grid container spacing={4}>
          {features.map((feature, i) => (
            <Grid size={{ xs: 12, md: 6 }} key={i}>
              <motion.div
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  delay: i * 0.1,
                }}
                style={{
                  height: "100%",
                }}
              >
                <Card
                  elevation={2}
                  sx={{
                    borderRadius: 3,
                    height: "100%",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: 8,
                    },
                  }}
                >
                  <CardContent
                    sx={{
                      p: 4,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: 3,
                        bgcolor: `${feature.color}15`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: feature.color,
                        flexShrink: 0,
                      }}
                    >
                      {feature.icon}
                    </Box>

                    <Box>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        {feature.title}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        {feature.desc}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* =========================
          CTA Section
      ========================= */}
      <Container
        maxWidth="xl"
        sx={{
          pb: 8,
        }}
      >
        <Paper
          elevation={4}
          sx={{
            p: 6,
            borderRadius: 4,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            textAlign: "center",
          }}
        >
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Ready to Get Started?
          </Typography>

          <Typography
            variant="body1"
            sx={{
              opacity: 0.9,
              mb: 4,
              maxWidth: 500,
              mx: "auto",
            }}
          >
            Join MeetSpace today and experience the smartest way to book meeting
            rooms.
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate("/register")}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 3,
                textTransform: "none",
                fontWeight: "bold",
                bgcolor: "white",
                color: "primary.main",
                "&:hover": {
                  bgcolor: "grey.100",
                },
              }}
            >
              Create Account
            </Button>

            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate("/login")}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 3,
                textTransform: "none",
                fontWeight: "bold",
                borderColor: "white",
                color: "white",
                "&:hover": {
                  borderColor: "white",
                  bgcolor: "rgba(255,255,255,0.1)",
                },
              }}
            >
              Sign In
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
