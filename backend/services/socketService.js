const jwt = require('jsonwebtoken');
const User = require('../models/User');

class SocketService {
  constructor(io) {
    this.io = io;
    this.connectedUsers = new Map(); // userId -> socketId
    this.userSockets = new Map(); // socketId -> userId
    this.typingUsers = new Map(); // conversationId -> Set of userIds
    
    this.setupMiddleware();
    this.setupEventHandlers();
  }

  setupMiddleware() {
    // Authentication middleware for socket connections
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
          return next(new Error('User not found'));
        }

        socket.userId = user._id.toString();
        socket.user = user;
        next();
      } catch (error) {
        console.error('Socket authentication error:', error);
        next(new Error('Authentication failed'));
      }
    });
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User ${socket.user.firstName} ${socket.user.lastName} connected: ${socket.id}`);
      
      this.handleConnection(socket);
      this.handleDisconnection(socket);
      this.handleJoinConversation(socket);
      this.handleLeaveConversation(socket);
      this.handleTyping(socket);
      this.handleStopTyping(socket);
      this.handleOnlineStatus(socket);
    });
  }

  handleConnection(socket) {
    // Store user connection
    this.connectedUsers.set(socket.userId, socket.id);
    this.userSockets.set(socket.id, socket.userId);
    
    // Join user to their personal room
    socket.join(`user_${socket.userId}`);
    
    // Update user's online status
    this.updateUserOnlineStatus(socket.userId, true);
    
    // Emit to user's contacts that they're online
    this.broadcastOnlineStatus(socket.userId, true);
    
    // Send initial data
    socket.emit('connected', {
      message: 'Connected successfully',
      userId: socket.userId
    });
  }

  handleDisconnection(socket) {
    socket.on('disconnect', () => {
      console.log(`User ${socket.user.firstName} ${socket.user.lastName} disconnected: ${socket.id}`);
      
      // Remove from connected users
      this.connectedUsers.delete(socket.userId);
      this.userSockets.delete(socket.id);
      
      // Remove from typing users
      this.typingUsers.forEach((typingSet, conversationId) => {
        if (typingSet.has(socket.userId)) {
          typingSet.delete(socket.userId);
          this.broadcastTypingUpdate(conversationId);
        }
      });
      
      // Update user's online status
      this.updateUserOnlineStatus(socket.userId, false);
      
      // Emit to user's contacts that they're offline
      this.broadcastOnlineStatus(socket.userId, false);
    });
  }

  handleJoinConversation(socket) {
    socket.on('join_conversation', (data) => {
      const { conversationId } = data;
      
      if (!conversationId) {
        return socket.emit('error', { message: 'Conversation ID required' });
      }
      
      socket.join(`conversation_${conversationId}`);
      
      socket.emit('joined_conversation', {
        conversationId,
        message: 'Joined conversation successfully'
      });
      
      console.log(`User ${socket.userId} joined conversation ${conversationId}`);
    });
  }

  handleLeaveConversation(socket) {
    socket.on('leave_conversation', (data) => {
      const { conversationId } = data;
      
      if (!conversationId) {
        return socket.emit('error', { message: 'Conversation ID required' });
      }
      
      socket.leave(`conversation_${conversationId}`);
      
      // Remove from typing users for this conversation
      if (this.typingUsers.has(conversationId)) {
        this.typingUsers.get(conversationId).delete(socket.userId);
        this.broadcastTypingUpdate(conversationId);
      }
      
      socket.emit('left_conversation', {
        conversationId,
        message: 'Left conversation successfully'
      });
      
      console.log(`User ${socket.userId} left conversation ${conversationId}`);
    });
  }

  handleTyping(socket) {
    socket.on('typing_start', (data) => {
      const { conversationId } = data;
      
      if (!conversationId) {
        return socket.emit('error', { message: 'Conversation ID required' });
      }
      
      // Add user to typing users for this conversation
      if (!this.typingUsers.has(conversationId)) {
        this.typingUsers.set(conversationId, new Set());
      }
      
      this.typingUsers.get(conversationId).add(socket.userId);
      this.broadcastTypingUpdate(conversationId);
      
      // Auto-stop typing after 3 seconds
      setTimeout(() => {
        if (this.typingUsers.has(conversationId)) {
          this.typingUsers.get(conversationId).delete(socket.userId);
          this.broadcastTypingUpdate(conversationId);
        }
      }, 3000);
    });
  }

  handleStopTyping(socket) {
    socket.on('typing_stop', (data) => {
      const { conversationId } = data;
      
      if (!conversationId) {
        return socket.emit('error', { message: 'Conversation ID required' });
      }
      
      // Remove user from typing users for this conversation
      if (this.typingUsers.has(conversationId)) {
        this.typingUsers.get(conversationId).delete(socket.userId);
        this.broadcastTypingUpdate(conversationId);
      }
    });
  }

  handleOnlineStatus(socket) {
    socket.on('get_online_status', async (data) => {
      const { userIds } = data;
      
      if (!Array.isArray(userIds)) {
        return socket.emit('error', { message: 'User IDs must be an array' });
      }
      
      const onlineStatus = {};
      userIds.forEach(userId => {
        onlineStatus[userId] = this.connectedUsers.has(userId);
      });
      
      socket.emit('online_status', onlineStatus);
    });
  }

  // Helper methods
  broadcastTypingUpdate(conversationId) {
    const typingUsers = this.typingUsers.get(conversationId);
    const typingUserIds = typingUsers ? Array.from(typingUsers) : [];
    
    this.io.to(`conversation_${conversationId}`).emit('typing_update', {
      conversationId,
      typingUsers: typingUserIds
    });
  }

  async updateUserOnlineStatus(userId, isOnline) {
    try {
      await User.findByIdAndUpdate(userId, {
        isOnline,
        lastSeenAt: new Date()
      });
    } catch (error) {
      console.error('Error updating user online status:', error);
    }
  }

  async broadcastOnlineStatus(userId, isOnline) {
    // This would typically involve finding user's contacts and notifying them
    // For now, we'll broadcast to all connected users
    this.io.emit('user_online_status', {
      userId,
      isOnline,
      timestamp: new Date()
    });
  }

  // Public methods for sending messages from routes
  sendMessageToUser(userId, event, data) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(`user_${userId}`).emit(event, data);
      return true;
    }
    return false;
  }

  sendMessageToConversation(conversationId, event, data, excludeUserId = null) {
    if (excludeUserId) {
      const excludeSocketId = this.connectedUsers.get(excludeUserId);
      if (excludeSocketId) {
        this.io.to(`conversation_${conversationId}`).except(excludeSocketId).emit(event, data);
      } else {
        this.io.to(`conversation_${conversationId}`).emit(event, data);
      }
    } else {
      this.io.to(`conversation_${conversationId}`).emit(event, data);
    }
  }

  // Get online users count
  getOnlineUsersCount() {
    return this.connectedUsers.size;
  }

  // Get online users
  getOnlineUsers() {
    return Array.from(this.connectedUsers.keys());
  }

  // Check if user is online
  isUserOnline(userId) {
    return this.connectedUsers.has(userId);
  }

  // Send notification to user
  sendNotification(userId, notification) {
    this.sendMessageToUser(userId, 'notification', notification);
  }

  // Broadcast system message
  broadcastSystemMessage(message) {
    this.io.emit('system_message', {
      message,
      timestamp: new Date()
    });
  }
}

module.exports = SocketService; 