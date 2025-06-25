import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, DollarSign, MessageCircle, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const BookingDashboard = ({ user, onLogout, setCurrentPage }) => {
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    fetchBookings();
    fetchStats();
  }, [activeTab]);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const status = activeTab === 'all' ? '' : activeTab;
      
      const response = await fetch(`http://localhost:8001/api/bookings/my-bookings?status=${status}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings || []);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8001/api/bookings/stats/overview', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus, reason = '') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8001/api/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus, reason })
      });
      
      if (response.ok) {
        fetchBookings();
        fetchStats();
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-500';
      case 'confirmed': return 'bg-blue-500/20 text-blue-500';
      case 'deposit-paid': return 'bg-purple-500/20 text-purple-500';
      case 'in-progress': return 'bg-orange-500/20 text-orange-500';
      case 'completed': return 'bg-green-500/20 text-green-500';
      case 'cancelled': return 'bg-red-500/20 text-red-500';
      case 'disputed': return 'bg-red-600/20 text-red-600';
      case 'refunded': return 'bg-gray-500/20 text-gray-500';
      default: return 'bg-gray-500/20 text-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <AlertCircle className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'deposit-paid': return <DollarSign className="w-4 h-4" />;
      case 'in-progress': return <Clock className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      case 'disputed': return <AlertCircle className="w-4 h-4" />;
      case 'refunded': return <DollarSign className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isClient = (booking) => booking.client._id === user.id;
  const isProfessional = (booking) => booking.professional._id === user.id;

  const renderBookingCard = (booking) => {
    const otherUser = isClient(booking) ? booking.professional : booking.client;
    const role = isClient(booking) ? 'Client' : 'Professional';

    return (
      <div
        key={booking._id}
        className="glass-effect rounded-xl p-6 hover:bg-white/5 transition-all duration-300 cursor-pointer"
        onClick={() => {
          setSelectedBooking(booking);
          setShowBookingModal(true);
        }}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500">
              <img
                src={otherUser.profilePicture || '/api/placeholder/48/48'}
                alt={otherUser.firstName}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-white font-medium">
                {otherUser.firstName} {otherUser.lastName}
              </h3>
              <p className="text-white/60 text-sm">{role}</p>
            </div>
          </div>
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
            {getStatusIcon(booking.status)}
            <span>{booking.status.replace('-', ' ')}</span>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <h4 className="text-white font-medium mb-1">{booking.title}</h4>
            <p className="text-white/70 text-sm line-clamp-2">{booking.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2 text-white/70">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(booking.startTime)}</span>
            </div>
            <div className="flex items-center space-x-2 text-white/70">
              <Clock className="w-4 h-4" />
              <span>{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</span>
            </div>
            <div className="flex items-center space-x-2 text-white/70">
              <MapPin className="w-4 h-4" />
              <span>{booking.location?.venue || booking.location?.address?.city || 'Location TBD'}</span>
            </div>
            <div className="flex items-center space-x-2 text-white/70">
              <DollarSign className="w-4 h-4" />
              <span>${booking.pricing?.totalAmount || 0}</span>
            </div>
          </div>

          {booking.messages && booking.messages.length > 0 && (
            <div className="flex items-center space-x-2 text-white/60 text-sm">
              <MessageCircle className="w-4 h-4" />
              <span>{booking.messages.length} messages</span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
          <span className="text-white/50 text-xs">#{booking.bookingId}</span>
          <div className="flex space-x-2">
            {booking.status === 'pending' && isProfessional(booking) && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusUpdate(booking.bookingId, 'confirmed');
                  }}
                  className="px-3 py-1 bg-green-500/20 text-green-500 rounded-lg text-xs hover:bg-green-500/30 transition-colors"
                >
                  Confirm
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusUpdate(booking.bookingId, 'cancelled');
                  }}
                  className="px-3 py-1 bg-red-500/20 text-red-500 rounded-lg text-xs hover:bg-red-500/30 transition-colors"
                >
                  Decline
                </button>
              </>
            )}
            {booking.status === 'confirmed' && isClient(booking) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentPage('payment');
                }}
                className="px-3 py-1 bg-blue-500/20 text-blue-500 rounded-lg text-xs hover:bg-blue-500/30 transition-colors"
              >
                Pay Deposit
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="glass-effect rounded-2xl p-8 text-center">
            <div className="text-white text-xl">Loading bookings...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="glass-effect rounded-2xl p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-light text-white mb-2">
                Booking Dashboard
              </h1>
              <p className="text-white/60">Manage your appointments and sessions</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setCurrentPage('create-booking')}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
              >
                + New Booking
              </button>
              <button
                onClick={() => setCurrentPage('availability')}
                className="px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all duration-300"
              >
                Manage Availability
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Bookings', value: stats.total || 0, icon: Calendar, color: 'from-blue-500 to-cyan-500' },
            { label: 'Upcoming', value: stats.upcoming || 0, icon: Clock, color: 'from-green-500 to-emerald-500' },
            { label: 'Today', value: stats.today || 0, icon: CheckCircle, color: 'from-purple-500 to-pink-500' },
            { label: 'Completed', value: stats.byStatus?.completed || 0, icon: CheckCircle, color: 'from-green-600 to-teal-500' }
          ].map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="glass-effect rounded-xl p-6">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center mb-4`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-light text-white mb-1">{stat.value}</div>
                <div className="text-white/60 text-sm">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="glass-effect rounded-xl p-2 mb-8">
          <div className="flex space-x-2">
            {[
              { key: 'upcoming', label: 'Upcoming', count: stats.upcoming || 0 },
              { key: 'pending', label: 'Pending', count: stats.byStatus?.pending || 0 },
              { key: 'confirmed', label: 'Confirmed', count: stats.byStatus?.confirmed || 0 },
              { key: 'completed', label: 'Completed', count: stats.byStatus?.completed || 0 },
              { key: 'cancelled', label: 'Cancelled', count: stats.byStatus?.cancelled || 0 },
              { key: 'all', label: 'All', count: stats.total || 0 }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  activeTab === tab.key
                    ? 'bg-white/20 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-2 px-2 py-1 bg-white/20 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {bookings.length === 0 ? (
            <div className="col-span-full glass-effect rounded-xl p-12 text-center">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-xl text-white mb-2">No bookings found</h3>
              <p className="text-white/60 mb-6">
                {activeTab === 'upcoming' 
                  ? "You don't have any upcoming bookings."
                  : `No ${activeTab} bookings found.`
                }
              </p>
              <button
                onClick={() => setCurrentPage('create-booking')}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
              >
                Create Your First Booking
              </button>
            </div>
          ) : (
            bookings.map(renderBookingCard)
          )}
        </div>
      </div>

      {/* Booking Detail Modal */}
      {showBookingModal && selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          user={user}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedBooking(null);
          }}
          onStatusUpdate={handleStatusUpdate}
          onRefresh={() => {
            fetchBookings();
            fetchStats();
          }}
        />
      )}
    </div>
  );
};

