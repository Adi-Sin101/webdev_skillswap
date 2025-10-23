# Admin Access Documentation

## Admin Account Setup

The admin account has been created for the website developer with the following credentials:

### 🔐 Default Admin Credentials

```
Email: admin@skillswap.com
Password: Admin@123
```

⚠️ **IMPORTANT**: Please change the password after your first login!

## How to Access Admin Panel

1. **Login to the website**:
   - Go to the login page: `http://localhost:5173/login`
   - Enter the admin credentials above
   - Click "Login"

2. **Access Admin Dashboard**:
   - Once logged in, you'll see a yellow "Admin" button in the navigation bar
   - Click on it to access the Admin Dashboard
   - Or directly navigate to: `http://localhost:5173/admin`

## Admin Panel Features

### 📊 Dashboard (`/admin`)
- View total users, posts, applications, and completed swaps
- See recent activity (7-day statistics)
- Monitor moderation status (banned users, hidden posts)
- User growth chart for the last 6 months

### 👥 User Management (`/admin/users`)
- View all registered users
- Search users by name or email
- Filter by role (user/admin) and status (active/banned)
- Ban/unban users with reasons
- View user profiles
- Pagination support (20 users per page)

### 📝 Post Management (`/admin/posts`)
- View all offers and requests
- Search posts by title or description
- Filter by type (offer/request) and visibility status
- Hide/unhide posts with moderation reasons
- Delete posts permanently
- View post details

### 📚 Category Management (`/admin/categories`)
- View all skill categories
- Add new categories
- Edit existing categories
- Delete categories
- Manage category descriptions

### 🎓 University Management (`/admin/universities`)
- View all universities
- Add new universities
- Edit university information
- Delete universities
- Manage locations

## Creating Additional Admin Accounts

### Method 1: Using the Script
Run the following command in the backend directory:
```bash
npm run create-admin
```

Then modify the script (`backend/scripts/createAdmin.js`) to use different credentials before running.

### Method 2: Using MongoDB
Connect to your MongoDB database and update any existing user:
```javascript
db.users.updateOne(
  { email: "user@example.com" },
  { $set: { role: "admin" } }
)
```

### Method 3: Through Code
After a user registers, you can manually promote them:
```javascript
const user = await User.findOne({ email: "user@example.com" });
user.role = "admin";
await user.save();
```

## Security Features

✅ **Role-Based Access Control**: Only users with `role: "admin"` can access admin routes
✅ **JWT Authentication**: All admin API calls require valid authentication token
✅ **Middleware Protection**: Backend routes protected with `verifyAdmin` middleware
✅ **Frontend Guards**: Admin UI hidden from non-admin users
✅ **Ban Prevention**: Banned admins cannot access admin panel

## Changing Admin Password

1. Login with admin account
2. Go to Profile page
3. Use the profile settings to update password
4. Or manually update in database:
   ```javascript
   const bcrypt = require('bcryptjs');
   const hashedPassword = await bcrypt.hash('NewPassword123', 10);
   db.users.updateOne(
     { email: "admin@skillswap.com" },
     { $set: { password: hashedPassword } }
   )
   ```

## Troubleshooting

### Can't see Admin button?
- Make sure you're logged in with an admin account
- Check that `user.role === 'admin'` in the browser console
- Clear cache and reload the page

### Getting "Unauthorized" error?
- Check that your JWT token is valid
- Make sure the user hasn't been banned
- Verify the role in the database

### Admin routes not working?
- Ensure backend server is running
- Check that admin routes are registered in `backend/index.js`
- Verify MongoDB connection is active

## API Endpoints

All admin endpoints are under `/api/admin/` and require authentication:

- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/users` - Get all users (with pagination)
- `GET /api/admin/users/:id` - Get user details
- `PUT /api/admin/users/:id/ban` - Ban a user
- `PUT /api/admin/users/:id/unban` - Unban a user
- `GET /api/admin/posts` - Get all posts
- `PUT /api/admin/posts/:id/hide` - Hide a post
- `PUT /api/admin/posts/:id/unhide` - Unhide a post
- `DELETE /api/admin/posts/:id` - Delete a post
- `GET /api/admin/categories` - Get all categories
- `POST /api/admin/categories` - Create category
- `PUT /api/admin/categories/:id` - Update category
- `DELETE /api/admin/categories/:id` - Delete category
- `GET /api/admin/universities` - Get all universities
- `POST /api/admin/universities` - Create university
- `PUT /api/admin/universities/:id` - Update university
- `DELETE /api/admin/universities/:id` - Delete university

## Support

For any issues or questions regarding admin access, please contact the development team.

---

**Last Updated**: October 23, 2025
**Version**: 1.0.0
