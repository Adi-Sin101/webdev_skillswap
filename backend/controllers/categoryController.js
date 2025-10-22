import Category from '../models/Category.js';

// Get all categories
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ name: 1 })
      .select('name description icon');
    
    res.json({ 
      categories,
      count: categories.length 
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

// Add a new category (admin only - for future use)
export const addCategory = async (req, res) => {
  try {
    const { name, description, icon } = req.body;
    
    const existing = await Category.findOne({ name });
    if (existing) {
      return res.status(400).json({ error: 'Category already exists' });
    }
    
    const category = new Category({
      name,
      description,
      icon
    });
    
    await category.save();
    
    res.status(201).json({
      message: 'Category added successfully',
      category
    });
  } catch (error) {
    console.error('Error adding category:', error);
    res.status(500).json({ error: 'Failed to add category' });
  }
};
