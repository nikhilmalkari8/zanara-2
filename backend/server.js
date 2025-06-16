const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import routes
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const companyRoutes = require('./routes/Company');
const connectionsRoutes = require('./routes/connections');
const introductionsRoutes = require('./routes/introductions');
const opportunitiesRoutes = require('./routes/opportunities');
const usersRoutes = require('./routes/users');
const activityRoutes = require('./routes/activity');
const notificationRoutes = require('./routes/notifications');
const contentRoutes = require('./routes/content'); // NEW
const professionalProfileRoutes = require('./routes/professionalProfile');

// Route middleware
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/connections', connectionsRoutes);
app.use('/api/introductions', introductionsRoutes);
app.use('/api/opportunities', opportunitiesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/content', contentRoutes); // NEW
app.use('/api/professional-profile', professionalProfileRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/zanara', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));

const PORT = process.env.PORT || 8001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});