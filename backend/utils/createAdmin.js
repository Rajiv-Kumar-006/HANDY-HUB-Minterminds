const User = require('../models/User');

const createAdmin = async () => {
  try {
    // Check if admin already exists
    const adminExists = await User.findOne({ 
      email: process.env.ADMIN_EMAIL || 'krajiv78550@gmail.com' 
    });

    if (adminExists) {
      console.log('✅ Admin user already exists');
      return;
    }

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: process.env.ADMIN_EMAIL || 'krajiv78550@gmail.com',
      password: process.env.ADMIN_PASSWORD || 'rajiv13262023',
      phone: '+1234567890',
      role: 'admin',
      isEmailVerified: true,
      isActive: true
    });

    console.log('✅ Admin user created successfully');
    console.log(`📧 Email: ${admin.email}`);
    console.log(`🔑 Password: ${process.env.ADMIN_PASSWORD || 'rajiv13262023'}`);

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  }
};

module.exports = createAdmin;