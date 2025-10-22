import University from '../models/University.js';

// Get all universities
export const getAllUniversities = async (req, res) => {
  try {
    const { search, country, city } = req.query;
    
    let query = { isActive: true };
    
    // Add search filter if provided
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    // Add country filter if provided
    if (country) {
      query.country = country;
    }
    
    // Add city filter if provided
    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }
    
    const universities = await University.find(query)
      .sort({ name: 1 })
      .select('name location city state country');
    
    res.json({ 
      universities,
      count: universities.length 
    });
  } catch (error) {
    console.error('Error fetching universities:', error);
    res.status(500).json({ error: 'Failed to fetch universities' });
  }
};

// Get unique countries
export const getCountries = async (req, res) => {
  try {
    const countries = await University.distinct('country', { isActive: true });
    res.json({ countries: countries.sort() });
  } catch (error) {
    console.error('Error fetching countries:', error);
    res.status(500).json({ error: 'Failed to fetch countries' });
  }
};

// Get unique cities
export const getCities = async (req, res) => {
  try {
    const { country } = req.query;
    const query = { isActive: true };
    
    if (country) {
      query.country = country;
    }
    
    const cities = await University.distinct('city', query);
    res.json({ cities: cities.filter(city => city).sort() });
  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({ error: 'Failed to fetch cities' });
  }
};

// Add a new university (admin only - for future use)
export const addUniversity = async (req, res) => {
  try {
    const { name, location, city, state, country } = req.body;
    
    // Check if university already exists
    const existing = await University.findOne({ name });
    if (existing) {
      return res.status(400).json({ error: 'University already exists' });
    }
    
    const university = new University({
      name,
      location,
      city,
      state,
      country
    });
    
    await university.save();
    
    res.status(201).json({
      message: 'University added successfully',
      university
    });
  } catch (error) {
    console.error('Error adding university:', error);
    res.status(500).json({ error: 'Failed to add university' });
  }
};
