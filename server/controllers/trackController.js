// controllers/jobsController.js
const path = require('path');
const { exec } = require('child_process');
const pool = require('../db');
const scriptPath = path.join(__dirname, 'email_parser.py');

// Create a new job application
const createJobApplication = async (req, res) => {
    try {
        const userId = req.user.id;
        const { company, role, status = 'applied' } = req.body;

        if (!company || !role || !userId) {
            return res.status(400).json({ error: 'Company, role, and user_id are required' });
        }

        const query = `
            INSERT INTO appliedjobs (company, role, status, user_id, dateApplied, dateModified)
            VALUES ($1, $2, $3, $4, NOW(), NOW())
            RETURNING *;
        `;
        const values = [company, role, status, userId];

        const result = await pool.query(query, values);
        return res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Failed to create job application:', error);
        res.status(500).json({ error: 'Failed to create job application' });
    }
};

// Get all job applications for a user
const getAllJobs = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            sortBy = 'dateModified',
            order = 'DESC',
            status,
            search = '',
        } = req.query;

        const validSortFields = ['company', 'role', 'status', 'dateApplied', 'dateModified'];
        const validOrders = ['ASC', 'DESC'];

        if (!validSortFields.includes(sortBy) || !validOrders.includes(order.toUpperCase())) {
            return res.status(400).json({ error: 'Invalid sort parameters' });
        }

        const params = [userId];
        let paramIndex = 2;
        let query = 'SELECT * FROM appliedjobs WHERE user_id = $1';

        if (status && status !== 'all') {
            query += ` AND LOWER(status) = $${paramIndex}`;
            params.push(status.toLowerCase());
            paramIndex++;
        }

        if (search.trim()) {
            query += ` AND (LOWER(company) LIKE $${paramIndex} OR LOWER(role) LIKE $${paramIndex})`;
            params.push(`%${search.toLowerCase()}%`);
        }

        query += ` ORDER BY ${sortBy} ${order}`;

        const result = await pool.query(query, params);
        return res.json(result.rows);
    } catch (error) {
        console.error('Failed to fetch jobs:', error);
        res.status(500).json({ error: 'Failed to fetch jobs' });
    }
};

// Get all job applications with email updates
const getAllJob = async (req, res) => {
    try {
        const userId = req.user.id;
        const { sortBy = 'dateModified', order = 'DESC' } = req.query;

        const validSortFields = ['company', 'role', 'status', 'dateApplied', 'dateModified'];
        const validOrders = ['ASC', 'DESC'];

        if (!validSortFields.includes(sortBy) || !validOrders.includes(order.toUpperCase())) {
            return res.status(400).json({ error: 'Invalid sort parameters' });
        }

        const query = `
            SELECT * FROM appliedjobs
            WHERE user_id = $1
            ORDER BY ${sortBy} ${order};
        `;
        const result = await pool.query(query, [userId]);
        const jobs = result.rows;

        if (!jobs.length) {
            return res.json([]);
        }

        const jobsJSON = JSON.stringify(jobs).replace(/"/g, '\\"');
        exec(`python3 ${scriptPath} "${jobsJSON}"`, async (err, stdout, stderr) => {
            if (err) {
                console.error('Error executing script:', err);
                return res.json(jobs);
            }

            try {
                const emailStatuses = JSON.parse(stdout);
                for (const job of jobs) {
                    const match = emailStatuses.find(entry =>
                        entry.company.toLowerCase() === job.company.toLowerCase() &&
                        entry.role.toLowerCase() === job.role.toLowerCase()
                    );

                    if (match?.status && match.status !== 'unknown') {
                        await pool.query(
                            `UPDATE appliedjobs
                             SET status = $1, dateModified = NOW()
                             WHERE user_id = $2 AND company = $3 AND role = $4`,
                            [match.status, userId, job.company, job.role]
                        );
                        job.status = match.status;
                    }
                }
                return res.json(jobs);
            } catch (error) {
                console.error('Failed to process email statuses:', error);
                return res.json(jobs);
            }
        });
    } catch (error) {
        console.error('Failed to fetch job applications:', error);
        res.status(500).json({ error: 'Failed to fetch job applications' });
    }
};

// Update job application
const updateJobApplication = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { company, role, status } = req.body;

        if (!company || !role || !status || !userId) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const query = `
            UPDATE appliedjobs
            SET company = $1, role = $2, status = $3, dateModified = NOW()
            WHERE id = $4 AND user_id = $5
            RETURNING *;
        `;
        const values = [company, role, status, id, userId];

        const result = await pool.query(query, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Job not found or not owned by user' });
        }

        return res.json(result.rows[0]);
    } catch (error) {
        console.error('Failed to update job:', error);
        res.status(500).json({ error: 'Failed to update job' });
    }
};

// Delete job application
const deleteJobApplication = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        if (!id || !userId) {
            return res.status(400).json({ error: 'Valid job ID and user ID are required' });
        }

        const query = `
            DELETE FROM appliedjobs
            WHERE id = $1 AND user_id = $2
            RETURNING *;
        `;
        const values = [id, userId];

        const result = await pool.query(query, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Job not found or not owned by user' });
        }

        return res.json({ success: true });
    } catch (error) {
        console.error('Failed to delete job:', error);
        res.status(500).json({ error: 'Failed to delete job' });
    }
};

module.exports = {
    createJobApplication,
    getAllJobs,
    getAllJob,
    updateJobApplication,
    deleteJobApplication
};