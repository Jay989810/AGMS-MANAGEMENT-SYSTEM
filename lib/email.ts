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
          @media only screen and (max-width: 600px) {
            .email-wrapper {
              padding: 20px 10px !important;
            }
            .email-container {
              max-width: 100% !important;
            }
            .email-header {
              padding: 30px 20px !important;
            }
            .email-header h1 {
              font-size: 24px !important;
            }
            .email-content {
              padding: 30px 20px !important;
            }
            .header-icon {
              font-size: 40px !important;
            }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Inter', Helvetica, Arial, sans-serif; line-height: 1.5; color: #333333; background-color: #f5f5f5; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
        <div class="email-wrapper" style="background-color: #f5f5f5; padding: 40px 20px; min-height: 100vh;">
          <div class="email-container" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
            <div class="email-header" style="background-color: #ffffff; padding: 40px 30px; text-align: center;">
              <span class="header-icon" style="font-size: 48px; margin-bottom: 15px; display: block;">🎉🎂✨</span>
              <h1 style="font-family: 'Playfair Display', Georgia, serif; font-size: 28px; font-weight: 600; margin: 0; color: #333333; letter-spacing: -0.3px; line-height: 1.3;">Happy Birthday!</h1>
            </div>
            <div class="email-content" style="padding: 35px 30px; background-color: #ffffff;">
              <div class="greeting" style="font-family: 'Playfair Display', Georgia, serif; font-size: 18px; color: #333333; font-weight: 500; margin-bottom: 20px; line-height: 1.5;">Dear ${name},</div>
              
              <p class="message-text" style="font-family: 'Inter', Helvetica, Arial, sans-serif; font-size: 15px; color: #333333; margin-bottom: 15px; line-height: 1.5;">
                On behalf of <span style="color: #333333; font-weight: 600;">Amazing Grace Baptist Church</span>, we want to wish you a blessed and joyful birthday!
              </p>
              
              <p class="message-text" style="font-family: 'Inter', Helvetica, Arial, sans-serif; font-size: 15px; color: #333333; margin-bottom: 15px; line-height: 1.5;">
                May God's grace and blessings be upon you on this special day and throughout the coming year. We pray that this new year of your life will be filled with peace, joy, and divine favor.
              </p>
              
              <div class="bible-verse" style="background-color: #fafafa; border-left: 3px solid #d4d4d4; padding: 18px; margin: 20px 0; border-radius: 4px; font-style: italic; color: #333333; font-size: 14px; line-height: 1.5; font-family: 'Inter', Helvetica, Arial, sans-serif;">
                "For I know the plans I have for you," declares the Lord, "plans to prosper you and not to harm you, plans to give you hope and a future." - Jeremiah 29:11
              </div>
              
              <p class="message-text" style="font-family: 'Inter', Helvetica, Arial, sans-serif; font-size: 15px; color: #333333; margin-bottom: 15px; line-height: 1.5;">
                May the Lord continue to guide your steps and bless you abundantly in all your endeavors. You are a blessing to our church family, and we thank God for your life.
              </p>
              
              <div class="signature" style="margin-top: 30px; padding-top: 25px; border-top: 1px solid #e5e7eb;">
                <p class="signature-text" style="font-family: 'Inter', Helvetica, Arial, sans-serif; font-size: 15px; color: #333333; margin-bottom: 8px; line-height: 1.5;">With love and prayers,</p>
                <div class="church-name" style="font-family: 'Playfair Display', Georgia, serif; font-size: 18px; font-weight: 600; color: #333333; margin: 8px 0; line-height: 1.5;">Amazing Grace Baptist Church</div>
                <div class="church-address" style="font-family: 'Inter', Helvetica, Arial, sans-serif; font-size: 13px; color: #666666; margin-top: 4px; line-height: 1.5;">U/Zawu, Gonin Gora, Kaduna, Nigeria</div>
              </div>
            </div>
            <div class="email-footer" style="background-color: #ffffff; padding: 25px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p class="footer-text" style="font-family: 'Inter', Helvetica, Arial, sans-serif; font-size: 12px; color: #999999; line-height: 1.5; margin: 0;">
                This is an automated message from the <a href="#" style="color: #666666; text-decoration: none; font-weight: 500;">Church Management System</a>.<br>
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
    .replace(/\n\n/g, '</p><p style="font-family: \'Inter\', Helvetica, Arial, sans-serif; font-size: 15px; color: #333333; margin-bottom: 15px; line-height: 1.5;">') // Double line breaks become paragraph breaks
    .replace(/\n/g, '<br>'); // Single line breaks become <br>
  
  // Wrap first part in paragraph if not already wrapped
  if (!formattedMessage.startsWith('<p')) {
    formattedMessage = '<p style="font-family: \'Inter\', Helvetica, Arial, sans-serif; font-size: 15px; color: #333333; margin-bottom: 15px; line-height: 1.5;">' + formattedMessage;
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
          @media only screen and (max-width: 600px) {
            .email-wrapper {
              padding: 20px 10px !important;
            }
            .email-container {
              max-width: 100% !important;
            }
            .email-header {
              padding: 30px 20px !important;
            }
            .email-header h1 {
              font-size: 24px !important;
            }
            .email-content {
              padding: 30px 20px !important;
            }
            .header-icon {
              font-size: 36px !important;
            }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Inter', Helvetica, Arial, sans-serif; line-height: 1.5; color: #333333; background-color: #f5f5f5; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
        <div class="email-wrapper" style="background-color: #f5f5f5; padding: 40px 20px; min-height: 100vh;">
          <div class="email-container" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
            <div class="email-header" style="background-color: #ffffff; padding: 35px 30px; text-align: center;">
              <span class="header-icon" style="font-size: 40px; margin-bottom: 12px; display: block;">📬</span>
              <h1 style="font-family: 'Playfair Display', Georgia, serif; font-size: 26px; font-weight: 600; margin: 0; color: #333333; letter-spacing: -0.3px; line-height: 1.3;">${title}</h1>
            </div>
            <div class="email-content" style="padding: 35px 30px; background-color: #ffffff;">
              ${formattedMessage}
              
              <div class="divider" style="height: 1px; background-color: #e5e7eb; margin: 25px 0;"></div>
              
              <div class="signature" style="margin-top: 25px; padding-top: 25px; border-top: 1px solid #e5e7eb;">
                <p class="signature-text" style="font-family: 'Inter', Helvetica, Arial, sans-serif; font-size: 15px; color: #333333; margin-bottom: 8px; line-height: 1.5;">With love and prayers,</p>
                <div class="church-name" style="font-family: 'Playfair Display', Georgia, serif; font-size: 18px; font-weight: 600; color: #333333; margin: 8px 0; line-height: 1.5;">Amazing Grace Baptist Church</div>
                <div class="church-address" style="font-family: 'Inter', Helvetica, Arial, sans-serif; font-size: 13px; color: #666666; margin-top: 4px; line-height: 1.5;">U/Zawu, Gonin Gora, Kaduna, Nigeria</div>
              </div>
            </div>
            <div class="email-footer" style="background-color: #ffffff; padding: 25px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p class="footer-text" style="font-family: 'Inter', Helvetica, Arial, sans-serif; font-size: 12px; color: #999999; line-height: 1.5; margin: 0;">
                This is an automated message from the <a href="#" style="color: #666666; text-decoration: none; font-weight: 500;">Church Management System</a>.<br>
                We pray this message finds you in good health and spirits.
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

