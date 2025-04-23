const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const { fetchAndStoreJobs } = require("./controllers/jobsController");
const { fetchJobsFromDB } = require("./controllers/jobsController");
const { createJobsTable } = require("./models/jobsModel");
const jobRoutes = require('./routes/jobsRoutes');
const savedJobsRoute = require("./routes/savedJobsRoute");
const profileRoutes = require('./routes/profileRoutes');
const resumeRoutes = require('./routes/resumeroutes');
const authRoutes = require("./routes/authRoutes");
const trackRoutes = require("./routes/trackRoutes");

const session = require("express-session");
const passport = require("passport");
require("./middleware/passport");

const app = express();
const PORT = process.env.PORT || 6005;

// Configure CORS before routes
app.use(cors({
  origin: process.env.NODE_ENV === "production" 
    ? "https://jobnest.onrender.com" 
    : "http://localhost:3000",
  credentials: true
}));

// Middleware
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'default_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? 'none' : 'lax',
    secure: process.env.NODE_ENV === "production",
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// Initialize database table
createJobsTable();

// API routes with proper error handling
app.use('/api/jobs', async (req, res, next) => {
  try {
    const { search, location, company } = req.query;
    const jobs = await fetchJobsFromDB(search, location, company);
    res.json(jobs);
  } catch (error) {
    next(error);
  }
});

// Mount all route handlers
app.use('/api/job', jobRoutes);
app.use("/api/jobss", savedJobsRoute);
app.use('/api/track', trackRoutes);
app.use("/api/auth", authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/optimize', resumeRoutes);

// Production static file serving and SPA routing
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/build", "index.html"));
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});