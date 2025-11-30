/**
 * WhatsApp Business API Integration
 * Supports: WhatsApp Business API, Twilio WhatsApp, 360dialog, etc.
 */

export interface WhatsAppConfig {
  provider: 'whatsapp_business' | 'twilio_whatsapp' | '360dialog' | 'chatapi' | 'custom';
  apiKey?: string;
  apiSecret?: string;
  phoneNumberId?: string; // For WhatsApp Business API
  businessAccountId?: string; // For WhatsApp Business API
  accessToken?: string; // For WhatsApp Business API
  from?: string; // For Twilio
  accountSid?: string; // For Twilio
  authToken?: string; // For Twilio
}

export interface WhatsAppMessage {
  to: string;
  message: string;
  type?: 'text' | 'template';
  templateName?: string;
  templateParams?: string[];
}

/**
 * Send WhatsApp messages
 */
export async function sendWhatsApp(
  messages: WhatsAppMessage[],
  config: WhatsAppConfig
): Promise<{ success: number; failed: number; errors: any[] }> {
  switch (config.provider) {
    case 'whatsapp_business':
      return sendViaWhatsAppBusiness(messages, config);
    case 'twilio_whatsapp':
      return sendViaTwilioWhatsApp(messages, config);
    case '360dialog':
      return sendVia360Dialog(messages, config);
    case 'chatapi':
      return sendViaChatAPI(messages, config);
    default:
      throw new Error(`Unsupported WhatsApp provider: ${config.provider}`);
  }
}

/**
 * WhatsApp Business API (Meta)
 */
async function sendViaWhatsAppBusiness(
  messages: WhatsAppMessage[],
  config: WhatsAppConfig
): Promise<{ success: number; failed: number; errors: any[] }> {
  if (!config.phoneNumberId || !config.accessToken) {
    throw new Error('WhatsApp Business API requires phoneNumberId and accessToken');
  }

  const results: { success: number; failed: number; errors: any[] } = { success: 0, failed: 0, errors: [] };

  for (const msg of messages) {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${config.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.accessToken}`,
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: msg.to,
            type: msg.type || 'text',
            text: msg.type === 'text' ? { body: msg.message } : undefined,
            template: msg.type === 'template' ? {
              name: msg.templateName,
              language: { code: 'en' },
              components: msg.templateParams ? [{
                type: 'body',
                parameters: msg.templateParams.map(p => ({ type: 'text', text: p }))
              }] : undefined,
            } : undefined,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.messages?.[0]?.id) {
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

/**
 * Twilio WhatsApp
 */
async function sendViaTwilioWhatsApp(
  messages: WhatsAppMessage[],
  config: WhatsAppConfig
): Promise<{ success: number; failed: number; errors: any[] }> {
  if (!config.accountSid || !config.authToken || !config.from) {
    throw new Error('Twilio WhatsApp requires accountSid, authToken, and from number');
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
            From: `whatsapp:${config.from}`,
            To: `whatsapp:${msg.to}`,
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
 * 360dialog (WhatsApp Business API Provider)
 */
async function sendVia360Dialog(
  messages: WhatsAppMessage[],
  config: WhatsAppConfig
): Promise<{ success: number; failed: number; errors: any[] }> {
  if (!config.apiKey) {
    throw new Error('360dialog requires apiKey');
  }

  const results: { success: number; failed: number; errors: any[] } = { success: 0, failed: 0, errors: [] };

  for (const msg of messages) {
    try {
      const response = await fetch('https://waba-v2.360dialog.io/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'D360-API-KEY': config.apiKey,
        },
        body: JSON.stringify({
          recipient_type: 'individual',
          to: msg.to,
          type: msg.type || 'text',
          text: msg.type === 'text' ? { body: msg.message } : undefined,
        }),
      });

      const data = await response.json();

      if (response.ok && data.messages?.[0]?.id) {
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

/**
 * ChatAPI (Alternative WhatsApp provider)
 */
async function sendViaChatAPI(
  messages: WhatsAppMessage[],
  config: WhatsAppConfig
): Promise<{ success: number; failed: number; errors: any[] }> {
  if (!config.apiKey) {
    throw new Error('ChatAPI requires apiKey');
  }

  const results: { success: number; failed: number; errors: any[] } = { success: 0, failed: 0, errors: [] };

  for (const msg of messages) {
    try {
      const response = await fetch(`https://eu1.chat-api.com/instance${config.apiKey}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: msg.to,
          body: msg.message,
        }),
      });

      const data = await response.json();

      if (data.sent) {
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

