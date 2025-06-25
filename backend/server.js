const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Load environment variables
require('dotenv').config();

// Ensure critical environment variables are set
if (!process.env.JWT_SECRET) {
  console.log('⚠️  JWT_SECRET not found in environment, setting default');
  process.env.JWT_SECRET = 'a8f5f167f44f4964e6c998dee827110c85c1da73fcaa69213963a0d7e9a65d0c';
}

if (!process.env.MONGODB_URI) {
  console.log('⚠️  MONGODB_URI not found, using default');
  process.env.MONGODB_URI = 'mongodb://localhost:27017/zanara';
}

// Confirm environment is properly set
console.log('🔧 Environment Status:');
console.log('   JWT_SECRET:', !!process.env.JWT_SECRET ? '✅ Set' : '❌ Missing');
console.log('   MONGODB_URI:', !!process.env.MONGODB_URI ? '✅ Set' : '❌ Missing');
console.log('   PORT:', process.env.PORT || '8001 (default)');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
const contentRoutes = require('./routes/content');
const professionalProfileRoutes = require('./routes/professionalProfile');
const bookingRoutes = require('./routes/bookings');
const availabilityRoutes = require('./routes/availability');

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
app.use('/api/content', contentRoutes);
app.use('/api/professional-profile', professionalProfileRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/availability', availabilityRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Zanara API Server is running',
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV || 'development',
      jwtConfigured: !!process.env.JWT_SECRET,
      databaseConfigured: !!process.env.MONGODB_URI
    }
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: error.message })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl
  });
});

// MongoDB connection with better error handling
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB connected successfully');
  console.log('   Database:', mongoose.connection.name);
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  process.exit(1);
});

// Handle MongoDB connection events
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});

const PORT = process.env.PORT || 8001;
const server = app.listen(PORT, () => {
  console.log(`🚀 Zanara API Server running on port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
    process.exit(1);
  } else {
    console.error('Server error:', error);
  }
});

module.exports = app;