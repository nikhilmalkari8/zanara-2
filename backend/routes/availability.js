const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Availability = require('../models/Availability');
const User = require('../models/User');

// Get professional's availability
router.get('/my-availability', auth, async (req, res) => {
  try {
    let availability = await Availability.findOne({ professional: req.userId });
    
    if (!availability) {
      // Create default availability if none exists
      availability = new Availability({
        professional: req.userId,
        type: 'recurring',
        recurring: {
          enabled: false,
          schedule: {
            monday: { available: false, startTime: '09:00', endTime: '17:00' },
            tuesday: { available: false, startTime: '09:00', endTime: '17:00' },
            wednesday: { available: false, startTime: '09:00', endTime: '17:00' },
            thursday: { available: false, startTime: '09:00', endTime: '17:00' },
            friday: { available: false, startTime: '09:00', endTime: '17:00' },
            saturday: { available: false, startTime: '09:00', endTime: '17:00' },
            sunday: { available: false, startTime: '09:00', endTime: '17:00' }
          }
        },
        bookingSettings: {
          advanceBookingDays: 30,
          sameDayBooking: false,
          minimumNoticeHours: 24,
          maxBookingsPerDay: 3,
          sessionDuration: 60,
          bufferTime: 15
        }
      });
      
      await availability.save();
    }
    
    res.json(availability);
  } catch (error) {
    console.error('Get availability error:', error);
    res.status(500).json({ message: 'Server error fetching availability' });
  }
});

// Update recurring schedule
router.put('/recurring-schedule', auth, async (req, res) => {
  try {
    const { enabled, schedule } = req.body;
    
    let availability = await Availability.findOne({ professional: req.userId });
    
    if (!availability) {
      availability = new Availability({ professional: req.userId });
    }
    
    availability.recurring.enabled = enabled;
    if (schedule) {
      availability.recurring.schedule = schedule;
    }
    
    await availability.save();
    
    res.json({
      message: 'Recurring schedule updated successfully',
      availability
    });
  } catch (error) {
    console.error('Update recurring schedule error:', error);
    res.status(500).json({ message: 'Server error updating recurring schedule' });
  }
});

// Add one-time availability slots
router.post('/slots', auth, async (req, res) => {
  try {
    const { slots } = req.body;
    
    if (!Array.isArray(slots) || slots.length === 0) {
      return res.status(400).json({ message: 'Slots array is required' });
    }
    
    let availability = await Availability.findOne({ professional: req.userId });
    
    if (!availability) {
      availability = new Availability({ professional: req.userId });
    }
    
    // Validate and add slots
    const newSlots = slots.map(slot => ({
      date: new Date(slot.date),
      startTime: slot.startTime,
      endTime: slot.endTime,
      isAvailable: slot.isAvailable !== false,
      maxBookings: slot.maxBookings || 1,
      notes: slot.notes
    }));
    
    availability.slots.push(...newSlots);
    await availability.save();
    
    res.json({
      message: 'Availability slots added successfully',
      slots: newSlots
    });
  } catch (error) {
    console.error('Add slots error:', error);
    res.status(500).json({ message: 'Server error adding availability slots' });
  }
});

// Update specific slot
router.put('/slots/:slotId', auth, async (req, res) => {
  try {
    const { slotId } = req.params;
    const updates = req.body;
    
    const availability = await Availability.findOne({ professional: req.userId });
    
    if (!availability) {
      return res.status(404).json({ message: 'Availability not found' });
    }
    
    const slot = availability.slots.id(slotId);
    if (!slot) {
      return res.status(404).json({ message: 'Slot not found' });
    }
    
    // Update slot fields
    Object.keys(updates).forEach(key => {
      if (key === 'date') {
        slot[key] = new Date(updates[key]);
      } else if (slot[key] !== undefined) {
        slot[key] = updates[key];
      }
    });
    
    await availability.save();
    
    res.json({
      message: 'Slot updated successfully',
      slot
    });
  } catch (error) {
    console.error('Update slot error:', error);
    res.status(500).json({ message: 'Server error updating slot' });
  }
});

// Remove slot
router.delete('/slots/:slotId', auth, async (req, res) => {
  try {
    const { slotId } = req.params;
    
    const availability = await Availability.findOne({ professional: req.userId });
    
    if (!availability) {
      return res.status(404).json({ message: 'Availability not found' });
    }
    
    availability.slots = availability.slots.filter(slot => slot._id.toString() !== slotId);
    await availability.save();
    
    res.json({ message: 'Slot removed successfully' });
  } catch (error) {
    console.error('Remove slot error:', error);
    res.status(500).json({ message: 'Server error removing slot' });
  }
});

// Add blocked dates
router.post('/blocked-dates', auth, async (req, res) => {
  try {
    const { blockedDates } = req.body;
    
    if (!Array.isArray(blockedDates) || blockedDates.length === 0) {
      return res.status(400).json({ message: 'Blocked dates array is required' });
    }
    
    let availability = await Availability.findOne({ professional: req.userId });
    
    if (!availability) {
      availability = new Availability({ professional: req.userId });
    }
    
    const newBlockedDates = blockedDates.map(blocked => ({
      date: new Date(blocked.date),
      reason: blocked.reason,
      allDay: blocked.allDay !== false,
      startTime: blocked.startTime,
      endTime: blocked.endTime
    }));
    
    availability.blockedDates.push(...newBlockedDates);
    await availability.save();
    
    res.json({
      message: 'Blocked dates added successfully',
      blockedDates: newBlockedDates
    });
  } catch (error) {
    console.error('Add blocked dates error:', error);
    res.status(500).json({ message: 'Server error adding blocked dates' });
  }
});

