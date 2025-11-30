/**
 * SMS Gateway Integration
 * Supports multiple providers: Twilio, Africa's Talking, Termii, etc.
 */

export interface SMSConfig {
  provider: 'bulksmsnigeria' | 'twilio' | 'africas_talking' | 'termii' | 'custom';
  apiKey?: string;
  apiSecret?: string;
  accountSid?: string; // For Twilio
  authToken?: string; // For Twilio
  username?: string; // For Africa's Talking / Bulk SMS Nigeria
  password?: string; // For Bulk SMS Nigeria
  senderId?: string;
  from?: string;
}

export interface SMSMessage {
  to: string;
  message: string;
}

/**
 * Send SMS using configured provider
 */
export async function sendSMS(
  messages: SMSMessage[],
  config: SMSConfig
): Promise<{ success: number; failed: number; errors: any[] }> {
  let success = 0;
  let failed = 0;
  const errors: any[] = [];

  switch (config.provider) {
    case 'bulksmsnigeria':
      return sendViaBulkSMSNigeria(messages, config);
    case 'twilio':
      return sendViaTwilio(messages, config);
    case 'africas_talking':
      return sendViaAfricasTalking(messages, config);
    case 'termii':
      return sendViaTermii(messages, config);
    default:
      throw new Error(`Unsupported SMS provider: ${config.provider}`);
  }
}

/**
 * Bulk SMS Nigeria Integration (Recommended for Nigeria)
 * Supports: eBulkSMS, BulkSMSNigeria, Nigeria Bulk SMS
 */
async function sendViaBulkSMSNigeria(
  messages: SMSMessage[],
  config: SMSConfig
): Promise<{ success: number; failed: number; errors: any[] }> {
  if (!config.username || !config.password || !config.senderId) {
    throw new Error('Bulk SMS Nigeria requires username, password, and senderId');
  }

  const results: { success: number; failed: number; errors: any[] } = { success: 0, failed: 0, errors: [] };

  // Bulk SMS Nigeria typically supports sending to multiple recipients
  // Format phone numbers (remove + and ensure they start with 234 for Nigeria)
  const formatPhoneNumber = (phone: string): string => {
    // Remove + and spaces
    let formatted = phone.replace(/\+|\s/g, '');
    // If starts with 0, replace with 234 (Nigeria)
    if (formatted.startsWith('0')) {
      formatted = '234' + formatted.substring(1);
    }
    // If doesn't start with 234, add it
    if (!formatted.startsWith('234')) {
      formatted = '234' + formatted;
    }
    return formatted;
  };

  try {
    // Prepare recipients (comma-separated)
    const recipients = messages.map((m) => formatPhoneNumber(m.to)).join(',');
    // Get message (assuming same message for all - can be enhanced)
    const message = messages[0].message;

    // Try eBulkSMS API format (most common)
    const response = await fetch('https://api.ebulksms.com:8080/sendsms.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: config.username,
        apikey: config.password || config.apiKey, // API key can be used as password
        sender: config.senderId,
        messagetext: message,
        flash: 0, // 0 for normal SMS, 1 for flash SMS
        recipients: recipients,
      }),
    });

    const data = await response.json();

    if (response.ok && data.response) {
      // eBulkSMS returns response with status
      if (data.response.status === 'SUCCESS' || data.response.status === 'OK') {
        // Count recipients from the response or use message count
        const recipientCount = recipients.split(',').length;
        results.success = recipientCount;
      } else {
        results.failed = messages.length;
        const errorMsg = JSON.stringify(data.response || data);
        console.error('Bulk SMS Nigeria Error:', errorMsg);
        results.errors.push({ to: 'multiple', error: data.response || data, message: errorMsg });
      }
    } else {
      // Try alternative API format (BulkSMSNigeria format)
      const altResponse = await fetch('https://www.bulksmsnigeria.com/api/v1/sms/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_token: config.password || config.apiKey,
          to: recipients,
          from: config.senderId,
          body: message,
        }),
      });

      const altData = await altResponse.json();

      if (altResponse.ok && altData.data) {
        results.success = messages.length;
      } else {
        // Send individually if bulk fails
        for (const msg of messages) {
          try {
            const individualResponse = await fetch('https://api.ebulksms.com:8080/sendsms.json', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                username: config.username,
                apikey: config.password || config.apiKey,
                sender: config.senderId,
                messagetext: msg.message,
                flash: 0,
                recipients: formatPhoneNumber(msg.to),
              }),
            });

            const individualData = await individualResponse.json();

            if (individualResponse.ok && (individualData.response?.status === 'SUCCESS' || individualData.response?.status === 'OK')) {
              results.success++;
            } else {
              results.failed++;
              const errorMsg = JSON.stringify(individualData);
              console.error(`SMS send failed for ${msg.to}:`, errorMsg);
              results.errors.push({ to: msg.to, error: individualData, message: errorMsg });
            }
          } catch (error: any) {
            results.failed++;
            const errorMsg = error.message || String(error);
            console.error(`SMS send error for ${msg.to}:`, errorMsg);
            results.errors.push({ to: msg.to, error: error.message || error, message: errorMsg });
          }
        }
      }
    }
  } catch (error: any) {
    console.error('Bulk SMS Nigeria API Error:', error);
    const errorMsg = error.message || String(error);
    results.errors.push({ to: 'all', error: error, message: errorMsg });
    
    // If bulk sending fails, try individual messages
    for (const msg of messages) {
      try {
        const formatPhoneNumber = (phone: string): string => {
          let formatted = phone.replace(/\+|\s/g, '');
          if (formatted.startsWith('0')) {
            formatted = '234' + formatted.substring(1);
          }
          if (!formatted.startsWith('234')) {
            formatted = '234' + formatted;
          }
          return formatted;
        };

        const response = await fetch('https://api.ebulksms.com:8080/sendsms.json', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: config.username,
            apikey: config.password || config.apiKey,
            sender: config.senderId,
            messagetext: msg.message,
            flash: 0,
            recipients: formatPhoneNumber(msg.to),
          }),
        });

        const data = await response.json();

        if (response.ok && (data.response?.status === 'SUCCESS' || data.response?.status === 'OK')) {
          results.success++;
        } else {
          results.failed++;
          results.errors.push({ to: msg.to, error: data });
        }
      } catch (err: any) {
        results.failed++;
        results.errors.push({ to: msg.to, error: err.message });
      }
    }
  }

  return results;
}

