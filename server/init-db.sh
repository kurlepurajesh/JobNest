#!/bin/bash

psql $DATABASE_URL << EOF
-- Create tables
CREATE TABLE IF NOT EXISTS accounts (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    name VARCHAR(255),
    google_id VARCHAR(255) UNIQUE
);

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY REFERENCES accounts(id),
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    skills TEXT,
    education TEXT[],
    enable BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS jobs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    description TEXT,
    url TEXT,
    label VARCHAR(100),
    tag VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS saved_jobs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES accounts(id),
    job_id INTEGER REFERENCES jobs(id),
    UNIQUE(user_id, job_id)
);

CREATE TABLE IF NOT EXISTS appliedjobs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES accounts(id),
    company VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'applied',
    dateApplied TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dateModified TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
EOF