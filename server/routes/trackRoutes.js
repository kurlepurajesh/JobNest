// routes/jobsRoute.js

const express = require('express');
const router = express.Router();
const isAuthenticated = require('../middleware/isAuthenticated'); 
const {
    createJobApplication,
    getAllJobs,
    getAllJob,
    updateJobApplication,
    deleteJobApplication
} = require('../controllers/trackController');

// Create a new job application
router.post('/create', isAuthenticated, createJobApplication);

// Get all job applications for a user
router.get('/get', isAuthenticated, getAllJobs);
router.get('/gets', isAuthenticated, getAllJob);

// Update job application details - Using proper parameter definition
router.patch('/update/:id([0-9]+)', isAuthenticated, updateJobApplication);

// Delete job application - Using proper parameter definition
router.delete('/delete/:id([0-9]+)', isAuthenticated, deleteJobApplication);

module.exports = router;