const express = require('express');
const router = express.Router();

// Sample data (in-memory storage)
let users = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    university: 'IIT Bombay',
    skills: ['JavaScript', 'React']
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com', 
    university: 'IIT Delhi',
    skills: ['Python', 'Data Science']
  }
];

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { name, email, password, university } = req.body;
  
  // Check if user already exists
  const existingUser = users.find(user => user.email === email);
  if (existingUser) {
    return res.status(400).json({ error: 'User already exists' });
  }
  
  // Create new user
  const newUser = {
    id: users.length + 1,
    name,
    email,
    university,
    skills: []
  };
  
  users.push(newUser);
  
  res.status(201).json({
    message: 'User registered successfully',
    user: newUser
  });
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  // Find user by email
  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  // In real app, verify password here
  res.json({
    message: 'Login successful',
    user: user
  });
});

// GET /api/auth/me (get current user)
router.get('/me', (req, res) => {
  // In real app, get user from JWT token
  res.json({
    user: users[0] // Mock current user
  });
});

module.exports = router;