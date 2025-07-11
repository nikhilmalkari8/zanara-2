const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const http = require('http');
const fs = require('fs');

// Load environment variables
require('dotenv').config();

// Import socket service
const socketService = require('./services/socketService');

// Ensure critical environment variables are set
if (!process.env.JWT_SECRET) {
  console.log('⚠️  JWT_SECRET not found in environment, setting default');
  process.env.JWT_SECRET = 'a8f5f167f44f4964e6c998dee827110c85c1da73fcaa69213963a0d7e9a65d0c';
}

if (!process.env.MONGODB_URI) {
  console.log('⚠️  MONGODB_URI not found, using default');
  process.env.MONGODB_URI = 'mongodb://localhost:27017/zanara';
}

if (!process.env.STRIPE_SECRET_KEY) {
  console.log('⚠️  STRIPE_SECRET_KEY not found - payments will not work');
}

// Confirm environment is properly set
console.log('🔧 Environment Status:');
console.log('   JWT_SECRET:', !!process.env.JWT_SECRET ? '✅ Set' : '❌ Missing');
console.log('   MONGODB_URI:', !!process.env.MONGODB_URI ? '✅ Set' : '❌ Missing');
console.log('   STRIPE_SECRET_KEY:', !!process.env.STRIPE_SECRET_KEY ? '✅ Set' : '❌ Missing');
console.log('   PORT:', process.env.PORT || '8001 (default)');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Special middleware for Stripe webhooks (must be before express.json())
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ensure upload directories exist
const uploadDirs = [
  'uploads',
  'uploads/profiles',
  'uploads/portfolios',
  'uploads/messages',
  'uploads/companies',
  'uploads/collaboration',
  'uploads/design-tools'
];

uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Created directory: ${dir}`);
  }
});

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import routes
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const companyRoutes = require('./routes/company');
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
const paymentsRoutes = require('./routes/payments');
const messagesRoutes = require('./routes/messages');
const analyticsRoutes = require('./routes/analytics');
const jobsRoutes = require('./routes/jobs');
const collaborationRoutes = require('./routes/collaboration');
const designToolsRoutes = require('./routes/design-tools');
const smartFeedRoutes = require('./routes/smartFeed');

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
app.use('/api/payments', paymentsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/collaboration', collaborationRoutes);
app.use('/api/design-tools', designToolsRoutes);
app.use('/api/smart-feed', smartFeedRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Zanara API Server is running',
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV || 'development',
      jwtConfigured: !!process.env.JWT_SECRET,
      databaseConfigured: !!process.env.MONGODB_URI,
      stripeConfigured: !!process.env.STRIPE_SECRET_KEY,
      socketIOEnabled: true
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

// Initialize congratulations automation
const congratulationsService = require('./services/congratulationsService');
congratulationsService.scheduleAutomation();

// MongoDB connection with better error handling
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('✅ MongoDB connected successfully');
  console.log(`   Database: ${mongoose.connection.name}`);
  
  // Seed mock fabric data
  const { Fabric } = require('./models/DesignTool');
  await Fabric.seedMockData();
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// Handle MongoDB connection events
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected');
});

// Phase 4: Initialize Intelligent Notification Scheduler
const notificationScheduler = require('./services/notificationScheduler');

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  
  // Stop notification scheduler
  await notificationScheduler.stopScheduler();
  
  // Close MongoDB connection
  await mongoose.connection.close();
  console.log('✅ Graceful shutdown complete');
  process.exit(0);
});

const PORT = process.env.PORT || 8001;
server.listen(PORT, async () => {
  console.log(`🚀 Zanara API Server running on port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔌 Socket.IO enabled`);
  console.log(`💳 Stripe payments: ${!!process.env.STRIPE_SECRET_KEY ? 'Enabled' : 'Disabled'}`);
  
  // Start Phase 4 Intelligent Notification Scheduler
  console.log('🔌 Initializing Socket.IO service...');
  try {
    socketService.initialize(server);
    socketService.setupMiddleware();
    socketService.setupEventHandlers();
    console.log('✅ Socket.IO service initialized');
    
    // Start notification scheduler after a short delay to ensure everything is ready
    setTimeout(async () => {
      try {
        await notificationScheduler.startScheduler();
      } catch (error) {
        console.error('❌ Failed to start notification scheduler:', error);
      }
    }, 3000); // 3 second delay
    
  } catch (error) {
    console.error('❌ Socket.IO initialization error:', error);
  }
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

module.exports = { app, server };