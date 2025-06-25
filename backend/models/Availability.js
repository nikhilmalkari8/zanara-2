const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  // Professional who owns this availability
  professional: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Availability Type
  type: {
    type: String,
    enum: ['recurring', 'one-time', 'blocked'],
    required: true
  },
  
  // Recurring Schedule (for regular working hours)
  recurring: {
    enabled: {
      type: Boolean,
      default: false
    },
    schedule: {
      monday: {
        available: { type: Boolean, default: false },
        startTime: String, // Format: "09:00"
        endTime: String,   // Format: "17:00"
        breakStart: String,
        breakEnd: String
      },
      tuesday: {
        available: { type: Boolean, default: false },
        startTime: String,
        endTime: String,
        breakStart: String,
        breakEnd: String
      },
      wednesday: {
        available: { type: Boolean, default: false },
        startTime: String,
        endTime: String,
        breakStart: String,
        breakEnd: String
      },
      thursday: {
        available: { type: Boolean, default: false },
        startTime: String,
        endTime: String,
        breakStart: String,
        breakEnd: String
      },
      friday: {
        available: { type: Boolean, default: false },
        startTime: String,
        endTime: String,
        breakStart: String,
        breakEnd: String
      },
      saturday: {
        available: { type: Boolean, default: false },
        startTime: String,
        endTime: String,
        breakStart: String,
        breakEnd: String
      },
      sunday: {
        available: { type: Boolean, default: false },
        startTime: String,
        endTime: String,
        breakStart: String,
        breakEnd: String
      }
    }
  },
  
  // One-time availability slots
  slots: [{
    date: {
      type: Date,
      required: true
    },
    startTime: {
      type: String,
      required: true
    },
    endTime: {
      type: String,
      required: true
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    maxBookings: {
      type: Number,
      default: 1
    },
    currentBookings: {
      type: Number,
      default: 0
    },
    notes: String
  }],
  
  // Blocked dates (holidays, personal time, etc.)
  blockedDates: [{
    date: {
      type: Date,
      required: true
    },
    reason: String,
    allDay: {
      type: Boolean,
      default: true
    },
    startTime: String,
    endTime: String
  }],
  
  // Booking Settings
  bookingSettings: {
    advanceBookingDays: {
      type: Number,
      default: 30 // How many days in advance clients can book
    },
    sameDayBooking: {
      type: Boolean,
      default: false
    },
    minimumNoticeHours: {
      type: Number,
      default: 24
    },
    maxBookingsPerDay: {
      type: Number,
      default: 3
    },
    sessionDuration: {
      type: Number,
      default: 60 // Default session duration in minutes
    },
    bufferTime: {
      type: Number,
      default: 15 // Buffer time between sessions in minutes
    }
  },
  
  // Service-specific availability
  serviceAvailability: [{
    serviceType: {
      type: String,
      enum: [
        'fashion-shoot',
        'portrait-session',
        'commercial-shoot',
        'editorial-shoot',
        'runway-show',
        'fitting-session',
        'makeup-session',
        'styling-session',
        'consultation',
        'other'
      ]
    },
    available: {
      type: Boolean,
      default: true
    },
    duration: Number, // Custom duration for this service
    price: Number,    // Custom price for this service
    notes: String
  }],
  
  // Location availability
  locationAvailability: [{
    locationType: {
      type: String,
      enum: ['studio', 'outdoor', 'client-location', 'remote', 'other']
    },
    available: {
      type: Boolean,
      default: true
    },
    travelRadius: Number, // in miles/km
    travelFee: Number,
    notes: String
  }],
  
  // Timezone
  timezone: {
    type: String,
    default: 'UTC'
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Metadata
  notes: String,
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for performance
availabilitySchema.index({ professional: 1, type: 1 });
availabilitySchema.index({ 'slots.date': 1, 'slots.startTime': 1 });
availabilitySchema.index({ 'blockedDates.date': 1 });

// Method to check if a specific time slot is available
availabilitySchema.methods.isSlotAvailable = function(date, startTime, endTime) {
  // Check if date is blocked
  const blockedDate = this.blockedDates.find(blocked => 
    blocked.date.toDateString() === date.toDateString()
  );
  
  if (blockedDate) {
    if (blockedDate.allDay) return false;
    // Check if the requested time overlaps with blocked time
    if (startTime < blockedDate.endTime && endTime > blockedDate.startTime) {
      return false;
    }
  }
  
  // Check recurring schedule
  if (this.recurring.enabled) {
    const dayOfWeek = date.toLocaleLowerCase();
    const daySchedule = this.recurring.schedule[dayOfWeek];
    
    if (!daySchedule.available) return false;
    
    // Check if requested time is within working hours
    if (startTime < daySchedule.startTime || endTime > daySchedule.endTime) {
      return false;
    }
    
    // Check break time
    if (daySchedule.breakStart && daySchedule.breakEnd) {
      if (startTime < daySchedule.breakEnd && endTime > daySchedule.breakStart) {
        return false;
      }
    }
  }
  
  // Check one-time slots
  const matchingSlot = this.slots.find(slot => 
    slot.date.toDateString() === date.toDateString() &&
    slot.isAvailable &&
    slot.currentBookings < slot.maxBookings
  );
  
  if (!matchingSlot) return false;
  
  // Check if requested time is within slot time
  if (startTime < matchingSlot.startTime || endTime > matchingSlot.endTime) {
    return false;
  }
  
  return true;
};

// Method to get available slots for a date range
availabilitySchema.methods.getAvailableSlots = function(startDate, endDate, duration = 60) {
  const slots = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.toLocaleDateString('en-US', { weekday: 'lowercase' });
    
    // Check recurring schedule
    if (this.recurring.enabled && this.recurring.schedule[dayOfWeek].available) {
      const daySchedule = this.recurring.schedule[dayOfWeek];
      const startTime = daySchedule.startTime;
      const endTime = daySchedule.endTime;
      
      // Generate time slots
      let currentTime = new Date(currentDate);
      currentTime.setHours(parseInt(startTime.split(':')[0]), parseInt(startTime.split(':')[1]), 0);
      
      const endDateTime = new Date(currentDate);
      endDateTime.setHours(parseInt(endTime.split(':')[0]), parseInt(endTime.split(':')[1]), 0);
      
      while (currentTime < endDateTime) {
        const slotEnd = new Date(currentTime.getTime() + duration * 60000);
        
        if (slotEnd <= endDateTime) {
          slots.push({
            date: new Date(currentDate),
            startTime: currentTime.toTimeString().slice(0, 5),
            endTime: slotEnd.toTimeString().slice(0, 5),
            available: true
          });
        }
        
        currentTime = new Date(currentTime.getTime() + (duration + this.bookingSettings.bufferTime) * 60000);
      }
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return slots;
};

module.exports = mongoose.model('Availability', availabilitySchema); 