const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  // Basic Booking Information
  bookingId: {
    type: String,
    unique: true,
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  
  // Participants
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  professional: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Service Details
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
    ],
    required: true
  },
  
  // Timing
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  
  // Location
  location: {
    type: {
      type: String,
      enum: ['studio', 'outdoor', 'client-location', 'remote', 'other'],
      required: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    },
    venue: String,
    coordinates: {
      lat: Number,
      lng: Number
    },
    notes: String
  },
  
  // Pricing & Payment
  pricing: {
    basePrice: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    },
    additionalFees: [{
      name: String,
      amount: Number,
      description: String
    }],
    totalAmount: {
      type: Number,
      required: true
    },
    depositAmount: {
      type: Number,
      default: 0
    },
    depositPaid: {
      type: Boolean,
      default: false
    },
    fullPaymentPaid: {
      type: Boolean,
      default: false
    }
  },
  
  // Status & Workflow
  status: {
    type: String,
    enum: [
      'pending',           // Initial booking request
      'confirmed',         // Both parties agreed
      'deposit-paid',      // Deposit received
      'in-progress',       // Session started
      'completed',         // Session finished
      'cancelled',         // Cancelled by either party
      'disputed',          // Payment or service dispute
      'refunded'           // Full or partial refund
    ],
    default: 'pending'
  },
  
  // Cancellation & Changes
  cancellationReason: String,
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancelledAt: Date,
  rescheduledFrom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  
  // Requirements & Details
  requirements: {
    equipment: [String],
    wardrobe: [String],
    props: [String],
    specialRequests: String,
    teamMembers: [{
      role: String,
      name: String,
      contact: String
    }]
  },
  
  // Communication
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    read: {
      type: Boolean,
      default: false
    }
  }],
  
  // Deliverables
  deliverables: {
    expected: [String],
    delivered: [String],
    deliveryDate: Date,
    notes: String
  },
  
  // Reviews & Feedback
  review: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    submittedAt: Date
  },
  
  // Metadata
  tags: [String],
  notes: String,
  internalNotes: String, // For admin use
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Generate unique booking ID
bookingSchema.pre('save', function(next) {
  if (!this.bookingId) {
    this.bookingId = 'BK' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
  }
  next();
});

// Indexes for performance
bookingSchema.index({ client: 1, startTime: 1 });
bookingSchema.index({ professional: 1, startTime: 1 });
bookingSchema.index({ status: 1, startTime: 1 });
bookingSchema.index({ bookingId: 1 });
bookingSchema.index({ 'location.coordinates': '2dsphere' });

// Virtual for checking if booking is in the past
bookingSchema.virtual('isPast').get(function() {
  return this.endTime < new Date();
});

// Virtual for checking if booking is today
bookingSchema.virtual('isToday').get(function() {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  return this.startTime >= startOfDay && this.startTime < endOfDay;
});

// Virtual for checking if booking is upcoming
bookingSchema.virtual('isUpcoming').get(function() {
  return this.startTime > new Date();
});

module.exports = mongoose.model('Booking', bookingSchema); 