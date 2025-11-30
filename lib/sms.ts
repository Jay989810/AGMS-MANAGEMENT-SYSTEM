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
 * Phone Number Formatting Utility
 * Converts Nigerian phone numbers to international format (234...)
 * Handles various input formats: 080..., +234..., 234..., etc.
 */
export function formatPhoneNumberForSMS(phone: string): string | null {
  if (!phone || typeof phone !== 'string') {
    return null;
  }

  // Remove all non-digit characters except leading +
  let cleaned = phone.trim();
  
  // Remove +, spaces, dashes, parentheses, and other special characters
  cleaned = cleaned.replace(/[\s\+\-\(\)\.]/g, '');
  
  // Remove any remaining non-digit characters
  cleaned = cleaned.replace(/\D/g, '');
  
  // If empty after cleaning, return null
  if (!cleaned || cleaned.length === 0) {
    return null;
  }
  
  // Handle Nigerian numbers
  // If starts with 0 (local format like 08012345678), convert to 2348012345678
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    return '234' + cleaned.substring(1);
  }
  
  // If already starts with 234, validate length (should be 13 digits: 234 + 10 digits)
  if (cleaned.startsWith('234')) {
    if (cleaned.length === 13) {
      return cleaned;
    }
    // If 234 but wrong length, try to fix
    if (cleaned.length > 13) {
      // Take first 13 characters
      return cleaned.substring(0, 13);
    }
    // If less than 13, might be missing digits - return as is for now
    return cleaned;
  }
  
  // If 10 digits (without country code), assume Nigeria and add 234
  if (cleaned.length === 10) {
    return '234' + cleaned;
  }
  
  // If 11 digits and doesn't start with 0, might be international without +
  // Check if it looks like a Nigerian number (starts with 234)
  if (cleaned.length === 11 && !cleaned.startsWith('0')) {
    // Might be 234... already, check
    if (cleaned.substring(0, 3) === '234') {
      return cleaned;
    }
  }
  
  // For other cases, if it's a reasonable length, try adding 234
  if (cleaned.length >= 10 && cleaned.length <= 11) {
    // If it doesn't start with 234, add it
    if (!cleaned.startsWith('234')) {
      // Remove leading 0 if present
      if (cleaned.startsWith('0')) {
        cleaned = cleaned.substring(1);
      }
      return '234' + cleaned;
    }
  }
  
  // If we can't format it properly, return null
  return null;
}

/**
 * Bulk SMS Nigeria Integration (V3 API)
 * Uses V3 Bearer token authentication
 * Documentation: https://www.bulksmsnigeria.com/api
 * Base URL: https://www.bulksmsnigeria.com/api/v3
 * 
 * V3 API Notes:
 * - Authentication via Bearer token in Authorization header (NOT in body)
 * - Endpoint: /api/v3/sms (correct RESTful endpoint)
 * - Method: POST
 * - Body parameters: from, to, body (NO api_token in body)
 */
