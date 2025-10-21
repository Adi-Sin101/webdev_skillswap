import Connection from '../models/Connection.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

// Send a connection request
export const sendConnectionRequest = async (req, res) => {
  try {
    const { recipientId, message } = req.body;
    const requesterId = req.user?.id || req.body.requesterId; // Use authenticated user or fallback

    console.log('📨 Connection request received:');
    console.log('Body:', req.body);
    console.log('Requester ID:', requesterId);
    console.log('Recipient ID:', recipientId);

    // Validation
    if (!requesterId) {
      console.error('❌ No requester ID provided');
      return res.status(400).json({ error: 'Requester ID is required. Please log in again.' });
    }

    if (!recipientId) {
      console.error('❌ No recipient ID provided');
      return res.status(400).json({ error: 'Recipient ID is required' });
    }

    if (requesterId === recipientId) {
      console.error('❌ User trying to connect to themselves');
      return res.status(400).json({ error: 'Cannot send connection request to yourself' });
    }

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if connection already exists
    const existingConnection = await Connection.findOne({
      $or: [
        { requester: requesterId, recipient: recipientId },
        { requester: recipientId, recipient: requesterId }
      ]
    });

    if (existingConnection) {
      return res.status(400).json({ 
        error: 'Connection request already exists or you are already connected',
        status: existingConnection.status 
      });
    }

    // Create connection request
    const connection = new Connection({
      requester: requesterId,
      recipient: recipientId,
      message: message || '',
      status: 'pending'
    });

    await connection.save();
    await connection.populate('requester', 'name email avatar');

    // Create notification for recipient
    try {
      console.log('Creating connection notification...');
      console.log('Recipient ID:', recipientId);
      console.log('Requester ID:', requesterId);
      console.log('Requester name:', connection.requester.name);
      
      const notification = await Notification.create({
        recipient: recipientId,
        sender: requesterId,
        type: 'connection_request',
        title: 'New Connection Request',
        message: `${connection.requester.name} wants to connect with you.`,
        actionUrl: `/profile/${requesterId}?connection=${connection._id}`
      });
      
      console.log('✅ Notification created successfully:', notification._id);
    } catch (notifError) {
      console.error('❌ Error creating connection notification:', notifError);
      console.error('Error details:', notifError.message);
    }

    res.status(201).json({
      message: 'Connection request sent successfully',
      connection
    });
  } catch (error) {
    console.error('❌ Error sending connection request:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to send connection request',
      details: error.message 
    });
  }
};

// Accept a connection request
export const acceptConnectionRequest = async (req, res) => {
  try {
    const { connectionId } = req.params;
    const userId = req.user?.id || req.body.userId; // Use authenticated user or fallback

    const connection = await Connection.findById(connectionId)
      .populate('requester', 'name email avatar')
      .populate('recipient', 'name email avatar');

    if (!connection) {
      return res.status(404).json({ error: 'Connection request not found' });
    }

    // Check if user is the recipient
    if (connection.recipient._id.toString() !== userId) {
      return res.status(403).json({ error: 'You can only accept requests sent to you' });
    }

    if (connection.status !== 'pending') {
      return res.status(400).json({ error: 'Connection request is no longer pending' });
    }

    // Update connection status
    connection.status = 'accepted';
    await connection.save();

    // Create notification for requester
    try {
      await Notification.create({
        recipient: connection.requester._id,
        sender: userId,
        type: 'connection_accepted',
        title: 'Connection Request Accepted',
        message: `${connection.recipient.name} accepted your connection request.`,
        actionUrl: `/profile/${userId}`
      });
    } catch (notifError) {
      console.error('Error creating acceptance notification:', notifError);
    }

    res.json({
      message: 'Connection request accepted',
      connection
    });
  } catch (error) {
    console.error('Error accepting connection request:', error);
    res.status(500).json({ error: 'Failed to accept connection request' });
  }
};

// Ignore/reject a connection request
export const ignoreConnectionRequest = async (req, res) => {
  try {
    const { connectionId } = req.params;
    const userId = req.user?.id || req.body.userId; // Use authenticated user or fallback

    const connection = await Connection.findById(connectionId)
      .populate('recipient', 'name email');

    if (!connection) {
      return res.status(404).json({ error: 'Connection request not found' });
    }

    // Check if user is the recipient
    if (connection.recipient._id.toString() !== userId) {
      return res.status(403).json({ error: 'You can only ignore requests sent to you' });
    }

    if (connection.status !== 'pending') {
      return res.status(400).json({ error: 'Connection request is no longer pending' });
    }

    // Update connection status
    connection.status = 'ignored';
    await connection.save();

    res.json({
      message: 'Connection request ignored',
      connection
    });
  } catch (error) {
    console.error('Error ignoring connection request:', error);
    res.status(500).json({ error: 'Failed to ignore connection request' });
  }
};

// Get user's connections and connection requests
export const getUserConnections = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, type } = req.query; // status: 'pending', 'accepted', 'ignored' | type: 'sent', 'received'

    let query = {
      $or: [
        { requester: userId },
        { recipient: userId }
      ]
    };

    if (status) {
      query.status = status;
    }

    if (type === 'sent') {
      query = { requester: userId };
      if (status) query.status = status;
    } else if (type === 'received') {
      query = { recipient: userId };
      if (status) query.status = status;
    }

    const connections = await Connection.find(query)
      .populate('requester', 'name email avatar university skills')
      .populate('recipient', 'name email avatar university skills')
      .sort({ createdAt: -1 });

    // Separate connections by type for easier frontend handling
    const result = {
      sent: connections.filter(conn => conn.requester._id.toString() === userId),
      received: connections.filter(conn => conn.recipient._id.toString() === userId),
      all: connections,
      counts: {
        total: connections.length,
        pending: connections.filter(conn => conn.status === 'pending').length,
        accepted: connections.filter(conn => conn.status === 'accepted').length,
        ignored: connections.filter(conn => conn.status === 'ignored').length
      }
    };

    res.json(result);
  } catch (error) {
    console.error('Error fetching user connections:', error);
    res.status(500).json({ error: 'Failed to fetch connections' });
  }
};

// Get connection status between two users
export const getConnectionStatus = async (req, res) => {
  try {
    const { userId1, userId2 } = req.params;

    const connection = await Connection.findOne({
      $or: [
        { requester: userId1, recipient: userId2 },
        { requester: userId2, recipient: userId1 }
      ]
    }).populate('requester recipient', 'name');

    if (!connection) {
      return res.json({ status: 'none', connection: null });
    }

    res.json({ 
      status: connection.status,
      connection,
      userRole: connection.requester._id.toString() === userId1 ? 'requester' : 'recipient'
    });
  } catch (error) {
    console.error('Error getting connection status:', error);
    res.status(500).json({ error: 'Failed to get connection status' });
  }
};

// Remove/unfriend a connection
export const removeConnection = async (req, res) => {
  try {
    const { connectionId } = req.params;
    const userId = req.user?.id || req.body.userId;

    const connection = await Connection.findById(connectionId);

    if (!connection) {
      return res.status(404).json({ error: 'Connection not found' });
    }

    // Check if user is part of this connection
    if (connection.requester.toString() !== userId && connection.recipient.toString() !== userId) {
      return res.status(403).json({ error: 'You can only remove your own connections' });
    }

    await Connection.findByIdAndDelete(connectionId);

    res.json({ message: 'Connection removed successfully' });
  } catch (error) {
    console.error('Error removing connection:', error);
    res.status(500).json({ error: 'Failed to remove connection' });
  }
};
