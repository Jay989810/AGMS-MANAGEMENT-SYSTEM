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
 * Supports v3 API (Bearer tokens with named tokens and granular permissions) and v2 API
 * Documentation: https://www.bulksmsnigeria.com/api
 * Base URL: https://www.bulksmsnigeria.com/api
 */
async function sendViaBulkSMSNigeria(
  messages: SMSMessage[],
  config: SMSConfig
): Promise<{ success: number; failed: number; errors: any[] }> {
  // Bulk SMS Nigeria API requires Bearer API token (in password/apiKey) and senderId
  const apiToken = config.password || config.apiKey;
  
  if (!apiToken || !config.senderId) {
    throw new Error('Bulk SMS Nigeria requires API token (SMS_PASSWORD or SMS_API_KEY) and SMS_SENDER_ID');
  }

  const results: { success: number; failed: number; errors: any[] } = { success: 0, failed: 0, errors: [] };

  // Format phone numbers (remove + and ensure they start with 234 for Nigeria)
  const formatPhoneNumber = (phone: string): string => {
    // Remove +, spaces, and dashes
    let formatted = phone.replace(/\+|\s|-/g, '');
    // If starts with 0, replace with 234 (Nigeria)
    if (formatted.startsWith('0')) {
      formatted = '234' + formatted.substring(1);
    }
    // If doesn't start with 234 and is 10 digits, assume Nigeria and add 234
    if (!formatted.startsWith('234') && formatted.length === 10) {
      formatted = '234' + formatted;
    }
    // If still doesn't start with 234, add it (for other cases)
    if (!formatted.startsWith('234')) {
      formatted = '234' + formatted;
    }
    return formatted;
  };

  // Prepare recipients and message
  const recipients = messages.map((m) => formatPhoneNumber(m.to)).join(',');
  const message = messages[0].message;
  const senderId = config.senderId.substring(0, 11); // Max 11 characters

  let apiVersion = 'v3'; // Default to v3 for Bearer tokens
  let response: Response;

  try {
    // Try v3 API first (for Bearer tokens with named tokens and granular permissions)
    try {
      response = await fetch('https://www.bulksmsnigeria.com/api/v3/sms', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          from: senderId,
          to: recipients,
          body: message,
        }),
      });
      
      // Check if v3 endpoint exists (if 404, try v2)
      if (response.status === 404) {
        throw new Error('v3 endpoint not found');
      }
    } catch (v3Error) {
      // If v3 fails or returns 404, try v2
      console.log('v3 API not available, trying v2...');
      apiVersion = 'v2';
      response = await fetch('https://www.bulksmsnigeria.com/api/v2/sms', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          from: senderId,
          to: recipients,
          body: message,
        }),
      });
    }

    let data: any;
    try {
      data = await response.json();
    } catch (jsonError) {
      const text = await response.text();
      console.error('BulkSMS Nigeria API returned non-JSON response:', text);
      results.failed = messages.length;
      results.errors.push({ 
        to: 'all', 
        error: { status: response.status, statusText: response.statusText, body: text },
        message: `API Error (${response.status}): ${response.statusText}. Response: ${text.substring(0, 200)}`
      });
      return results;
    }

    console.log(`BulkSMS Nigeria API ${apiVersion} Response:`, JSON.stringify(data, null, 2));

    // Check response format according to documentation
    // Success: {"status": "success", "code": "BSNG-0000", ...}
    // Error: {"status": "error", "code": "BSNG-XXXX", "error": {...}}
    if (data.status === 'success' && (data.code === 'BSNG-0000' || data.code === '200' || response.ok)) {
      // Success - count recipients from response or use message count
      const recipientCount = data.data?.recipients_count || data.recipients_count || recipients.split(',').length;
      results.success = recipientCount;
      console.log(`SMS sent successfully via ${apiVersion} API to ${recipientCount} recipients. Cost: ${data.data?.currency || data.currency || 'NGN'} ${data.data?.cost || data.cost || 'N/A'}`);
    } else if (data.status === 'error' || !response.ok) {
      // Error response with BSNG code
      results.failed = messages.length;
      const errorMsg = data.error?.message || data.message || `Error ${data.code || 'Unknown'}`;
      const errorCode = data.code || 'BSNG-UNKNOWN';
      console.error('BulkSMS Nigeria Error:', errorCode, errorMsg);
      
      // Provide user-friendly error messages based on error codes
      let userFriendlyMsg = errorMsg;
      if (errorCode.startsWith('BSNG-1')) {
        userFriendlyMsg = `Authentication error: ${errorMsg}. Please check your API token.`;
      } else if (errorCode.startsWith('BSNG-2')) {
        userFriendlyMsg = `Invalid request: ${errorMsg}. Please check sender ID and phone numbers.`;
      } else if (errorCode.startsWith('BSNG-3')) {
        userFriendlyMsg = `Service error: ${errorMsg}`;
      } else if (errorCode.startsWith('BSNG-5')) {
        userFriendlyMsg = `Server error: ${errorMsg}. Please try again later.`;
      }
      
      results.errors.push({ 
        to: 'all', 
        error: data.error || data,
        message: `[${errorCode}] ${userFriendlyMsg}`
      });
    } else if (response.ok) {
      // Unexpected success format but HTTP 200
      results.success = messages.length;
      console.warn('Unexpected response format, assuming success:', data);
    } else {
      // HTTP error
      results.failed = messages.length;
      const errorMsg = data.error?.message || data.message || `HTTP ${response.status}: ${response.statusText}`;
      console.error('BulkSMS Nigeria HTTP Error:', response.status, errorMsg);
      results.errors.push({ 
        to: 'all', 
        error: data,
        message: errorMsg
      });
    }
  } catch (error: any) {
    console.error('BulkSMS Nigeria API Exception:', error);
    const errorMsg = error.message || String(error);
    results.errors.push({ to: 'all', error: error, message: errorMsg });
    results.failed = messages.length;

    // If bulk sending fails, try sending individually as fallback
    console.log('Attempting to send messages individually as fallback...');
    for (const msg of messages) {
      try {
        const formattedPhone = formatPhoneNumber(msg.to);
        // Try v3 first, then v2 for individual sends
        let individualResponse: Response;
        try {
          individualResponse = await fetch('https://www.bulksmsnigeria.com/api/v3/sms', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiToken}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({
              from: config.senderId.substring(0, 11),
              to: formattedPhone,
              body: msg.message,
            }),
          });
          
          if (individualResponse.status === 404) {
            throw new Error('v3 endpoint not found');
          }
        } catch {
          individualResponse = await fetch('https://www.bulksmsnigeria.com/api/v2/sms', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiToken}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({
              from: config.senderId.substring(0, 11),
              to: formattedPhone,
              body: msg.message,
            }),
          });
        }

        const individualData = await individualResponse.json();

        if (individualData.status === 'success' && (individualData.code === 'BSNG-0000' || individualData.code === '200' || individualResponse.ok)) {
          results.success++;
          results.failed = Math.max(0, results.failed - 1);
        } else {
          const errorMsg = individualData.error?.message || individualData.message || `Error ${individualData.code || 'Unknown'}`;
          const errorCode = individualData.code || 'BSNG-UNKNOWN';
          console.error(`Individual SMS send failed for ${msg.to}:`, errorCode, errorMsg);
          results.errors.push({ 
            to: msg.to, 
            error: individualData.error || individualData,
            message: `[${errorCode}] ${errorMsg}`
          });
        }
      } catch (err: any) {
        results.failed++;
        const errMsg = err.message || String(err);
        console.error(`Individual SMS exception for ${msg.to}:`, errMsg);
        results.errors.push({ to: msg.to, error: err, message: errMsg });
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

