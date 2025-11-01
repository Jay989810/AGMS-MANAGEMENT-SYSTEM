import nodemailer from 'nodemailer';

const smtpConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
};

const transporter = nodemailer.createTransport(smtpConfig);

export async function sendEmail(to: string | string[], subject: string, html: string) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('SMTP credentials not configured');
  }

  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: Array.isArray(to) ? to.join(', ') : to,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('Email send error:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

export function generateBirthdayEmail(name: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #001F3F; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .footer { text-align: center; padding: 20px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Happy Birthday!</h1>
          </div>
          <div class="content">
            <p>Dear ${name},</p>
            <p>On behalf of Amazing Grace Baptist Church, we want to wish you a blessed and joyful birthday!</p>
            <p>May God's grace and blessings be upon you on this special day and throughout the coming year.</p>
            <p>We pray that this new year of your life will be filled with peace, joy, and divine favor.</p>
            <p>With love and prayers,<br><strong>Amazing Grace Baptist Church</strong><br>U/Zawu, Gonin Gora, Kaduna, Nigeria</p>
          </div>
          <div class="footer">
            <p>This is an automated message from the Church Management System.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function generateBroadcastEmail(title: string, message: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #001F3F; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .footer { text-align: center; padding: 20px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${title}</h1>
          </div>
          <div class="content">
            ${message.replace(/\n/g, '<br>')}
            <p style="margin-top: 20px;">With love and prayers,<br><strong>Amazing Grace Baptist Church</strong><br>U/Zawu, Gonin Gora, Kaduna, Nigeria</p>
          </div>
          <div class="footer">
            <p>This is an automated message from the Church Management System.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}


