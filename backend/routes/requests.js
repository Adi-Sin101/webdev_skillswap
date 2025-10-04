const express = require('express');
const router = express.Router();

// Sample requests data
let requests = [
  {
    id: 1,
    title: 'Need help with CSS Grid',
    description: 'Looking for someone to explain CSS Grid layout concepts',
    category: 'Design',
    deadline: 'This Week',
    location: 'IIT Bombay',
    type: 'Free',
    userId: 1,
    userName: 'John Doe',
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    title: 'Machine Learning Project Guidance',
    description: 'Need guidance on a ML project using scikit-learn',
    category: 'Tutoring',
    deadline: 'Flexible',
    location: 'IIT Delhi',
    type: 'Free',
    userId: 2,
    userName: 'Jane Smith',
    createdAt: new Date().toISOString()
  }
];

// GET /api/requests - Get all requests
router.get('/', (req, res) => {
  res.json({
    message: 'Requests retrieved successfully',
    requests: requests,
    count: requests.length
  });
});

// GET /api/requests/:id - Get request by ID
router.get('/:id', (req, res) => {
  const requestId = parseInt(req.params.id);
  const request = requests.find(r => r.id === requestId);
  
  if (!request) {
    return res.status(404).json({ error: 'Request not found' });
  }
  
  res.json({
    message: 'Request retrieved successfully',
    request: request
  });
});

// POST /api/requests - Create new request
router.post('/', (req, res) => {
  const { title, description, category, deadline, location, type, userId, userName } = req.body;
  
  const newRequest = {
    id: requests.length + 1,
    title,
    description,
    category,
    deadline,
    location,
    type,
    userId,
    userName,
    createdAt: new Date().toISOString()
  };
  
  requests.push(newRequest);
  
  res.status(201).json({
    message: 'Request created successfully',
    request: newRequest
  });
});

// PUT /api/requests/:id - Update request
router.put('/:id', (req, res) => {
  const requestId = parseInt(req.params.id);
  const requestIndex = requests.findIndex(r => r.id === requestId);
  
  if (requestIndex === -1) {
    return res.status(404).json({ error: 'Request not found' });
  }
  
  requests[requestIndex] = { ...requests[requestIndex], ...req.body };
  
  res.json({
    message: 'Request updated successfully',
    request: requests[requestIndex]
  });
});

// DELETE /api/requests/:id - Delete request
router.delete('/:id', (req, res) => {
  const requestId = parseInt(req.params.id);
  const requestIndex = requests.findIndex(r => r.id === requestId);
  
  if (requestIndex === -1) {
    return res.status(404).json({ error: 'Request not found' });
  }
  
  requests.splice(requestIndex, 1);
  
  res.json({
    message: 'Request deleted successfully'
  });
});

module.exports = router;