async function sendViaBulkSMSNigeria(
  messages: SMSMessage[],
  config: SMSConfig
): Promise<{ success: number; failed: number; errors: any[] }> {
  // ============================================================================
  // BULKSMS NIGERIA API V3 - BEARER TOKEN
  // ============================================================================
  // V3 Bearer Token from BulkSMS Nigeria dashboard
  // This is a V3 token - ensure you're using the V3 API endpoint
  // ============================================================================
  const HARDCODED_BEARER_TOKEN = '64|3sOUHaYqsNJOtM1Ci1aVObOWSl0ipVeNF0VT8WIK70b5c1b6'.trim();
  
  // Sender ID (max 11 characters)
  const senderId = config.senderId ? config.senderId.substring(0, 11) : 'CHURCH';
  
  if (!senderId) {
    throw new Error('Bulk SMS Nigeria requires SMS_SENDER_ID');
  }

  console.log('🔐 Using HARDCODED Bearer token (first 10 chars):', HARDCODED_BEARER_TOKEN.substring(0, 10) + '...');
  console.log('📤 Sender ID:', senderId);

  const results: { success: number; failed: number; errors: any[] } = { success: 0, failed: 0, errors: [] };

  // Format and validate phone numbers
  const formattedNumbers: string[] = [];
  const invalidNumbers: { phone: string; reason: string }[] = [];
  
  for (const msg of messages) {
    const formatted = formatPhoneNumberForSMS(msg.to);
    if (formatted) {
      formattedNumbers.push(formatted);
    } else {
      invalidNumbers.push({ phone: msg.to, reason: 'Invalid or unparseable phone number format' });
    }
  }
  
  if (formattedNumbers.length === 0) {
    results.failed = messages.length;
    results.errors = invalidNumbers.map(inv => ({
      to: inv.phone,
      error: { message: inv.reason },
      message: `Invalid phone number: ${inv.phone} - ${inv.reason}`
    }));
    return results;
  }

  // Prepare recipients as comma-separated string
  const recipients = formattedNumbers.join(',');
  const message = messages[0].message;
  
  console.log(`📱 Sending SMS to ${formattedNumbers.length} recipient(s)`);
  console.log(`📝 Message preview: ${message.substring(0, 50)}...`);
  
  // Log invalid numbers if any
  if (invalidNumbers.length > 0) {
    console.warn(`⚠️ ${invalidNumbers.length} invalid phone number(s) skipped:`, invalidNumbers);
  }

  // Use V3 API endpoint - correct RESTful endpoint
  const API_ENDPOINT = 'https://www.bulksmsnigeria.com/api/v3/sms';
  
  try {
    console.log('🌐 Calling BulkSMS Nigeria V3 API...');
    console.log('📋 Endpoint:', API_ENDPOINT);
    console.log('📋 Request payload:', {
      from: senderId,
      to: recipients.substring(0, 50) + (recipients.length > 50 ? '...' : ''),
      body: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
      recipientCount: formattedNumbers.length
    });
    console.log('🔐 Using V3 Bearer token (first 15 chars):', HARDCODED_BEARER_TOKEN.substring(0, 15) + '...');
    
    // Prepare request body - V3 uses from, to, body (NO api_token in body)
    const requestBody = {
      from: senderId,
      to: recipients,
      body: message,
    };
    
    console.log('📤 Full request body:', JSON.stringify(requestBody, null, 2));
    
    // Make POST request to V3 API endpoint
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HARDCODED_BEARER_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    console.log(`✅ API call completed`);
    console.log(`📊 HTTP Status: ${response.status} ${response.statusText}`);

    // Parse response
    let data: any;
    const responseText = await response.text();
    
    try {
      data = JSON.parse(responseText);
    } catch (jsonError) {
      console.error('❌ BulkSMS Nigeria V3 API returned non-JSON response');
      console.error('📄 Endpoint:', API_ENDPOINT);
      console.error('📄 Response status:', response.status, response.statusText);
      console.error('📄 Response body:', responseText);
      
      results.failed = formattedNumbers.length;
      results.errors.push({ 
        to: 'all', 
        error: { 
          status: response.status, 
          statusText: response.statusText, 
          body: responseText 
        },
        message: `API Error (${response.status}): ${response.statusText}. Response: ${responseText.substring(0, 200)}`
      });
      return results;
    }

    // Log full response for debugging (V3 API)
    console.log('📥 BulkSMS Nigeria V3 API Response:');
    console.log('   Endpoint:', API_ENDPOINT);
    console.log('   HTTP Status:', response.status, response.statusText);
    console.log('   Response Headers:', Object.fromEntries(response.headers.entries()));
    console.log('   Full Response Body:', JSON.stringify(data, null, 2));
    console.log('   Response Keys:', Object.keys(data));

    // Parse response according to BulkSMS Nigeria V3 API documentation
    // Success format: {"status": "success", "code": "BSNG-0000", "data": {...}}
    // Error format: {"status": "error", "code": "BSNG-XXXX", "error": {...}}
    
    if (data.status === 'success') {
      // Success response
      const errorCode = data.code || 'BSNG-0000';
      
      // Check if code indicates success (BSNG-0000 or 200)
      if (errorCode === 'BSNG-0000' || errorCode === '200' || response.ok) {
        // Count successful recipients
        const recipientCount = data.data?.recipients_count || 
                              data.recipients_count || 
                              formattedNumbers.length;
        
        results.success = recipientCount;
        results.failed = formattedNumbers.length - recipientCount;
        
        const cost = data.data?.cost || data.cost || 'N/A';
        const currency = data.data?.currency || data.currency || 'NGN';
        
        console.log(`✅ SMS sent successfully to ${recipientCount} recipient(s)`);
        console.log(`💰 Cost: ${currency} ${cost}`);
        
        // Add invalid numbers to failed count
        if (invalidNumbers.length > 0) {
          results.failed += invalidNumbers.length;
        }
      } else {
        // Success status but error code - treat as error
        results.failed = formattedNumbers.length;
        const errorMsg = data.error?.message || data.message || `Error code: ${errorCode}`;
        console.error('⚠️ API returned success status but error code:', errorCode, errorMsg);
        
        results.errors.push({ 
          to: 'all', 
          error: data.error || data,
          message: `[${errorCode}] ${errorMsg}`
        });
      }
    } else if (data.status === 'error' || !response.ok) {
      // Error response
      results.failed = formattedNumbers.length;
      const errorMsg = data.error?.message || data.message || `Error ${data.code || 'Unknown'}`;
      const errorCode = data.code || 'BSNG-UNKNOWN';
      
      console.error('❌ BulkSMS Nigeria Error:', errorCode);
      console.error('   Error message:', errorMsg);
      console.error('   Full error data:', JSON.stringify(data, null, 2));
      
      // Provide user-friendly error messages based on error codes
      let userFriendlyMsg = errorMsg;
      
      // BSNG-1xxx: Authentication errors
      if (response.status === 401 || errorCode === 'BSNG-1001' || errorCode.startsWith('BSNG-1')) {
        userFriendlyMsg = `Authentication error: ${errorMsg}. Please verify your Bearer API token is correct and has SMS sending permissions.`;
      } 
      // BSNG-2xxx: Invalid request errors
      else if (errorCode.startsWith('BSNG-2')) {
        userFriendlyMsg = `Invalid request: ${errorMsg}. Please check sender ID (max 11 characters) and phone number formats.`;
      } 
      // BSNG-3xxx: Service errors (balance, limits, etc.)
      else if (errorCode.startsWith('BSNG-3')) {
        userFriendlyMsg = `Service error: ${errorMsg}. Check your account balance and limits.`;
      } 
      // BSNG-5xxx: Server errors
      else if (errorCode.startsWith('BSNG-5')) {
        userFriendlyMsg = `Server error: ${errorMsg}. Please try again later.`;
      }
      
      results.errors.push({ 
        to: 'all', 
        error: data.error || data,
        message: `[${errorCode}] ${userFriendlyMsg}`
      });
    } else {
      // Unexpected response format
      results.failed = formattedNumbers.length;
      const errorMsg = `Unexpected response format. Status: ${data.status}, Code: ${data.code || 'N/A'}`;
      console.warn('⚠️ Unexpected response format:', data);
      
      results.errors.push({ 
        to: 'all', 
        error: data,
        message: errorMsg
      });
    }
  } catch (error: any) {
    console.error('❌ BulkSMS Nigeria API Exception:', error);
    console.error('   Error type:', error.constructor.name);
    console.error('   Error message:', error.message);
    console.error('   Error stack:', error.stack);
    
    const errorMsg = error.message || String(error);
    results.failed = formattedNumbers.length;
    results.errors.push({ 
      to: 'all', 
      error: error, 
      message: `Network/API Error: ${errorMsg}` 
    });
    
    // If bulk sending fails, try sending individually as fallback
    if (formattedNumbers.length > 1) {
      console.log('🔄 Attempting to send messages individually as fallback...');
      
      for (let i = 0; i < formattedNumbers.length; i++) {
        const phoneNumber = formattedNumbers[i];
        const originalMessage = messages.find(m => formatPhoneNumberForSMS(m.to) === phoneNumber) || messages[0];
        
        try {
          // Use V3 endpoint for individual sends
          const individualResponse = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${HARDCODED_BEARER_TOKEN}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({
              from: senderId,
              to: phoneNumber,
              body: originalMessage.message,
            }),
          });

          const individualResponseText = await individualResponse.text();
          let individualData: any;
          
          try {
            individualData = JSON.parse(individualResponseText);
          } catch {
            console.error(`❌ Individual SMS failed for ${phoneNumber}: Non-JSON response`, individualResponseText);
            continue;
          }

          if (individualData.status === 'success' && 
              (individualData.code === 'BSNG-0000' || individualData.code === '200' || individualResponse.ok)) {
            results.success++;
            results.failed = Math.max(0, results.failed - 1);
            console.log(`✅ Individual SMS sent successfully to ${phoneNumber}`);
          } else {
            const errorMsg = individualData.error?.message || individualData.message || `Error ${individualData.code || 'Unknown'}`;
            const errorCode = individualData.code || 'BSNG-UNKNOWN';
            console.error(`❌ Individual SMS failed for ${phoneNumber}:`, errorCode, errorMsg);
            results.errors.push({ 
              to: phoneNumber, 
              error: individualData.error || individualData,
              message: `[${errorCode}] ${errorMsg}`
            });
          }
        } catch (err: any) {
          const errMsg = err.message || String(err);
          console.error(`❌ Individual SMS exception for ${phoneNumber}:`, errMsg);
          results.errors.push({ 
            to: phoneNumber, 
            error: err, 
            message: errMsg 
          });
        }
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

