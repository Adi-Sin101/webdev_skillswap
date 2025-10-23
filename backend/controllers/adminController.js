import User from '../models/User.js';
import Offer from '../models/offer.js';
import Request from '../models/Request.js';
import Category from '../models/Category.js';
import University from '../models/University.js';
import Response from '../models/Response.js';

// Dashboard Stats
export const getDashboardStats = async (req, res) => {
  try {
    // Total users
    const totalUsers = await User.countDocuments();
    
    // Active users (logged in last 30 days - we can track this later with lastLogin field)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const activeUsers = await User.countDocuments({ 
      createdAt: { $gte: thirtyDaysAgo } 
    });
    
    // Total posts
    const totalOffers = await Offer.countDocuments();
    const totalRequests = await Request.countDocuments();
    const totalPosts = totalOffers + totalRequests;
    
    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentUsers = await User.countDocuments({ 
      createdAt: { $gte: sevenDaysAgo } 
    });
    const recentOffers = await Offer.countDocuments({ 
      createdAt: { $gte: sevenDaysAgo } 
    });
    const recentRequests = await Request.countDocuments({ 
      createdAt: { $gte: sevenDaysAgo } 
    });
    
    // Total applications
    const totalApplications = await Response.countDocuments();
    
    // Accepted applications
    const acceptedApplications = await Response.countDocuments({ 
      status: 'accepted' 
    });
    
    // Completed swaps
    const completedSwaps = await Response.countDocuments({ 
      isCompleted: true 
    });
    
    // Banned users
    const bannedUsers = await User.countDocuments({ isBanned: true });
    
    // Hidden posts
    const hiddenPosts = await Offer.countDocuments({ isHidden: true }) + 
                        await Request.countDocuments({ isHidden: true });
    
    // User growth (monthly for last 6 months)
    const userGrowth = [];
    for (let i = 5; i >= 0; i--) {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - i);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
      
      const count = await User.countDocuments({
        createdAt: { $gte: startDate, $lt: endDate }
      });
      
      userGrowth.push({
        month: startDate.toLocaleString('default', { month: 'short', year: 'numeric' }),
        count
      });
    }

    res.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        totalPosts,
        totalOffers,
        totalRequests,
        totalApplications,
        acceptedApplications,
        completedSwaps,
        bannedUsers,
        hiddenPosts,
        recentActivity: {
          users: recentUsers,
          offers: recentOffers,
          requests: recentRequests
        },
        userGrowth
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch dashboard statistics',
      message: error.message 
    });
  }
};

// User Management
export const getAllUsers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search = '', 
      university = '',
      role = '',
      isBanned = ''
    } = req.query;

    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (university) {
      query.university = university;
    }
    
    if (role) {
      query.role = role;
    }
    
    if (isBanned !== '') {
      query.isBanned = isBanned === 'true';
    }

    // Fetch users with pagination
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalUsers: count
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      error: 'Failed to fetch users',
      message: error.message 
    });
  }
};

export const getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's posts and applications
    const offers = await Offer.countDocuments({ user: user._id });
    const requests = await Request.countDocuments({ user: user._id });
    const applications = await Response.countDocuments({ applicant: user._id });

    res.json({
      success: true,
      user: {
        ...user.toObject(),
        stats: {
          offers,
          requests,
          applications
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user details',
      message: error.message 
    });
  }
};

export const banUser = async (req, res) => {
  try {
    const { reason } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        isBanned: true,
        bannedAt: new Date(),
        bannedReason: reason || 'No reason provided'
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      message: 'User banned successfully',
      user
    });
  } catch (error) {
    console.error('Error banning user:', error);
    res.status(500).json({ 
      error: 'Failed to ban user',
      message: error.message 
    });
  }
};

export const unbanUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        isBanned: false,
        $unset: { bannedAt: '', bannedReason: '' }
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      message: 'User unbanned successfully',
      user
    });
  } catch (error) {
    console.error('Error unbanning user:', error);
    res.status(500).json({ 
      error: 'Failed to unban user',
      message: error.message 
    });
  }
};

// Post Management
export const getAllPosts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search = '', 
      type = '', // 'offer' or 'request'
      category = '',
      isHidden = ''
    } = req.query;

    const skip = (page - 1) * limit;
    let posts = [];
    let count = 0;

    // Build query for filtering
    const buildQuery = () => {
      const query = {};
      
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }
      
      if (category) {
        query.category = category;
      }
      
      if (isHidden !== '') {
        query.isHidden = isHidden === 'true';
      }
      
      return query;
    };

    if (type === 'offer') {
      const query = buildQuery();
      const offers = await Offer.find(query)
        .populate('user', 'name email profilePicture university')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip(skip);
      
      posts = offers.map(offer => ({ ...offer.toObject(), type: 'offer' }));
      count = await Offer.countDocuments(query);
    } else if (type === 'request') {
      const query = buildQuery();
      const requests = await Request.find(query)
        .populate('user', 'name email profilePicture university')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip(skip);
      
      posts = requests.map(request => ({ ...request.toObject(), type: 'request' }));
      count = await Request.countDocuments(query);
    } else {
      // Fetch both
      const query = buildQuery();
      const [offers, requests] = await Promise.all([
        Offer.find(query)
          .populate('user', 'name email profilePicture university')
          .sort({ createdAt: -1 })
          .limit(Math.ceil(limit / 2))
          .skip(Math.floor(skip / 2)),
        Request.find(query)
          .populate('user', 'name email profilePicture university')
          .sort({ createdAt: -1 })
          .limit(Math.ceil(limit / 2))
          .skip(Math.floor(skip / 2))
      ]);
      
      posts = [
        ...offers.map(o => ({ ...o.toObject(), type: 'offer' })),
        ...requests.map(r => ({ ...r.toObject(), type: 'request' }))
      ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      count = await Offer.countDocuments(query) + await Request.countDocuments(query);
    }

    res.json({
      success: true,
      posts,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalPosts: count
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ 
      error: 'Failed to fetch posts',
      message: error.message 
    });
  }
};

