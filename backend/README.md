# HandyHub Backend API

A comprehensive Node.js backend for the HandyHub household services platform with Express.js, MongoDB, and JWT authentication.

## 🚀 Features

- **Multi-role Authentication**: Admin, Worker, and User roles with JWT
- **OTP Email Verification**: Secure email verification using Nodemailer
- **Booking System**: Complete booking management with availability validation
- **Worker Applications**: Application process with admin approval workflow
- **Geolocation Support**: Location-based service matching
- **Email Notifications**: Automated emails for bookings, confirmations, and status updates
- **Role-based Access Control**: Protected routes with middleware
- **Data Validation**: Comprehensive input validation with express-validator
- **Error Handling**: Centralized error handling with detailed responses

## 📁 Project Structure

```
backend/
├── controllers/          # Route controllers
│   ├── authController.js
│   ├── userController.js
│   ├── workerController.js
│   ├── adminController.js
│   ├── serviceController.js
│   └── bookingController.js
├── models/               # MongoDB schemas
│   ├── User.js
│   ├── Worker.js
│   ├── Service.js
│   ├── Booking.js
│   └── OTP.js
├── routes/               # API routes
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── workerRoutes.js
│   ├── adminRoutes.js
│   ├── serviceRoutes.js
│   └── bookingRoutes.js
├── middleware/           # Custom middleware
│   ├── auth.js
│   ├── validation.js
│   └── errorHandler.js
├── services/             # Business logic services
│   └── emailService.js
├── utils/                # Utility functions
│   └── createAdmin.js
├── .env.example          # Environment variables template
├── server.js             # Main server file
└── package.json
```

## 🛠️ Installation & Setup

1. **Clone and navigate to backend directory**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
```bash
cp .env.example .env
```

4. **Configure environment variables in `.env`:**
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/handyhub

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Email Configuration (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Frontend URL
CLIENT_URL=http://localhost:3000

# Admin Credentials
ADMIN_EMAIL=admin@handyhub.com
ADMIN_PASSWORD=admin123
```

5. **Start the server**
```bash
# Development
npm run dev

# Production
npm start
```

## 📧 Email Configuration

The application uses Gmail SMTP for sending emails. To set up:

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use the generated password in `EMAIL_PASS`

## 🔐 Authentication & Authorization

### User Roles
- **Admin**: Full system access, manage users, workers, services
- **Worker**: Manage profile, view bookings, update availability
- **User**: Book services, manage profile, view booking history

### Authentication Flow
1. User registers with email/password
2. OTP sent to email for verification
3. User verifies email with OTP
4. JWT token issued for authenticated requests
5. Role-based access control on protected routes

## 📊 API Endpoints

### Authentication Routes (`/api/auth`)
```
POST   /register           # User registration
POST   /verify-email       # Email verification with OTP
POST   /login              # User login
GET    /me                 # Get current user
POST   /forgot-password    # Request password reset
POST   /reset-password     # Reset password with OTP
POST   /resend-otp         # Resend OTP
POST   /logout             # User logout
```

### User Routes (`/api/users`)
```
GET    /profile            # Get user profile
PUT    /profile            # Update user profile
GET    /dashboard          # Get user dashboard stats
PUT    /location           # Update user location
DELETE /account            # Delete user account
```

### Worker Routes (`/api/workers`)
```
POST   /apply              # Submit worker application
GET    /profile/me         # Get worker profile
PUT    /profile/me         # Update worker profile
GET    /dashboard/stats    # Get worker dashboard
GET    /available          # Get available workers (public)
GET    /:id                # Get worker public profile
```

### Admin Routes (`/api/admin`)
```
GET    /dashboard          # Admin dashboard stats
GET    /users              # Get all users
PUT    /users/:id/status   # Toggle user status
GET    /workers/pending    # Get pending worker applications
PUT    /workers/:id/status # Approve/reject worker
GET    /bookings           # Get all bookings
GET    /services           # Get all services
POST   /services           # Create new service
PUT    /services/:id       # Update service
DELETE /services/:id       # Delete service
```

### Service Routes (`/api/services`)
```
GET    /                   # Get all services
GET    /categories         # Get service categories
GET    /popular            # Get popular services
GET    /search             # Search services
GET    /:id                # Get single service
```

### Booking Routes (`/api/bookings`)
```
POST   /                   # Create booking (auth optional)
GET    /my-bookings        # Get user bookings
GET    /worker-bookings    # Get worker bookings
GET    /:id                # Get single booking
PUT    /:id/status         # Update booking status
POST   /:id/review         # Add review
GET    /code/:code         # Get booking by code (public)
```

## 🗄️ Database Models

### User Model
- Personal information (name, email, phone)
- Authentication data (password, verification status)
- Location data (coordinates, address)
- Role-based permissions
- Preferences and settings

### Worker Model
- References User model
- Services offered and pricing
- Availability schedule
- Application status and verification
- Performance statistics and ratings
- Document storage for verification

### Service Model
- Service details and description
- Category and pricing information
- Requirements and inclusions
- Popularity and rating metrics

### Booking Model
- Service and worker references
- Customer information (user or guest)
- Scheduling and location data
- Pricing and payment status
- Status tracking and timeline
- Review and rating system

### OTP Model
- Email verification and password reset
- Attempt tracking and expiration
- Purpose-specific OTP management

## 📧 Email Templates

The system includes professional HTML email templates for:

- **Welcome Email**: Sent after email verification
- **Booking Confirmation**: Detailed booking information with code
- **Worker Notifications**: New booking alerts for workers
- **Status Updates**: Booking status change notifications
- **OTP Emails**: Verification and password reset codes
- **Worker Application**: Approval/rejection notifications

## 🔒 Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Rate Limiting**: API request throttling
- **Input Validation**: Comprehensive data validation
- **CORS Protection**: Cross-origin request security
- **Helmet Security**: HTTP header security
- **Error Handling**: Secure error responses

## 🚀 Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Use secure JWT secret (32+ characters)
3. Configure production MongoDB URI
4. Set up production email service
5. Configure CORS for production domain

### Production Considerations
- Use PM2 for process management
- Set up MongoDB replica set
- Configure SSL/TLS certificates
- Implement proper logging
- Set up monitoring and alerts
- Use environment-specific configurations

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📝 API Documentation

The API follows RESTful conventions with consistent response formats:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "pagination": { ... } // For paginated results
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ] // Validation errors if applicable
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.