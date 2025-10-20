import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import connectDB from './config/connectDB.js';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import offerRoutes from './routes/offers.js';
import requestRoutes from './routes/requests.js';
import notificationRoutes from './routes/notifications.js';
import responseRoutes from './routes/responses.js';

dotenv.config();
connectDB();

const app = express();
const port = process.env.PORT || 5000;

// Middlewares
app.use(cors()); // Enable CORS for frontend communication
app.use(morgan('combined')); // Logging middleware
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/responses', responseRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'SkillSwap Backend API is running perfectly!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users', 
      offers: '/api/offers',
      requests: '/api/requests',
      notifications: '/api/notifications',
      responses: '/api/responses'
    }
  });
});

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message
  });
});

app.listen(port, () => {
  console.log(`SkillSwap Backend server running on port ${port}`);
  console.log(`API documentation available at http://localhost:${port}`);
});