export const hidePost = async (req, res) => {
  try {
    const { type, reason } = req.body;
    
    if (!type || !['offer', 'request'].includes(type)) {
      return res.status(400).json({ 
        error: 'Type must be either "offer" or "request"' 
      });
    }

    const Model = type === 'offer' ? Offer : Request;
    
    const post = await Model.findByIdAndUpdate(
      req.params.id,
      {
        isHidden: true,
        hiddenAt: new Date(),
        hiddenReason: reason || 'No reason provided'
      },
      { new: true }
    ).populate('user', 'name email');

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json({
      success: true,
      message: 'Post hidden successfully',
      post
    });
  } catch (error) {
    console.error('Error hiding post:', error);
    res.status(500).json({ 
      error: 'Failed to hide post',
      message: error.message 
    });
  }
};

export const unhidePost = async (req, res) => {
  try {
    const { type } = req.body;
    
    if (!type || !['offer', 'request'].includes(type)) {
      return res.status(400).json({ 
        error: 'Type must be either "offer" or "request"' 
      });
    }

    const Model = type === 'offer' ? Offer : Request;
    
    const post = await Model.findByIdAndUpdate(
      req.params.id,
      {
        isHidden: false,
        $unset: { hiddenAt: '', hiddenReason: '' }
      },
      { new: true }
    ).populate('user', 'name email');

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json({
      success: true,
      message: 'Post unhidden successfully',
      post
    });
  } catch (error) {
    console.error('Error unhiding post:', error);
    res.status(500).json({ 
      error: 'Failed to unhide post',
      message: error.message 
    });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { type } = req.body;
    
    if (!type || !['offer', 'request'].includes(type)) {
      return res.status(400).json({ 
        error: 'Type must be either "offer" or "request"' 
      });
    }

    const Model = type === 'offer' ? Offer : Request;
    
    const post = await Model.findByIdAndDelete(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Also delete related responses
    const ResponseIdField = type === 'offer' ? 'offerID' : 'requestID';
    await Response.deleteMany({ [ResponseIdField]: req.params.id });

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ 
      error: 'Failed to delete post',
      message: error.message 
    });
  }
};

// Category Management
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    
    res.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ 
      error: 'Failed to fetch categories',
      message: error.message 
    });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const category = await Category.create({ name, description });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    console.error('Error creating category:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        error: 'Category already exists' 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to create category',
      message: error.message 
    });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({
      success: true,
      message: 'Category updated successfully',
      category
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ 
      error: 'Failed to update category',
      message: error.message 
    });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ 
      error: 'Failed to delete category',
      message: error.message 
    });
  }
};

// University Management
export const getAllUniversities = async (req, res) => {
  try {
    const universities = await University.find().sort({ name: 1 });
    
    res.json({
      success: true,
      universities
    });
  } catch (error) {
    console.error('Error fetching universities:', error);
    res.status(500).json({ 
      error: 'Failed to fetch universities',
      message: error.message 
    });
  }
};

export const createUniversity = async (req, res) => {
  try {
    const { name, location } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'University name is required' });
    }

    const university = await University.create({ name, location });

    res.status(201).json({
      success: true,
      message: 'University created successfully',
      university
    });
  } catch (error) {
    console.error('Error creating university:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        error: 'University already exists' 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to create university',
      message: error.message 
    });
  }
};

export const updateUniversity = async (req, res) => {
  try {
    const { name, location } = req.body;
    
    const university = await University.findByIdAndUpdate(
      req.params.id,
      { name, location },
      { new: true, runValidators: true }
    );

    if (!university) {
      return res.status(404).json({ error: 'University not found' });
    }

    res.json({
      success: true,
      message: 'University updated successfully',
      university
    });
  } catch (error) {
    console.error('Error updating university:', error);
    res.status(500).json({ 
      error: 'Failed to update university',
      message: error.message 
    });
  }
};

export const deleteUniversity = async (req, res) => {
  try {
    const university = await University.findByIdAndDelete(req.params.id);

    if (!university) {
      return res.status(404).json({ error: 'University not found' });
    }

    res.json({
      success: true,
      message: 'University deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting university:', error);
    res.status(500).json({ 
      error: 'Failed to delete university',
      message: error.message 
    });
  }
};
