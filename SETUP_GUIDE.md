# 🚀 Zanara Payment & Messaging Setup Guide

This guide will help you implement **Stripe payments** with a **freemium model** and **Socket.IO real-time messaging** in your Zanara fashion platform.

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB running locally or MongoDB Atlas
- Stripe account (free to create)
- Basic knowledge of React and Node.js

## 🔧 Backend Setup

### 1. Install Dependencies

```bash
cd backend
npm install stripe socket.io
```

### 2. Environment Configuration

Copy the environment template:
```bash
cp env.example .env
```

Edit `.env` with your actual values:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/zanara

# JWT Secret (use a secure random string)
JWT_SECRET=your_secure_jwt_secret_here

# Server Configuration
PORT=8001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Stripe Configuration (get these from your Stripe dashboard)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### 3. Get Stripe Keys

1. **Sign up for Stripe**: Go to [stripe.com](https://stripe.com) and create a free account
2. **Get API Keys**: 
   - Go to Developers → API Keys
   - Copy your **Publishable key** (starts with `pk_test_`)
   - Copy your **Secret key** (starts with `sk_test_`)
3. **Set up Webhooks** (for production):
   - Go to Developers → Webhooks
   - Add endpoint: `https://your-domain.com/api/payments/webhook`
   - Select events: `invoice.payment_succeeded`, `invoice.payment_failed`, `customer.subscription.updated`, `customer.subscription.deleted`

### 4. Start Backend Server

```bash
npm start
```

You should see:
```
🚀 Zanara API Server running on port 8001
✅ MongoDB connected successfully
🔌 Socket.IO enabled
💳 Stripe payments: Enabled
```

## 🎨 Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install @stripe/stripe-js @stripe/react-stripe-js socket.io-client
```

### 2. Environment Configuration

Copy the environment template:
```bash
cp env.example .env.local
```

Edit `.env.local`:
```env
# Stripe Configuration
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# API Configuration
REACT_APP_API_URL=http://localhost:8001/api
REACT_APP_SOCKET_URL=http://localhost:8001
```

### 3. Add Components to Your App

Import and use the components in your main app:

```jsx
// In your main App.js or dashboard
import SubscriptionPlans from './components/payments/SubscriptionPlans';
import MessagingCenter from './components/messaging/MessagingCenter';

function Dashboard({ currentUser }) {
  return (
    <div>
      {/* Other components */}
      
      {/* Subscription Management */}
      <SubscriptionPlans 
        currentUser={currentUser}
        onSubscriptionUpdate={(subscription) => {
          // Handle subscription updates
          console.log('Subscription updated:', subscription);
        }}
      />
      
      {/* Messaging Center */}
      <MessagingCenter currentUser={currentUser} />
    </div>
  );
}
```

## 💳 Freemium Model Features

### Plan Structure

| Feature | Basic (Free) | Premium ($9.99/mo) | Pro ($19.99/mo) |
|---------|-------------|-------------------|-----------------|
| Applications/month | 5 | 50 | Unlimited |
| Priority listing | ❌ | ✅ | ✅ |
| Advanced analytics | ❌ | ✅ | ✅ |
| Premium support | ❌ | ✅ | ✅ |
| Portfolio themes | Basic | ✅ | ✅ |
| Verified badge | ❌ | ✅ | ✅ |
| Custom branding | ❌ | ❌ | ✅ |

### Usage Enforcement

The system automatically:
- Tracks monthly application usage
- Resets counters each month
- Blocks actions when limits are reached
- Provides upgrade prompts

### Example Usage Check

```javascript
// Before allowing job application
const canApply = await fetch('/api/payments/check-feature/apply_to_job');
const data = await canApply.json();

if (!data.canPerform) {
  // Show upgrade modal
  showUpgradeModal();
  return;
}

// Proceed with application and increment usage
await fetch('/api/payments/increment-usage/apply_to_job', { method: 'POST' });
```

## 💬 Real-time Messaging Features

### Core Features
- ✅ Real-time messaging with Socket.IO
- ✅ Online/offline status indicators
- ✅ Typing indicators
- ✅ Message read receipts
- ✅ File attachments (images, documents)
- ✅ Message reactions (emojis)
- ✅ Conversation archiving
- ✅ Mobile-responsive design

### Socket Events

**Client → Server:**
- `join_conversation` - Join a conversation room
- `leave_conversation` - Leave a conversation room
- `typing_start` - Start typing indicator
- `typing_stop` - Stop typing indicator
- `get_online_status` - Get online status of users

**Server → Client:**
- `new_message` - New message received
- `message_sent` - Message sent confirmation
- `typing_update` - Typing status update
- `user_online_status` - User online/offline status
- `message_read` - Message read receipt

## 🔄 Integration with Existing Features

### 1. Add "Message" Button to Talent Profiles

```jsx
// In your talent profile component
const handleStartConversation = async (talentId) => {
  const response = await fetch('/api/messages/conversations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ recipientId: talentId })
  });
  
  const data = await response.json();
  if (data.success) {
    // Navigate to messaging center or open chat modal
    openMessaging(data.conversation);
  }
};
```

### 2. Add Subscription Checks to Features

```jsx
// In your job application component
const handleApplyToJob = async (jobId) => {
  // Check if user can apply
  const canApplyResponse = await fetch('/api/payments/check-feature/apply_to_job');
  const canApplyData = await canApplyResponse.json();
  
  if (!canApplyData.canPerform) {
    // Show upgrade modal
    setShowUpgradeModal(true);
    return;
  }
  
  // Proceed with application
  const applyResponse = await fetch(`/api/jobs/${jobId}/apply`, {
    method: 'POST',
    // ... application data
  });
  
  if (applyResponse.ok) {
    // Increment usage counter
    await fetch('/api/payments/increment-usage/apply_to_job', { method: 'POST' });
  }
};
```

## 🧪 Testing

### Test Stripe Payments

Use Stripe's test card numbers:
- **Success**: `4242424242424242`
- **Decline**: `4000000000000002`
- **Insufficient funds**: `4000000000009995`

### Test Socket.IO

1. Open multiple browser tabs
2. Log in as different users
3. Start a conversation
4. Send messages and observe real-time updates
5. Test typing indicators and online status

## 🚀 Deployment Considerations

### Environment Variables for Production

```env
# Production database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/zanara