// Booking Detail Modal Component
const BookingDetailModal = ({ booking, user, onClose, onStatusUpdate, onRefresh }) => {
  const [activeTab, setActiveTab] = useState('details');
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  const isClient = booking.client._id === user.id;
  const isProfessional = booking.professional._id === user.id;
  const otherUser = isClient ? booking.professional : booking.client;

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    
    setSendingMessage(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8001/api/bookings/${booking.bookingId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: newMessage })
      });
      
      if (response.ok) {
        setNewMessage('');
        onRefresh();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="glass-effect rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-light text-white">Booking Details</h2>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Left Panel */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Booking Info */}
              <div className="glass-effect rounded-xl p-6">
                <h3 className="text-xl text-white mb-4">{booking.title}</h3>
                <p className="text-white/70 mb-4">{booking.description}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2 text-white/70">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(booking.startTime).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-white/70">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(booking.startTime).toLocaleTimeString()} - {new Date(booking.endTime).toLocaleTimeString()}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-white/70">
                    <MapPin className="w-4 h-4" />
                    <span>{booking.location?.venue || booking.location?.address?.city || 'Location TBD'}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-white/70">
                    <DollarSign className="w-4 h-4" />
                    <span>${booking.pricing?.totalAmount || 0}</span>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="glass-effect rounded-xl p-6">
                <h3 className="text-xl text-white mb-4">Messages</h3>
                <div className="space-y-4 max-h-64 overflow-y-auto">
                  {booking.messages && booking.messages.length > 0 ? (
                    booking.messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${message.sender === user.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs px-4 py-2 rounded-lg ${
                          message.sender === user.id
                            ? 'bg-blue-500/20 text-blue-100'
                            : 'bg-white/10 text-white'
                        }`}>
                          <p className="text-sm">{message.message}</p>
                          <p className="text-xs opacity-60 mt-1">
                            {new Date(message.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-white/60 text-center py-4">No messages yet</p>
                  )}
                </div>
                
                <div className="flex space-x-2 mt-4">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 bg-white/10 text-white rounded-lg border border-white/20 focus:outline-none focus:border-white/40"
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={sendingMessage || !newMessage.trim()}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="w-80 p-6 border-l border-white/10 overflow-y-auto">
            <div className="space-y-6">
              {/* Other User Info */}
              <div className="glass-effect rounded-xl p-6 text-center">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 mx-auto mb-4">
                  <img
                    src={otherUser.profilePicture || '/api/placeholder/80/80'}
                    alt={otherUser.firstName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-white font-medium">
                  {otherUser.firstName} {otherUser.lastName}
                </h3>
                <p className="text-white/60 text-sm">{isClient ? 'Professional' : 'Client'}</p>
                <p className="text-white/60 text-sm">{otherUser.email}</p>
              </div>

              {/* Status Actions */}
              <div className="glass-effect rounded-xl p-6">
                <h3 className="text-white font-medium mb-4">Actions</h3>
                <div className="space-y-3">
                  {booking.status === 'pending' && isProfessional && (
                    <>
                      <button
                        onClick={() => onStatusUpdate(booking.bookingId, 'confirmed')}
                        className="w-full px-4 py-2 bg-green-500/20 text-green-500 rounded-lg hover:bg-green-500/30 transition-colors"
                      >
                        Confirm Booking
                      </button>
                      <button
                        onClick={() => onStatusUpdate(booking.bookingId, 'cancelled')}
                        className="w-full px-4 py-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors"
                      >
                        Decline Booking
                      </button>
                    </>
                  )}
                  
                  {booking.status === 'confirmed' && isClient && (
                    <button
                      onClick={() => {/* Navigate to payment */}}
                      className="w-full px-4 py-2 bg-blue-500/20 text-blue-500 rounded-lg hover:bg-blue-500/30 transition-colors"
                    >
                      Pay Deposit
                    </button>
                  )}
                  
                  {booking.status === 'in-progress' && (
                    <button
                      onClick={() => onStatusUpdate(booking.bookingId, 'completed')}
                      className="w-full px-4 py-2 bg-green-500/20 text-green-500 rounded-lg hover:bg-green-500/30 transition-colors"
                    >
                      Mark Complete
                    </button>
                  )}
                  
                  {['pending', 'confirmed', 'deposit-paid'].includes(booking.status) && (
                    <button
                      onClick={() => onStatusUpdate(booking.bookingId, 'cancelled')}
                      className="w-full px-4 py-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors"
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>

              {/* Booking Details */}
              <div className="glass-effect rounded-xl p-6">
                <h3 className="text-white font-medium mb-4">Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/60">Booking ID:</span>
                    <span className="text-white">#{booking.bookingId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Service:</span>
                    <span className="text-white">{booking.serviceType.replace('-', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Duration:</span>
                    <span className="text-white">{booking.duration} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Total Amount:</span>
                    <span className="text-white">${booking.pricing?.totalAmount || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Status:</span>
                    <span className="text-white capitalize">{booking.status.replace('-', ' ')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDashboard; 