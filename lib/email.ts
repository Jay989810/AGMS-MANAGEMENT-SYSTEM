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
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
            line-height: 1.8;
            color: #2d3748;
            background-color: #f7fafc;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          .email-wrapper {
            background-color: #f7fafc;
            padding: 40px 20px;
            min-height: 100vh;
          }
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          }
          .email-header {
            background: linear-gradient(135deg, #1a365d 0%, #2d5a8f 100%);
            color: #ffffff;
            padding: 50px 30px;
            text-align: center;
            position: relative;
            overflow: hidden;
          }
          .email-header::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
            animation: pulse 3s ease-in-out infinite;
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.5; }
            50% { transform: scale(1.1); opacity: 0.8; }
          }
          .header-icon {
            font-size: 64px;
            margin-bottom: 20px;
            display: block;
            animation: bounce 2s ease-in-out infinite;
          }
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          .email-header h1 {
            font-size: 32px;
            font-weight: 700;
            margin: 0;
            letter-spacing: -0.5px;
            position: relative;
            z-index: 1;
          }
          .email-content {
            padding: 50px 40px;
            background-color: #ffffff;
          }
          .greeting {
            font-size: 20px;
            color: #1a365d;
            font-weight: 600;
            margin-bottom: 25px;
            line-height: 1.5;
          }
          .message-text {
            font-size: 16px;
            color: #4a5568;
            margin-bottom: 20px;
            line-height: 1.8;
          }
          .highlight {
            color: #2d5a8f;
            font-weight: 600;
          }
          .bible-verse {
            background: linear-gradient(135deg, #fff5e6 0%, #ffe6cc 100%);
            border-left: 4px solid #f59e0b;
            padding: 20px;
            margin: 30px 0;
            border-radius: 8px;
            font-style: italic;
            color: #78350f;
            font-size: 15px;
            line-height: 1.7;
          }
          .signature {
            margin-top: 35px;
            padding-top: 30px;
            border-top: 2px solid #e2e8f0;
          }
          .signature-text {
            font-size: 16px;
            color: #4a5568;
            margin-bottom: 8px;
          }
          .church-name {
            font-size: 20px;
            font-weight: 700;
            color: #1a365d;
            margin: 10px 0;
          }
          .church-address {
            font-size: 14px;
            color: #718096;
            margin-top: 5px;
          }
          .email-footer {
            background-color: #f7fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
          }
          .footer-text {
            font-size: 13px;
            color: #718096;
            line-height: 1.6;
          }
          .footer-link {
            color: #2d5a8f;
            text-decoration: none;
            font-weight: 500;
          }
          .footer-link:hover {
            text-decoration: underline;
          }
          @media only screen and (max-width: 600px) {
            .email-wrapper {
              padding: 20px 10px;
            }
            .email-header {
              padding: 40px 20px;
            }
            .email-header h1 {
              font-size: 26px;
            }
            .email-content {
              padding: 35px 25px;
            }
            .header-icon {
              font-size: 48px;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="email-container">
            <div class="email-header">
              <span class="header-icon">🎉🎂✨</span>
              <h1>Happy Birthday!</h1>
            </div>
            <div class="email-content">
              <div class="greeting">Dear ${name},</div>
              
              <p class="message-text">
                On behalf of <span class="highlight">Amazing Grace Baptist Church</span>, we want to wish you a blessed and joyful birthday!
              </p>
              
              <p class="message-text">
                May God's grace and blessings be upon you on this special day and throughout the coming year. We pray that this new year of your life will be filled with peace, joy, and divine favor.
              </p>
              
              <div class="bible-verse">
                "For I know the plans I have for you," declares the Lord, "plans to prosper you and not to harm you, plans to give you hope and a future." - Jeremiah 29:11
              </div>
              
              <p class="message-text">
                May the Lord continue to guide your steps and bless you abundantly in all your endeavors. You are a blessing to our church family, and we thank God for your life.
              </p>
              
              <div class="signature">
                <p class="signature-text">With love and prayers,</p>
                <div class="church-name">Amazing Grace Baptist Church</div>
                <div class="church-address">U/Zawu, Gonin Gora, Kaduna, Nigeria</div>
              </div>
            </div>
            <div class="email-footer">
              <p class="footer-text">
                This is an automated message from the <a href="#" class="footer-link">Church Management System</a>.<br>
                We pray this message finds you in good health and spirits.
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function generateBroadcastEmail(title: string, message: string): string {
  // Convert message to HTML with proper formatting
  let formattedMessage = message
    .replace(/\n\n/g, '</p><p class="message-text">') // Double line breaks become paragraph breaks
    .replace(/\n/g, '<br>'); // Single line breaks become <br>
  
  // Wrap first part in paragraph if not already wrapped
  if (!formattedMessage.startsWith('<p')) {
    formattedMessage = '<p class="message-text">' + formattedMessage;
  }
  if (!formattedMessage.endsWith('</p>')) {
    formattedMessage = formattedMessage + '</p>';
  }

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
            line-height: 1.8;
            color: #2d3748;
            background-color: #f7fafc;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          .email-wrapper {
            background-color: #f7fafc;
            padding: 40px 20px;
            min-height: 100vh;
          }
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          }
          .email-header {
            background: linear-gradient(135deg, #1a365d 0%, #2d5a8f 100%);
            color: #ffffff;
            padding: 45px 30px;
            text-align: center;
            position: relative;
            overflow: hidden;
          }
          .email-header::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, transparent 70%);
          }
          .header-icon {
            font-size: 48px;
            margin-bottom: 15px;
            display: block;
            opacity: 0.95;
          }
          .email-header h1 {
            font-size: 28px;
            font-weight: 700;
            margin: 0;
            letter-spacing: -0.5px;
            position: relative;
            z-index: 1;
            line-height: 1.3;
          }
          .email-content {
            padding: 45px 40px;
            background-color: #ffffff;
          }
          .message-text {
            font-size: 16px;
            color: #4a5568;
            margin-bottom: 20px;
            line-height: 1.8;
          }
          .message-text:first-child {
            margin-top: 0;
          }
          .message-text:last-child {
            margin-bottom: 0;
          }
          .message-text strong {
            color: #1a365d;
            font-weight: 600;
          }
          .message-text em {
            color: #2d5a8f;
            font-style: italic;
          }
          .message-text a {
            color: #2d5a8f;
            text-decoration: underline;
          }
          .message-text a:hover {
            color: #1a365d;
          }
          .highlight-box {
            background: linear-gradient(135deg, #e6f3ff 0%, #cce7ff 100%);
            border-left: 4px solid #2d5a8f;
            padding: 20px;
            margin: 25px 0;
            border-radius: 8px;
            font-size: 15px;
            line-height: 1.7;
            color: #1e3a5f;
          }
          .signature {
            margin-top: 40px;
            padding-top: 30px;
            border-top: 2px solid #e2e8f0;
          }
          .signature-text {
            font-size: 16px;
            color: #4a5568;
            margin-bottom: 8px;
          }
          .church-name {
            font-size: 20px;
            font-weight: 700;
            color: #1a365d;
            margin: 10px 0;
          }
          .church-address {
            font-size: 14px;
            color: #718096;
            margin-top: 5px;
          }
          .email-footer {
            background-color: #f7fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
          }
          .footer-text {
            font-size: 13px;
            color: #718096;
            line-height: 1.6;
          }
          .footer-link {
            color: #2d5a8f;
            text-decoration: none;
            font-weight: 500;
          }
          .footer-link:hover {
            text-decoration: underline;
          }
          .divider {
            height: 1px;
            background: linear-gradient(to right, transparent, #e2e8f0, transparent);
            margin: 30px 0;
          }
          @media only screen and (max-width: 600px) {
            .email-wrapper {
              padding: 20px 10px;
            }
            .email-header {
              padding: 35px 20px;
            }
            .email-header h1 {
              font-size: 24px;
            }
            .email-content {
              padding: 30px 25px;
            }
            .header-icon {
              font-size: 36px;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="email-container">
            <div class="email-header">
              <span class="header-icon">📬</span>
              <h1>${title}</h1>
            </div>
            <div class="email-content">
              ${formattedMessage}
              
              <div class="divider"></div>
              
              <div class="signature">
                <p class="signature-text">With love and prayers,</p>
                <div class="church-name">Amazing Grace Baptist Church</div>
                <div class="church-address">U/Zawu, Gonin Gora, Kaduna, Nigeria</div>
              </div>
            </div>
            <div class="email-footer">
              <p class="footer-text">
                This is an automated message from the <a href="#" class="footer-link">Church Management System</a>.<br>
                We pray this message finds you in good health and spirits.
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}