# Secure JWT secret (use a long random string)
JWT_SECRET=your_very_secure_jwt_secret_for_production

# Production Stripe keys
STRIPE_SECRET_KEY=sk_live_your_live_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key

# Production domain
FRONTEND_URL=https://your-domain.com
```

### Webhook Endpoint

Set up webhook endpoint in Stripe dashboard:
- **URL**: `https://your-domain.com/api/payments/webhook`
- **Events**: Select all subscription and payment events

### Security Considerations

1. **Always validate webhooks** using Stripe's signature verification
2. **Use HTTPS** in production
3. **Secure JWT secrets** - use environment variables
4. **Rate limiting** on API endpoints
5. **Input validation** on all user inputs

## 🎯 Next Steps

1. **Customize the UI** to match your brand
2. **Add more payment features** (invoicing, refunds)
3. **Implement push notifications** for messages
4. **Add video calling** integration
5. **Analytics dashboard** for subscription metrics
6. **Email notifications** for payment events

## 🐛 Troubleshooting

### Common Issues

**Stripe not working:**
- Check API keys are correct
- Verify webhook endpoint is accessible
- Check browser console for errors

**Socket.IO not connecting:**
- Verify backend server is running
- Check CORS configuration
- Ensure JWT token is valid

**Database errors:**
- Check MongoDB connection string
- Verify database permissions
- Check for missing indexes

### Debug Mode

Enable debug logging:
```bash
# Backend
DEBUG=socket.io* npm start

# Frontend
REACT_APP_DEBUG=true npm start
```

## 📞 Support

If you encounter issues:
1. Check the console logs (both frontend and backend)
2. Verify environment variables are set correctly
3. Test with Stripe's test mode first
4. Check network requests in browser dev tools

---

**🎉 Congratulations!** You now have a fully functional freemium platform with real-time messaging. Your users can start with free accounts and upgrade for premium features, while staying connected through real-time chat. 