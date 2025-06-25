const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Booking = require('../models/Booking');
const Availability = require('../models/Availability');
const User = require('../models/User');

// Get all bookings for the authenticated user
router.get('/my-bookings', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10, sort = 'startTime' } = req.query;
    
    let query = {
      $or: [
        { client: req.userId },
        { professional: req.userId }
      ]
    };
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    const bookings = await Booking.find(query)
      .populate('client', 'firstName lastName email profilePicture')
      .populate('professional', 'firstName lastName email profilePicture professionalType')
      .sort({ [sort]: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Booking.countDocuments(query);
    
    res.json({
      bookings,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ message: 'Server error fetching bookings' });
  }
});

// Get a specific booking by ID
router.get('/:bookingId', auth, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      bookingId: req.params.bookingId,
      $or: [
        { client: req.userId },
        { professional: req.userId }
      ]
    })
    .populate('client', 'firstName lastName email profilePicture phoneNumber')
    .populate('professional', 'firstName lastName email profilePicture professionalType phoneNumber')
    .populate('cancelledBy', 'firstName lastName');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    res.json(booking);
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ message: 'Server error fetching booking' });
  }
});

// Create a new booking request
router.post('/create', auth, async (req, res) => {
  try {
    const {
      professionalId,
      serviceType,
      startTime,
      endTime,
      location,
      requirements,
      notes
    } = req.body;
    
    // Validate required fields
    if (!professionalId || !serviceType || !startTime || !endTime) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Check if professional exists and is available for booking
    const professional = await User.findById(professionalId);
    if (!professional) {
      return res.status(404).json({ message: 'Professional not found' });
    }
    
    if (professional.userType !== 'talent') {
      return res.status(400).json({ message: 'Invalid professional type' });
    }
    
    // Check availability
    const availability = await Availability.findOne({ professional: professionalId });
    if (!availability || !availability.isActive) {
      return res.status(400).json({ message: 'Professional is not available for bookings' });
    }
    
    // Parse dates
    const startDateTime = new Date(startTime);
    const endDateTime = new Date(endTime);
    
    // Validate time range
    if (startDateTime >= endDateTime) {
      return res.status(400).json({ message: 'End time must be after start time' });
    }
    
    // Check if slot is available
    const isAvailable = availability.isSlotAvailable(
      startDateTime,
      startDateTime.toTimeString().slice(0, 5),
      endDateTime.toTimeString().slice(0, 5)
    );
    
    if (!isAvailable) {
      return res.status(400).json({ message: 'Selected time slot is not available' });
    }
    
    // Calculate duration in minutes
    const duration = Math.round((endDateTime - startDateTime) / (1000 * 60));
    
    // Get professional's pricing for this service
    const servicePricing = availability.serviceAvailability.find(
      service => service.serviceType === serviceType
    );
    
    const basePrice = servicePricing?.price || 100; // Default price
    const totalAmount = basePrice;
    
    // Create booking
    const booking = new Booking({
      client: req.userId,
      professional: professionalId,
      serviceType,
      startTime: startDateTime,
      endTime: endDateTime,
      duration,
      location,
      requirements,
      notes,
      pricing: {
        basePrice,
        totalAmount,
        currency: 'USD'
      }
    });
    
    await booking.save();
    
    // Populate user details for response
    await booking.populate('client', 'firstName lastName email profilePicture');
    await booking.populate('professional', 'firstName lastName email profilePicture professionalType');
    
    res.status(201).json({
      message: 'Booking request created successfully',
      booking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Server error creating booking' });
  }
});

// Update booking status (confirm, cancel, etc.)
router.put('/:bookingId/status', auth, async (req, res) => {
  try {
    const { status, reason } = req.body;
    const { bookingId } = req.params;
    
    const booking = await Booking.findOne({
      bookingId,
      $or: [
        { client: req.userId },
        { professional: req.userId }
      ]
    });
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Validate status transition
    const validTransitions = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['deposit-paid', 'cancelled'],
      'deposit-paid': ['in-progress', 'cancelled'],
      'in-progress': ['completed', 'cancelled'],
      completed: ['refunded'],
      cancelled: [],
      disputed: ['cancelled', 'refunded'],
      refunded: []
    };
    
    if (!validTransitions[booking.status].includes(status)) {
      return res.status(400).json({ 
        message: `Invalid status transition from ${booking.status} to ${status}` 
      });
    }
    
    // Update booking
    booking.status = status;
    booking.updatedAt = new Date();
    
    if (status === 'cancelled') {
      booking.cancellationReason = reason;
      booking.cancelledBy = req.userId;
      booking.cancelledAt = new Date();
    }
    
    await booking.save();
    
    res.json({
      message: 'Booking status updated successfully',
      booking
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ message: 'Server error updating booking status' });
  }
});

// Add message to booking
router.post('/:bookingId/messages', auth, async (req, res) => {
  try {
    const { message } = req.body;
    const { bookingId } = req.params;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ message: 'Message cannot be empty' });
    }
    
    const booking = await Booking.findOne({
      bookingId,
      $or: [
        { client: req.userId },
        { professional: req.userId }
      ]
    });
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    booking.messages.push({
      sender: req.userId,
      message: message.trim(),
      timestamp: new Date()
    });
    
    await booking.save();
    
    res.json({
      message: 'Message added successfully',
      booking
    });
  } catch (error) {
    console.error('Add message error:', error);
    res.status(500).json({ message: 'Server error adding message' });
  }
});

