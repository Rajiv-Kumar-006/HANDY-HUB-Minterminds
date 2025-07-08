const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
  this.transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
}



  async sendVerificationEmail(email, name, otp) {
    const mailOptions = {
      from: `"HandyHub" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify Your Email - HandyHub',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #3B82F6, #14B8A6); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to HandyHub!</h1>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">Hi ${name},</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Thank you for joining HandyHub! To complete your registration, please verify your email address using the OTP below:
            </p>
            
            <div style="background: white; border: 2px dashed #3B82F6; border-radius: 10px; padding: 20px; text-align: center; margin: 30px 0;">
              <h3 style="color: #3B82F6; margin: 0; font-size: 32px; letter-spacing: 5px;">${otp}</h3>
              <p style="color: #666; margin: 10px 0 0 0; font-size: 14px;">This OTP will expire in 10 minutes</p>
            </div>
            
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              If you didn't create an account with HandyHub, please ignore this email.
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                Best regards,<br>
                The HandyHub Team
              </p>
            </div>
          </div>
        </div>
      `
    };

    return this.transporter.sendMail(mailOptions);
  }

  // Send welcome email
  async sendWelcomeEmail(email, name) {
    const mailOptions = {
      from: `"HandyHub" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to HandyHub - Your Account is Ready!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #3B82F6, #14B8A6); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to HandyHub!</h1>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">Hi ${name},</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Your email has been successfully verified! You can now access all features of HandyHub.
            </p>
            
            <div style="background: white; border-radius: 10px; padding: 25px; margin: 30px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h3 style="color: #3B82F6; margin-top: 0;">What you can do now:</h3>
              <ul style="color: #666; line-height: 1.8;">
                <li>Browse and book household services</li>
                <li>Manage your bookings and profile</li>
                <li>Rate and review service providers</li>
                <li>Track your service history</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.CLIENT_URL}/services" style="background: linear-gradient(135deg, #3B82F6, #14B8A6); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Start Browsing Services
              </a>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                Best regards,<br>
                The HandyHub Team
              </p>
            </div>
          </div>
        </div>
      `
    };

    return this.transporter.sendMail(mailOptions);
  }

  // Send password reset email
  async sendPasswordResetEmail(email, name, otp) {
    const mailOptions = {
      from: `"HandyHub" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Reset Your Password - HandyHub',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #EF4444, #F97316); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset</h1>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">Hi ${name},</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              We received a request to reset your password. Use the OTP below to reset your password:
            </p>
            
            <div style="background: white; border: 2px dashed #EF4444; border-radius: 10px; padding: 20px; text-align: center; margin: 30px 0;">
              <h3 style="color: #EF4444; margin: 0; font-size: 32px; letter-spacing: 5px;">${otp}</h3>
              <p style="color: #666; margin: 10px 0 0 0; font-size: 14px;">This OTP will expire in 10 minutes</p>
            </div>
            
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                Best regards,<br>
                The HandyHub Team
              </p>
            </div>
          </div>
        </div>
      `
    };

    return this.transporter.sendMail(mailOptions);
  }

  // Send password change confirmation
  async sendPasswordChangeConfirmation(email, name) {
    const mailOptions = {
      from: `"HandyHub" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Changed Successfully - HandyHub',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10B981, #14B8A6); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Password Changed</h1>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">Hi ${name},</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Your password has been successfully changed. If you didn't make this change, please contact our support team immediately.
            </p>
            
            <div style="background: white; border-left: 4px solid #10B981; padding: 20px; margin: 30px 0;">
              <p style="color: #666; margin: 0; font-size: 14px;">
                <strong>Security Tip:</strong> Keep your password secure and don't share it with anyone.
              </p>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                Best regards,<br>
                The HandyHub Team
              </p>
            </div>
          </div>
        </div>
      `
    };

    return this.transporter.sendMail(mailOptions);
  }

  // Send booking confirmation email
  async sendBookingConfirmation(email, name, booking) {
    const mailOptions = {
      from: `"HandyHub" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Booking Confirmation - ${booking.service.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #3B82F6, #14B8A6); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Booking Confirmed!</h1>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">Hi ${name},</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Your booking has been confirmed! Here are the details:
            </p>
            
            <div style="background: white; border-radius: 10px; padding: 25px; margin: 30px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h3 style="color: #3B82F6; margin-top: 0; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">Booking Details</h3>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; color: #666; font-weight: bold;">Booking Code:</td>
                  <td style="padding: 10px 0; color: #333; font-family: monospace; font-size: 18px; font-weight: bold;">${booking.bookingCode}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #666; font-weight: bold;">Service:</td>
                  <td style="padding: 10px 0; color: #333;">${booking.service.name}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #666; font-weight: bold;">Worker:</td>
                  <td style="padding: 10px 0; color: #333;">${booking.worker.user.name}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #666; font-weight: bold;">Date:</td>
                  <td style="padding: 10px 0; color: #333;">${new Date(booking.scheduledDate).toLocaleDateString()}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #666; font-weight: bold;">Time:</td>
                  <td style="padding: 10px 0; color: #333;">${booking.scheduledTime.start} - ${booking.scheduledTime.end}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #666; font-weight: bold;">Location:</td>
                  <td style="padding: 10px 0; color: #333;">${booking.location.address}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #666; font-weight: bold;">Total Amount:</td>
                  <td style="padding: 10px 0; color: #10B981; font-weight: bold; font-size: 18px;">$${booking.pricing.totalAmount}</td>
                </tr>
              </table>
            </div>
            
            <div style="background: #FEF3C7; border: 1px solid #F59E0B; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <p style="color: #92400E; margin: 0; font-size: 14px;">
                <strong>Important:</strong> Please save your booking code <strong>${booking.bookingCode}</strong> for future reference.
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.CLIENT_URL}/bookings/${booking._id}" style="background: linear-gradient(135deg, #3B82F6, #14B8A6); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                View Booking Details
              </a>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                Best regards,<br>
                The HandyHub Team
              </p>
            </div>
          </div>
        </div>
      `
    };

    return this.transporter.sendMail(mailOptions);
  }

  // Send worker booking notification
  async sendWorkerBookingNotification(email, name, booking) {
    const customerName = booking.customer.user ? 
                        booking.customer.user.name : 
                        booking.customer.guestInfo.name;

    const mailOptions = {
      from: `"HandyHub" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `New Booking Request - ${booking.service.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #8B5CF6, #3B82F6); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">New Booking Request!</h1>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">Hi ${name},</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              You have received a new booking request. Please review and confirm:
            </p>
            
            <div style="background: white; border-radius: 10px; padding: 25px; margin: 30px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h3 style="color: #8B5CF6; margin-top: 0; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">Booking Details</h3>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; color: #666; font-weight: bold;">Service:</td>
                  <td style="padding: 10px 0; color: #333;">${booking.service.name}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #666; font-weight: bold;">Customer:</td>
                  <td style="padding: 10px 0; color: #333;">${customerName}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #666; font-weight: bold;">Date:</td>
                  <td style="padding: 10px 0; color: #333;">${new Date(booking.scheduledDate).toLocaleDateString()}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #666; font-weight: bold;">Time:</td>
                  <td style="padding: 10px 0; color: #333;">${booking.scheduledTime.start} - ${booking.scheduledTime.end}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #666; font-weight: bold;">Location:</td>
                  <td style="padding: 10px 0; color: #333;">${booking.location.address}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #666; font-weight: bold;">Amount:</td>
                  <td style="padding: 10px 0; color: #10B981; font-weight: bold; font-size: 18px;">$${booking.pricing.totalAmount}</td>
                </tr>
              </table>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.CLIENT_URL}/worker/dashboard" style="background: linear-gradient(135deg, #10B981, #14B8A6); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin-right: 10px;">
                Accept Booking
              </a>
              <a href="${process.env.CLIENT_URL}/worker/dashboard" style="background: #EF4444; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Decline Booking
              </a>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                Best regards,<br>
                The HandyHub Team
              </p>
            </div>
          </div>
        </div>
      `
    };

    return this.transporter.sendMail(mailOptions);
  }

  // Send booking status update
  async sendBookingStatusUpdate(email, name, booking, status) {
    const statusMessages = {
      confirmed: 'Your booking has been confirmed by the worker!',
      'in-progress': 'Your service is now in progress.',
      completed: 'Your service has been completed successfully!',
      cancelled: 'Your booking has been cancelled.'
    };

    const statusColors = {
      confirmed: '#10B981',
      'in-progress': '#F59E0B',
      completed: '#3B82F6',
      cancelled: '#EF4444'
    };

    const mailOptions = {
      from: `"HandyHub" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Booking Update - ${booking.service.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: ${statusColors[status]}; padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Booking Update</h1>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">Hi ${name},</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              ${statusMessages[status]}
            </p>
            
            <div style="background: white; border-radius: 10px; padding: 25px; margin: 30px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h3 style="color: ${statusColors[status]}; margin-top: 0;">Booking: ${booking.bookingCode}</h3>
              <p style="color: #666; margin: 0;">${booking.service.name} - ${new Date(booking.scheduledDate).toLocaleDateString()}</p>
            </div>
            
            ${status === 'completed' ? `
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.CLIENT_URL}/bookings/${booking._id}/review" style="background: linear-gradient(135deg, #F59E0B, #F97316); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                  Rate Your Experience
                </a>
              </div>
            ` : ''}
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                Best regards,<br>
                The HandyHub Team
              </p>
            </div>
          </div>
        </div>
      `
    };

    return this.transporter.sendMail(mailOptions);
  }
}

module.exports = new EmailService();