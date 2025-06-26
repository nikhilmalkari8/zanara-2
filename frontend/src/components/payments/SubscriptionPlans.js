import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Crown, Check, Star, Zap, Shield, Palette } from 'lucide-react';

// Initialize Stripe (you'll need to add your publishable key to .env)
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const SubscriptionPlans = ({ currentUser, onSubscriptionUpdate }) => {
  const [plans, setPlans] = useState({});
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    fetchPlans();
    fetchCurrentSubscription();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/payments/plans');
      const data = await response.json();
      if (data.success) {
        setPlans(data.plans);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const fetchCurrentSubscription = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/payments/subscription', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setCurrentSubscription(data.subscription);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (planType) => {
    if (planType === 'basic') return; // Basic is free
    setSelectedPlan(planType);
    setShowPaymentModal(true);
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/payments/cancel-subscription', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setCurrentSubscription(data.subscription);
        alert('Subscription canceled successfully. You will retain access until the end of your billing period.');
        if (onSubscriptionUpdate) onSubscriptionUpdate(data.subscription);
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      alert('Failed to cancel subscription. Please try again.');
    }
  };

  const getPlanIcon = (planType) => {
    switch (planType) {
      case 'basic': return <Star className="w-8 h-8 text-gray-400" />;
      case 'premium': return <Crown className="w-8 h-8 text-purple-500" />;
      case 'pro': return <Zap className="w-8 h-8 text-yellow-500" />;
      default: return <Star className="w-8 h-8" />;
    }
  };

  const getPlanFeatures = (planType) => {
    const baseFeatures = {
      basic: [
        '5 applications per month',
        'Basic profile visibility',
        'Standard support',
        'Basic portfolio themes'
      ],
      premium: [
        '50 applications per month',
        'Priority listing in search',
        'Advanced analytics dashboard',
        'Premium support',
        'Custom portfolio themes',
        'Verified professional badge',
        'Enhanced profile features'
      ],
      pro: [
        'Unlimited applications',
        'Top priority listing',
        'Advanced analytics & insights',
        'Priority support & consultation',
        'All premium themes',
        'Verified professional badge',
        'Custom branding options',
        'API access for integrations'
      ]
    };
    return baseFeatures[planType] || [];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">
          Choose Your Plan
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Unlock your potential with our professional plans designed for fashion industry talent
        </p>
      </div>

      {/* Current Subscription Status */}
      {currentSubscription && (
        <div className="mb-8 p-6 bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-2xl border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Current Plan: {plans[currentSubscription.plan]?.name}
              </h3>
              <p className="text-gray-300">
                Status: <span className="capitalize text-green-400">{currentSubscription.status}</span>
              </p>
              {currentSubscription.currentPeriodEnd && (
                <p className="text-gray-300 text-sm mt-1">
                  {currentSubscription.cancelAtPeriodEnd ? 'Expires' : 'Renews'} on:{' '}
                  {new Date(currentSubscription.currentPeriodEnd).toLocaleDateString()}
                </p>
              )}
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">
                ${plans[currentSubscription.plan]?.price}/month
              </div>
              {currentSubscription.plan !== 'basic' && !currentSubscription.cancelAtPeriodEnd && (
                <button
                  onClick={handleCancelSubscription}
                  className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
                >
                  Cancel Subscription
                </button>
              )}
            </div>
          </div>

          {/* Usage Stats */}
          <div className="mt-4 pt-4 border-t border-purple-500/30">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {currentSubscription.usage?.applicationsThisMonth || 0}
                </div>
                <div className="text-sm text-gray-300">Applications This Month</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-400">
                  {currentSubscription.features?.maxApplicationsPerMonth === -1 
                    ? '∞' 
                    : currentSubscription.features?.maxApplicationsPerMonth || 0}
                </div>
                <div className="text-sm text-gray-300">Monthly Limit</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {currentSubscription.features?.priorityListing ? 'Active' : 'Inactive'}
                </div>
                <div className="text-sm text-gray-300">Priority Listing</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {Object.entries(plans).map(([planType, plan]) => (
          <div
            key={planType}
            className={`relative p-8 rounded-2xl border-2 transition-all duration-300 ${
              currentSubscription?.plan === planType
                ? 'border-purple-500 bg-gradient-to-b from-purple-900/50 to-pink-900/50 scale-105'
                : planType === 'premium'
                ? 'border-purple-400 bg-gradient-to-b from-purple-900/30 to-pink-900/30 hover:scale-105'
                : 'border-gray-600 bg-gradient-to-b from-gray-900/50 to-gray-800/50 hover:border-gray-500'
            }`}
          >
            {/* Popular Badge */}
            {planType === 'premium' && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
              </div>
            )}

            {/* Current Plan Badge */}
            {currentSubscription?.plan === planType && (
              <div className="absolute -top-4 right-4">
                <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  Current Plan
                </div>
              </div>
            )}

            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                {getPlanIcon(planType)}
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
              <p className="text-gray-300 text-sm mb-4">{plan.description}</p>
              <div className="text-4xl font-bold text-white">
                ${plan.price}
                <span className="text-lg font-normal text-gray-300">/month</span>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3 mb-8">
              {getPlanFeatures(planType).map((feature, index) => (
                <div key={index} className="flex items-center">
                  <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">{feature}</span>
                </div>
              ))}
            </div>

            {/* Action Button */}
            <button
              onClick={() => handleSelectPlan(planType)}
              disabled={currentSubscription?.plan === planType || planType === 'basic'}
              className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                currentSubscription?.plan === planType
                  ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                  : planType === 'basic'
                  ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                  : planType === 'premium'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white'
                  : 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white'
              }`}
            >
              {currentSubscription?.plan === planType
                ? 'Current Plan'
                : planType === 'basic'
                ? 'Free Forever'
                : `Upgrade to ${plan.name}`}
            </button>
          </div>
        ))}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedPlan && (
        <Elements stripe={stripePromise}>
          <PaymentModal
            plan={plans[selectedPlan]}
            planType={selectedPlan}
            onClose={() => {
              setShowPaymentModal(false);
              setSelectedPlan(null);
            }}
            onSuccess={(subscription) => {
              setCurrentSubscription(subscription);
              setShowPaymentModal(false);
              setSelectedPlan(null);
              if (onSubscriptionUpdate) onSubscriptionUpdate(subscription);
            }}
          />
        </Elements>
      )}
    </div>
  );
};

// Payment Modal Component
const PaymentModal = ({ plan, planType, onClose, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) return;
    
    setProcessing(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      
      // Create setup intent
      const setupResponse = await fetch('/api/payments/create-setup-intent', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const setupData = await setupResponse.json();
      if (!setupData.success) {
        throw new Error(setupData.message);
      }

      // Confirm setup intent
      const { error: setupError, setupIntent } = await stripe.confirmCardSetup(
        setupData.clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
          }
        }
      );

      if (setupError) {
        throw new Error(setupError.message);
      }

      // Create subscription
      const subscriptionResponse = await fetch('/api/payments/create-subscription', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          planType,
          paymentMethodId: setupIntent.payment_method
        })
      });

      const subscriptionData = await subscriptionResponse.json();
      if (!subscriptionData.success) {
        throw new Error(subscriptionData.message);
      }

      // Confirm payment if needed
      if (subscriptionData.clientSecret) {
        const { error: paymentError } = await stripe.confirmCardPayment(subscriptionData.clientSecret);
        if (paymentError) {
          throw new Error(paymentError.message);
        }
      }

      onSuccess(subscriptionData.subscription);
      alert('Subscription created successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-2xl p-8 max-w-md w-full border border-gray-700">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-white mb-2">
            Upgrade to {plan.name}
          </h3>
          <p className="text-gray-300">
            ${plan.price}/month • {plan.description}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Payment Method
            </label>
            <div className="p-4 border border-gray-600 rounded-lg bg-gray-800">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#fff',
                      '::placeholder': {
                        color: '#9ca3af',
                      },
                    },
                  },
                }}
              />
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-6 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!stripe || processing}
              className="flex-1 py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {processing ? 'Processing...' : `Subscribe - $${plan.price}/mo`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubscriptionPlans; 