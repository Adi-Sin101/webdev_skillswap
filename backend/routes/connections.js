import express from 'express';
import {
  sendConnectionRequest,
  acceptConnectionRequest,
  ignoreConnectionRequest,
  getUserConnections,
  getConnectionStatus,
  removeConnection
} from '../controllers/connectionController.js';

const router = express.Router();

// Send a connection request
router.post('/request', sendConnectionRequest);

// Accept a connection request
router.put('/:connectionId/accept', acceptConnectionRequest);

// Ignore/reject a connection request
router.put('/:connectionId/ignore', ignoreConnectionRequest);

// Remove/unfriend a connection
router.delete('/:connectionId', removeConnection);

// Get user's connections and requests
router.get('/user/:userId', getUserConnections);

// Get connection status between two users
router.get('/status/:userId1/:userId2', getConnectionStatus);

export default router;
