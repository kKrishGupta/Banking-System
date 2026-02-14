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
          <a href="http://localhost:3000/"
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

async function sendTransactionEmail(userEmail, name, amount, toAccount) {
  const subject = "✅ Transaction Successful – Backend Ledger";

  const text = `Hi ${name},

Your transaction was successful.

Amount: ₹${amount}
Transferred To: ${toAccount}

Thank you for using Backend Ledger.

Best regards,
The Backend Ledger Team`;

  const html = `
  <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 40px 0;">
    <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
      
      <!-- Header -->
      <div style="background: linear-gradient(90deg, #065f46, #047857); padding: 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0;">Transaction Successful</h1>
      </div>

      <!-- Body -->
      <div style="padding: 30px; color: #333;">
        <h2 style="margin-top: 0;">Hi ${name}, 👋</h2>

        <p>Your recent transaction has been completed successfully.</p>

        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 6px; margin: 20px 0;">
          <p><strong>Amount:</strong> ₹${amount}</p>
          <p><strong>Transferred To:</strong> ${toAccount}</p>
          <p><strong>Status:</strong> <span style="color: green; font-weight: bold;">Successful</span></p>
        </div>

        <p>
          You can view your transaction history anytime from your dashboard.
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="http://localhost:3000/dashboard"
             style="background-color: #16a34a; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            View Dashboard
          </a>
        </div>

        <p style="margin-bottom: 0;">
          Thank you for trusting Backend Ledger.
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

async function sendTransactionFailureEmail(userEmail, name, amount, fromAccount) {
  const subject = "❌ Transaction Failed – Backend Ledger";

  const text = `Hi ${name},

We regret to inform you that your transaction could not be completed.

Amount: ₹${amount}
From Account: ${fromAccount}

Please check your account balance or try again.

If the issue persists, contact support.

Best regards,
The Backend Ledger Team`;

  const html = `
  <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 40px 0;">
    <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
      
      <!-- Header -->
      <div style="background: linear-gradient(90deg, #7f1d1d, #b91c1c); padding: 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0;">Transaction Failed</h1>
      </div>

      <!-- Body -->
      <div style="padding: 30px; color: #333;">
        <h2 style="margin-top: 0;">Hi ${name},</h2>

        <p>
          Unfortunately, your recent transaction could not be processed.
        </p>

        <div style="background-color: #fef2f2; padding: 20px; border-radius: 6px; margin: 20px 0;">
          <p><strong>Amount:</strong> ₹${amount}</p>
          <p><strong>From Account:</strong> ${fromAccount}</p>
          <p><strong>Status:</strong> <span style="color: red; font-weight: bold;">Failed</span></p>
        </div>

        <p>
          This may be due to insufficient balance or a temporary system issue.
          Please try again or contact support if the issue continues.
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="http://localhost:3000/dashboard"
             style="background-color: #dc2626; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Retry Transaction
          </a>
        </div>

        <p style="margin-bottom: 0;">
          We're here to help you.
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
  sendTransactionEmail,
  sendTransactionFailureEmail
};
