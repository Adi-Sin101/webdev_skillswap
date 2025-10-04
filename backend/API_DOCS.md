# SkillSwap Backend API

## Available Routes

### Authentication Routes (`/api/auth`)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user  
- `GET /api/auth/me` - Get current user

### User Routes (`/api/users`)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Offer Routes (`/api/offers`)
- `GET /api/offers` - Get all offers
- `GET /api/offers/:id` - Get offer by ID
- `POST /api/offers` - Create new offer
- `PUT /api/offers/:id` - Update offer
- `DELETE /api/offers/:id` - Delete offer

### Request Routes (`/api/requests`)
- `GET /api/requests` - Get all requests
- `GET /api/requests/:id` - Get request by ID
- `POST /api/requests` - Create new request
- `PUT /api/requests/:id` - Update request
- `DELETE /api/requests/:id` - Delete request

### Utility Routes
- `GET /` - API info and available endpoints
- `GET /health` - Health check

## Usage

All routes return JSON responses. Sample data is stored in memory (no database required).

Example API calls:
```bash
# Get all users
GET http://localhost:5000/api/users

# Create new offer
POST http://localhost:5000/api/offers
{
  "title": "JavaScript Tutoring",
  "description": "Help with JS fundamentals",
  "category": "Coding",
  "availability": "Weekends",
  "location": "IIT Bombay",
  "type": "Free",
  "userId": 1,
  "userName": "John Doe"
}
```