import express from 'express';
import { getAllUniversities, getCountries, getCities, addUniversity } from '../controllers/universityController.js';

const router = express.Router();

// Get all universities
router.get('/', getAllUniversities);

// Get unique countries
router.get('/countries', getCountries);

// Get cities by country
router.get('/cities', getCities);

// Add new university (for future admin use)
router.post('/', addUniversity);

export default router;