// Remove blocked date
router.delete('/blocked-dates/:blockedDateId', auth, async (req, res) => {
  try {
    const { blockedDateId } = req.params;
    
    const availability = await Availability.findOne({ professional: req.userId });
    
    if (!availability) {
      return res.status(404).json({ message: 'Availability not found' });
    }
    
    availability.blockedDates = availability.blockedDates.filter(
      blocked => blocked._id.toString() !== blockedDateId
    );
    await availability.save();
    
    res.json({ message: 'Blocked date removed successfully' });
  } catch (error) {
    console.error('Remove blocked date error:', error);
    res.status(500).json({ message: 'Server error removing blocked date' });
  }
});

// Update booking settings
router.put('/booking-settings', auth, async (req, res) => {
  try {
    const { bookingSettings } = req.body;
    
    let availability = await Availability.findOne({ professional: req.userId });
    
    if (!availability) {
      availability = new Availability({ professional: req.userId });
    }
    
    availability.bookingSettings = {
      ...availability.bookingSettings,
      ...bookingSettings
    };
    
    await availability.save();
    
    res.json({
      message: 'Booking settings updated successfully',
      bookingSettings: availability.bookingSettings
    });
  } catch (error) {
    console.error('Update booking settings error:', error);
    res.status(500).json({ message: 'Server error updating booking settings' });
  }
});

// Update service availability
router.put('/service-availability', auth, async (req, res) => {
  try {
    const { serviceAvailability } = req.body;
    
    if (!Array.isArray(serviceAvailability)) {
      return res.status(400).json({ message: 'Service availability array is required' });
    }
    
    let availability = await Availability.findOne({ professional: req.userId });
    
    if (!availability) {
      availability = new Availability({ professional: req.userId });
    }
    
    availability.serviceAvailability = serviceAvailability;
    await availability.save();
    
    res.json({
      message: 'Service availability updated successfully',
      serviceAvailability: availability.serviceAvailability
    });
  } catch (error) {
    console.error('Update service availability error:', error);
    res.status(500).json({ message: 'Server error updating service availability' });
  }
});

// Update location availability
router.put('/location-availability', auth, async (req, res) => {
  try {
    const { locationAvailability } = req.body;
    
    if (!Array.isArray(locationAvailability)) {
      return res.status(400).json({ message: 'Location availability array is required' });
    }
    
    let availability = await Availability.findOne({ professional: req.userId });
    
    if (!availability) {
      availability = new Availability({ professional: req.userId });
    }
    
    availability.locationAvailability = locationAvailability;
    await availability.save();
    
    res.json({
      message: 'Location availability updated successfully',
      locationAvailability: availability.locationAvailability
    });
  } catch (error) {
    console.error('Update location availability error:', error);
    res.status(500).json({ message: 'Server error updating location availability' });
  }
});

// Toggle availability status
router.put('/toggle-status', auth, async (req, res) => {
  try {
    const { isActive } = req.body;
    
    let availability = await Availability.findOne({ professional: req.userId });
    
    if (!availability) {
      availability = new Availability({ professional: req.userId });
    }
    
    availability.isActive = isActive;
    await availability.save();
    
    res.json({
      message: `Availability ${isActive ? 'activated' : 'deactivated'} successfully`,
      isActive: availability.isActive
    });
  } catch (error) {
    console.error('Toggle availability status error:', error);
    res.status(500).json({ message: 'Server error toggling availability status' });
  }
});

// Get availability for a specific date range
router.get('/range', auth, async (req, res) => {
  try {
    const { startDate, endDate, duration = 60 } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }
    
    const availability = await Availability.findOne({ professional: req.userId });
    
    if (!availability) {
      return res.json({ availability: [] });
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const availableSlots = availability.getAvailableSlots(start, end, duration);
    
    res.json({
      professional: req.userId,
      availability: availableSlots,
      settings: availability.bookingSettings
    });
  } catch (error) {
    console.error('Get availability range error:', error);
    res.status(500).json({ message: 'Server error fetching availability range' });
  }
});

// Get availability statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const availability = await Availability.findOne({ professional: req.userId });
    
    if (!availability) {
      return res.json({
        totalSlots: 0,
        availableSlots: 0,
        blockedDates: 0,
        upcomingBookings: 0
      });
    }
    
    // Count slots for next 30 days
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);
    
    const availableSlots = availability.getAvailableSlots(startDate, endDate, 60);
    
    res.json({
      totalSlots: availableSlots.length,
      availableSlots: availableSlots.filter(slot => slot.available).length,
      blockedDates: availability.blockedDates.length,
      upcomingBookings: 0, // This would be calculated from bookings
      isActive: availability.isActive,
      recurringEnabled: availability.recurring.enabled
    });
  } catch (error) {
    console.error('Get availability stats error:', error);
    res.status(500).json({ message: 'Server error fetching availability statistics' });
  }
});

module.exports = router; 