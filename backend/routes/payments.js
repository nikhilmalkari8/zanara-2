const express = require('express');
const router = express.Router();

// Initialize Stripe only if we have a valid key
let stripe = null;
const initializeStripe = () => {
  if (!stripe && process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('placeholder')) {
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  }
  return stripe;
};

const auth = require('../middleware/auth');
const Subscription = require('../models/Subscription');
const User = require('../models/User');

// Middleware to check if Stripe is available
const requireStripe = (req, res, next) => {
  if (!initializeStripe()) {
    return res.status(503).json({
      success: false,
      message: 'Payment service is not configured. Please set up Stripe keys in environment variables.',
      error: 'STRIPE_NOT_CONFIGURED'
    });
  }
  next();
};

// Get subscription plans
router.get('/plans', (req, res) => {
  try {
    const plans = {
      basic: Subscription.getPlanFeatures('basic'),
      premium: Subscription.getPlanFeatures('premium'),
      pro: Subscription.getPlanFeatures('pro')
    };

    res.json({
      success: true,
      plans
    });
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch plans'
    });
  }
});

// Get user's current subscription
router.get('/subscription', auth, async (req, res) => {
  try {
    let subscription = await Subscription.findOne({ userId: req.user.id });
    
    if (!subscription) {
      // Create basic subscription for new users
      subscription = new Subscription({
        userId: req.user.id,
        plan: 'basic',
        features: Subscription.getPlanFeatures('basic')
      });
      await subscription.save();
    }

    res.json({
      success: true,
      subscription
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription'
    });
  }
});

// Create Stripe customer and setup intent for subscription
router.post('/create-setup-intent', auth, requireStripe, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    let subscription = await Subscription.findOne({ userId: req.user.id });

    // Create or get Stripe customer
    let customer;
    if (subscription && subscription.stripeCustomerId) {
      customer = await stripe.customers.retrieve(subscription.stripeCustomerId);
    } else {
      customer = await stripe.customers.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        metadata: {
          userId: user._id.toString()
        }
      });

      // Update subscription with customer ID
      if (!subscription) {
        subscription = new Subscription({
          userId: req.user.id,
          plan: 'basic'
        });
      }
      subscription.stripeCustomerId = customer.id;
      await subscription.save();
    }

    // Create setup intent for future payments
    const setupIntent = await stripe.setupIntents.create({
      customer: customer.id,
      payment_method_types: ['card'],
      usage: 'off_session'
    });

    res.json({
      success: true,
      clientSecret: setupIntent.client_secret,
      customerId: customer.id
    });
  } catch (error) {
    console.error('Error creating setup intent:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create setup intent'
    });
  }
});

