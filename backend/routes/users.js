const express = require('express');
const router = express.Router();

// Sample users data
let users = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    university: 'IIT Bombay',
    bio: 'Computer Science student passionate about web development',
    skills: ['JavaScript', 'React', 'Node.js'],
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    university: 'IIT Delhi', 
    bio: 'Data Science enthusiast and Python developer',
    skills: ['Python', 'Data Science', 'Machine Learning'],
    avatar: 'https://randomuser.me/api/portraits/women/1.jpg'
  }
];

// GET /api/users - Get all users
router.get('/', (req, res) => {
  res.json({
    message: 'Users retrieved successfully',
    users: users
  });
});

// GET /api/users/:id - Get user by ID
router.get('/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json({
    message: 'User retrieved successfully',
    user: user
  });
});

// PUT /api/users/:id - Update user
router.put('/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  // Update user data
  users[userIndex] = { ...users[userIndex], ...req.body };
  
  res.json({
    message: 'User updated successfully',
    user: users[userIndex]
  });
});

// DELETE /api/users/:id - Delete user
router.delete('/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  users.splice(userIndex, 1);
  
  res.json({
    message: 'User deleted successfully'
  });
});

module.exports = router;