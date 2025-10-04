const express = require('express');
const router = express.Router();

// Sample offers data
let offers = [
  {
    id: 1,
    title: 'React Tutoring',
    description: 'I can help you learn React from basics to advanced concepts',
    category: 'Coding',
    availability: 'Weekends',
    location: 'IIT Bombay',
    type: 'Free',
    userId: 1,
    userName: 'John Doe',
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    title: 'Python Data Science Help',
    description: 'Assistance with Python, pandas, numpy, and data visualization',
    category: 'Tutoring',
    availability: 'Flexible', 
    location: 'IIT Delhi',
    type: 'Free',
    userId: 2,
    userName: 'Jane Smith',
    createdAt: new Date().toISOString()
  }
];

// GET /api/offers - Get all offers
router.get('/', (req, res) => {
  res.json({
    message: 'Offers retrieved successfully',
    offers: offers,
    count: offers.length
  });
});

// GET /api/offers/:id - Get offer by ID
router.get('/:id', (req, res) => {
  const offerId = parseInt(req.params.id);
  const offer = offers.find(o => o.id === offerId);
  
  if (!offer) {
    return res.status(404).json({ error: 'Offer not found' });
  }
  
  res.json({
    message: 'Offer retrieved successfully',
    offer: offer
  });
});

// POST /api/offers - Create new offer
router.post('/', (req, res) => {
  const { title, description, category, availability, location, type, userId, userName } = req.body;
  
  const newOffer = {
    id: offers.length + 1,
    title,
    description,
    category,
    availability,
    location,
    type,
    userId,
    userName,
    createdAt: new Date().toISOString()
  };
  
  offers.push(newOffer);
  
  res.status(201).json({
    message: 'Offer created successfully',
    offer: newOffer
  });
});

// PUT /api/offers/:id - Update offer
router.put('/:id', (req, res) => {
  const offerId = parseInt(req.params.id);
  const offerIndex = offers.findIndex(o => o.id === offerId);
  
  if (offerIndex === -1) {
    return res.status(404).json({ error: 'Offer not found' });
  }
  
  offers[offerIndex] = { ...offers[offerIndex], ...req.body };
  
  res.json({
    message: 'Offer updated successfully',
    offer: offers[offerIndex]
  });
});

// DELETE /api/offers/:id - Delete offer
router.delete('/:id', (req, res) => {
  const offerId = parseInt(req.params.id);
  const offerIndex = offers.findIndex(o => o.id === offerId);
  
  if (offerIndex === -1) {
    return res.status(404).json({ error: 'Offer not found' });
  }
  
  offers.splice(offerIndex, 1);
  
  res.json({
    message: 'Offer deleted successfully'
  });
});

module.exports = router;