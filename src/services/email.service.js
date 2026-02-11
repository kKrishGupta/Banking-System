const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

module.exports = transporter;

// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Backend Ledger" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

// Registration Email Function (Your Required Format)
async function sendRegistrationEmail(userEmail, name) {
  const subject = "🎉 Welcome to Backend Ledger – Let’s Get Started!";

  const text = `Hi ${name},

Welcome to Backend Ledger!

Your account has been successfully created. We're excited to help you manage your finances smarter and more efficiently.

If you have any questions, feel free to reach out to our support team anytime.

Best regards,
The Backend Ledger Team`;

  const html = `
  <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 40px 0;">
    <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
      
      <!-- Header -->
      <div style="background: linear-gradient(90deg, #1f2937, #111827); padding: 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0;">Backend Ledger</h1>
      </div>

      <!-- Body -->
      <div style="padding: 30px; color: #333;">
        <h2 style="margin-top: 0;">Welcome, ${name}! 👋</h2>
        <p>
          We're thrilled to have you join <strong>Backend Ledger</strong>.
          Your account has been successfully created, and you're now ready to manage your finances efficiently and securely.
        </p>

        <p>
          Our platform is designed to give you complete control, clarity, and confidence in your financial journey.
        </p>

        <!-- CTA Button -->
        <div style="text-align: center; margin: 30px 0;">
          <a href="http://localhost:3000/dashboard"
             style="background-color: #2563eb; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            Go to Dashboard
          </a>
        </div>

        <p style="font-size: 14px; color: #555;">
          If you did not create this account, please contact our support team immediately.
        </p>

        <p style="margin-bottom: 0;">
          Best regards,<br>
          <strong>The Backend Ledger Team</strong>
        </p>
      </div>

      <!-- Footer -->
      <div style="background-color: #f9fafb; text-align: center; padding: 15px; font-size: 12px; color: #777;">
        © ${new Date().getFullYear()} Backend Ledger. All rights reserved.
      </div>

    </div>
  </div>
  `;

  await sendEmail(userEmail, subject, text, html);
}

module.exports = {
  sendEmail,
  sendRegistrationEmail,
};