// Mark messages as read
router.put('/:bookingId/messages/read', auth, async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    const booking = await Booking.findOne({
      bookingId,
      $or: [
        { client: req.userId },
        { professional: req.userId }
      ]
    });
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Mark all messages from other user as read
    booking.messages.forEach(msg => {
      if (msg.sender.toString() !== req.userId && !msg.read) {
        msg.read = true;
      }
    });
    
    await booking.save();
    
    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Mark messages read error:', error);
    res.status(500).json({ message: 'Server error marking messages as read' });
  }
});

// Get available time slots for a professional
router.get('/availability/:professionalId', auth, async (req, res) => {
  try {
    const { professionalId } = req.params;
    const { date, duration = 60 } = req.query;
    
    const availability = await Availability.findOne({ 
      professional: professionalId,
      isActive: true
    });
    
    if (!availability) {
      return res.status(404).json({ message: 'Professional availability not found' });
    }
    
    let availableSlots = [];
    
    if (date) {
      // Get slots for specific date
      const targetDate = new Date(date);
      availableSlots = availability.getAvailableSlots(targetDate, targetDate, duration);
    } else {
      // Get slots for next 30 days
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);
      availableSlots = availability.getAvailableSlots(startDate, endDate, duration);
    }
    
    res.json({
      professional: professionalId,
      availability: availableSlots,
      settings: availability.bookingSettings
    });
  } catch (error) {
    console.error('Get availability error:', error);
    res.status(500).json({ message: 'Server error fetching availability' });
  }
});

// Get booking statistics
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const userId = req.userId;
    
    const stats = await Booking.aggregate([
      {
        $match: {
          $or: [
            { client: userId },
            { professional: userId }
          ]
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const totalBookings = await Booking.countDocuments({
      $or: [
        { client: userId },
        { professional: userId }
      ]
    });
    
    const upcomingBookings = await Booking.countDocuments({
      $or: [
        { client: userId },
        { professional: userId }
      ],
      startTime: { $gte: new Date() },
      status: { $in: ['confirmed', 'deposit-paid'] }
    });
    
    const todayBookings = await Booking.countDocuments({
      $or: [
        { client: userId },
        { professional: userId }
      ],
      startTime: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59, 999))
      }
    });
    
    const statsMap = {};
    stats.forEach(stat => {
      statsMap[stat._id] = stat.count;
    });
    
    res.json({
      total: totalBookings,
      upcoming: upcomingBookings,
      today: todayBookings,
      byStatus: statsMap
    });
  } catch (error) {
    console.error('Get booking stats error:', error);
    res.status(500).json({ message: 'Server error fetching booking statistics' });
  }
});

// Search bookings
router.get('/search/query', auth, async (req, res) => {
  try {
    const { 
      query, 
      status, 
      serviceType, 
      startDate, 
      endDate, 
      page = 1, 
      limit = 10 
    } = req.query;
    
    let searchQuery = {
      $or: [
        { client: req.userId },
        { professional: req.userId }
      ]
    };
    
    if (query) {
      searchQuery.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { bookingId: { $regex: query, $options: 'i' } }
      ];
    }
    
    if (status) {
      searchQuery.status = status;
    }
    
    if (serviceType) {
      searchQuery.serviceType = serviceType;
    }
    
    if (startDate || endDate) {
      searchQuery.startTime = {};
      if (startDate) searchQuery.startTime.$gte = new Date(startDate);
      if (endDate) searchQuery.startTime.$lte = new Date(endDate);
    }
    
    const bookings = await Booking.find(searchQuery)
      .populate('client', 'firstName lastName email profilePicture')
      .populate('professional', 'firstName lastName email profilePicture professionalType')
      .sort({ startTime: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Booking.countDocuments(searchQuery);
    
    res.json({
      bookings,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Search bookings error:', error);
    res.status(500).json({ message: 'Server error searching bookings' });
  }
});

module.exports = router; 