/**
 * Twilio SMS Integration
 */
async function sendViaTwilio(
  messages: SMSMessage[],
  config: SMSConfig
): Promise<{ success: number; failed: number; errors: any[] }> {
  if (!config.accountSid || !config.authToken || !config.from) {
    throw new Error('Twilio requires accountSid, authToken, and from number');
  }

  const results: { success: number; failed: number; errors: any[] } = { success: 0, failed: 0, errors: [] };

  for (const msg of messages) {
    try {
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${Buffer.from(`${config.accountSid}:${config.authToken}`).toString('base64')}`,
          },
          body: new URLSearchParams({
            From: config.from,
            To: msg.to,
            Body: msg.message,
          }),
        }
      );

      if (response.ok) {
        results.success++;
      } else {
        const error = await response.json();
        results.failed++;
        results.errors.push({ to: msg.to, error });
      }
    } catch (error: any) {
      results.failed++;
      results.errors.push({ to: msg.to, error: error.message });
    }
  }

  return results;
}

/**
 * Africa's Talking SMS Integration (Good for African countries)
 */
async function sendViaAfricasTalking(
  messages: SMSMessage[],
  config: SMSConfig
): Promise<{ success: number; failed: number; errors: any[] }> {
  if (!config.apiKey || !config.username || !config.senderId) {
    throw new Error('Africa\'s Talking requires apiKey, username, and senderId');
  }

  const results: { success: number; failed: number; errors: any[] } = { success: 0, failed: 0, errors: [] };

  try {
    const recipients = messages.map((m) => m.to).join(',');
    const message = messages[0].message; // Africa's Talking sends same message to all

    const response = await fetch('https://api.africastalking.com/version1/messaging', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        apiKey: config.apiKey,
      },
      body: new URLSearchParams({
        username: config.username,
        to: recipients,
        message,
        from: config.senderId,
      }),
    });

    const data = await response.json();

    if (data.SMSMessageData?.Recipients) {
      data.SMSMessageData.Recipients.forEach((recipient: any) => {
        if (recipient.status === 'Success') {
          results.success++;
        } else {
          results.failed++;
          results.errors.push({ to: recipient.number, error: recipient.status });
        }
      });
    } else {
      results.failed = messages.length;
      results.errors.push({ error: data });
    }
  } catch (error: any) {
    results.failed = messages.length;
    results.errors.push({ error: error.message });
  }

  return results;
}

/**
 * Termii SMS Integration (Good for Nigeria and other African countries)
 */
async function sendViaTermii(
  messages: SMSMessage[],
  config: SMSConfig
): Promise<{ success: number; failed: number; errors: any[] }> {
  if (!config.apiKey || !config.senderId) {
    throw new Error('Termii requires apiKey and senderId');
  }

  const results: { success: number; failed: number; errors: any[] } = { success: 0, failed: 0, errors: [] };

  for (const msg of messages) {
    try {
      const response = await fetch('https://api.termii.com/api/sms/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: msg.to,
          from: config.senderId,
          sms: msg.message,
          type: 'plain',
          channel: 'generic',
          api_key: config.apiKey,
        }),
      });

      const data = await response.json();

      if (data.code === 'ok') {
        results.success++;
      } else {
        results.failed++;
        results.errors.push({ to: msg.to, error: data });
      }
    } catch (error: any) {
      results.failed++;
      results.errors.push({ to: msg.to, error: error.message });
    }
  }

  return results;
}

