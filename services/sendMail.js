const nodemailer = require('nodemailer');

const sendEmail = async (userEmail, subject, emailContent) => {
  try {
    // Create a transporter using Gmail service (you can use any other service)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,  // Your email address
        pass: process.env.EMAIL_PASS,  // Your email password (use environment variables for security)
      },
    });
    
    transporter.verify((error, success) => {
        if (error) {
          console.error("Error in email transporter:", error);
        } else {
          console.log("Email transporter is ready to send messages.");
        }
      });

    // Email options
    const mailOptions = {
      from: '"Task Management System" <no-reply@example.com>',  
      to: userEmail,
      subject: subject,
      html: emailContent, // The content of the email (HTML format)
      headers: {
        'X-Content-Type-Options': 'nosniff',  // Security headers
        'X-No-Forwarding': 'true',  // Custom header to indicate no forwarding
        'X-Prevent-Forwarding': 'true',  // Custom header to prevent forwarding
      },
    };

    // Send email
    await transporter.sendMail(mailOptions);

    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error.message);
    throw new Error('Error sending email');
  }
};

module.exports = sendEmail;
