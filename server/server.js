import dotenv from 'dotenv';

// Load env vars FIRST
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import { verifyCloudinaryConnection } from './config/cloudinary.js';
import authRoutes from './routes/authRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import skillRoutes from './routes/skillRoutes.js';
import educationRoutes from './routes/educationRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import experienceRoutes from './routes/experienceRoutes.js';
import awardRoutes from './routes/awardRoutes.js';
import certificationRoutes from './routes/certificationRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import contactMessageRoutes from './routes/contactMessageRoutes.js';
import articleRoutes from './routes/articleRoutes.js';

// Connect to database
connectDB();

// Verify Cloudinary connection
verifyCloudinaryConnection();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/education', educationRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/experiences', experienceRoutes);
app.use('/api/awards', awardRoutes);
app.use('/api/certifications', certificationRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/contact-messages', contactMessageRoutes);
app.use('/api/articles', articleRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date() });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || '❌ Server Error' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