// Create subscription
router.post('/create-subscription', auth, requireStripe, async (req, res) => {
  try {
    const { planType, paymentMethodId } = req.body;

    if (!['premium', 'pro'].includes(planType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan type'
      });
    }

    const subscription = await Subscription.findOne({ userId: req.user.id });
    if (!subscription || !subscription.stripeCustomerId) {
      return res.status(400).json({
        success: false,
        message: 'Please complete payment setup first'
      });
    }

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: subscription.stripeCustomerId
    });

    // Set as default payment method
    await stripe.customers.update(subscription.stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId
      }
    });

    // Create Stripe subscription
    const planFeatures = Subscription.getPlanFeatures(planType);
    const stripeSubscription = await stripe.subscriptions.create({
      customer: subscription.stripeCustomerId,
      items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Zanara ${planFeatures.name} Plan`,
            description: planFeatures.description
          },
          unit_amount: Math.round(planFeatures.price * 100), // Convert to cents
          recurring: {
            interval: 'month'
          }
        }
      }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent']
    });

    // Update local subscription
    subscription.plan = planType;
    subscription.status = stripeSubscription.status;
    subscription.stripeSubscriptionId = stripeSubscription.id;
    subscription.stripePriceId = stripeSubscription.items.data[0].price.id;
    subscription.currentPeriodStart = new Date(stripeSubscription.current_period_start * 1000);
    subscription.currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000);
    subscription.features = planFeatures;
    await subscription.save();

    res.json({
      success: true,
      subscription: stripeSubscription,
      clientSecret: stripeSubscription.latest_invoice.payment_intent.client_secret
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create subscription'
    });
  }
});

// Cancel subscription
router.post('/cancel-subscription', auth, requireStripe, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ userId: req.user.id });
    
    if (!subscription || !subscription.stripeSubscriptionId) {
      return res.status(400).json({
        success: false,
        message: 'No active subscription found'
      });
    }

    // Cancel at period end in Stripe
    const stripeSubscription = await stripe.subscriptions.update(
      subscription.stripeSubscriptionId,
      { cancel_at_period_end: true }
    );

    // Update local subscription
    subscription.cancelAtPeriodEnd = true;
    await subscription.save();

    res.json({
      success: true,
      message: 'Subscription will be canceled at the end of the current period',
      subscription
    });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel subscription'
    });
  }
});

// Reactivate subscription
router.post('/reactivate-subscription', auth, requireStripe, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ userId: req.user.id });
    
    if (!subscription || !subscription.stripeSubscriptionId) {
      return res.status(400).json({
        success: false,
        message: 'No subscription found'
      });
    }

    // Reactivate in Stripe
    const stripeSubscription = await stripe.subscriptions.update(
      subscription.stripeSubscriptionId,
      { cancel_at_period_end: false }
    );

    // Update local subscription
    subscription.cancelAtPeriodEnd = false;
    subscription.status = stripeSubscription.status;
    await subscription.save();

    res.json({
      success: true,
      message: 'Subscription reactivated successfully',
      subscription
    });
  } catch (error) {
    console.error('Error reactivating subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reactivate subscription'
    });
  }
});

// Check if user can perform action
router.get('/check-feature/:action', auth, async (req, res) => {
  try {
    const { action } = req.params;
    const subscription = await Subscription.findOne({ userId: req.user.id });
    
    if (!subscription) {
      return res.json({
        success: true,
        canPerform: false,
        reason: 'No subscription found'
      });
    }

    const canPerform = subscription.canPerformAction(action);
    const planFeatures = Subscription.getPlanFeatures(subscription.plan);

    res.json({
      success: true,
      canPerform,
      currentPlan: subscription.plan,
      usage: subscription.usage,
      features: planFeatures
    });
  } catch (error) {
    console.error('Error checking feature:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check feature'
    });
  }
});

// Increment usage (when user performs an action)
router.post('/increment-usage/:action', auth, async (req, res) => {
  try {
    const { action } = req.params;
    const subscription = await Subscription.findOne({ userId: req.user.id });
    
    if (!subscription) {
      return res.status(400).json({
        success: false,
        message: 'No subscription found'
      });
    }

    // Check if user can perform action first
    if (!subscription.canPerformAction(action)) {
      return res.status(403).json({
        success: false,
        message: 'Action not allowed with current plan',
        currentPlan: subscription.plan,
        usage: subscription.usage
      });
    }

    await subscription.incrementUsage(action);

    res.json({
      success: true,
      message: 'Usage incremented',
      usage: subscription.usage
    });
  } catch (error) {
    console.error('Error incrementing usage:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to increment usage'
    });
  }
});

// Webhook to handle Stripe events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  // Check if Stripe is configured
  if (!initializeStripe()) {
    console.log('Webhook received but Stripe not configured');
    return res.status(503).json({ error: 'Stripe not configured' });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

// Webhook helper functions
async function handlePaymentSucceeded(invoice) {
  const subscription = await Subscription.findOne({ 
    stripeCustomerId: invoice.customer 
  });
  
  if (subscription) {
    subscription.paymentHistory.push({
      amount: invoice.amount_paid / 100,
      currency: invoice.currency,
      status: 'succeeded',
      stripePaymentIntentId: invoice.payment_intent,
      date: new Date()
    });
    subscription.status = 'active';
    await subscription.save();
  }
}

async function handlePaymentFailed(invoice) {
  const subscription = await Subscription.findOne({ 
    stripeCustomerId: invoice.customer 
  });
  
  if (subscription) {
    subscription.status = 'past_due';
    await subscription.save();
  }
}

async function handleSubscriptionUpdated(stripeSubscription) {
  const subscription = await Subscription.findOne({ 
    stripeSubscriptionId: stripeSubscription.id 
  });
  
  if (subscription) {
    subscription.status = stripeSubscription.status;
    subscription.currentPeriodStart = new Date(stripeSubscription.current_period_start * 1000);
    subscription.currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000);
    subscription.cancelAtPeriodEnd = stripeSubscription.cancel_at_period_end;
    await subscription.save();
  }
}

async function handleSubscriptionDeleted(stripeSubscription) {
  const subscription = await Subscription.findOne({ 
    stripeSubscriptionId: stripeSubscription.id 
  });
  
  if (subscription) {
    // Downgrade to basic plan
    subscription.plan = 'basic';
    subscription.status = 'canceled';
    subscription.features = Subscription.getPlanFeatures('basic');
    subscription.stripeSubscriptionId = null;
    subscription.stripePriceId = null;
    await subscription.save();
  }
}

module.exports = router; 