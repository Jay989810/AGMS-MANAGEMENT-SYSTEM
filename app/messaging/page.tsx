'use client';

import { useState, FormEvent } from 'react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { Mail, Send, MessageSquare, Phone } from 'lucide-react';

export default function MessagingPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'broadcast',
    recipients: 'all',
    channel: 'sms', // email, sms, whatsapp (default to SMS for Nigeria)
    subject: '',
    message: '',
  });
  const [success, setSuccess] = useState('');
  const [result, setResult] = useState<{ sent: number; failed: number; total: number } | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');

    try {
      const res = await fetch('/api/messaging/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      setSuccess(data.message || 'Message sent successfully!');
      setResult({
        sent: data.sent || 0,
        failed: data.failed || 0,
        total: data.total || 0,
      });
      setFormData({
        type: 'broadcast',
        recipients: 'all',
        channel: formData.channel,
        subject: '',
        message: '',
      });
    } catch (error: any) {
      alert(error.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-4 lg:space-y-6">
        <div className="flex items-center gap-3">
          <Mail className="text-navy" size={24} />
          <h1 className="text-2xl lg:text-3xl font-bold text-navy">Messaging</h1>
        </div>

        <Card>
          <p className="text-gray-600 mb-6">
            Send broadcast messages to church members via Email, SMS, or WhatsApp. Use this for announcements, reminders, or special messages.
          </p>

          {success && (
            <div className={`mb-6 p-4 border rounded-lg ${
              result && result.failed > 0
                ? 'bg-yellow-50 border-yellow-200 text-yellow-700'
                : 'bg-green-50 border-green-200 text-green-700'
            }`}>
              <p className="font-semibold">{success}</p>
              {result && (
                <p className="text-sm mt-1">
                  Successfully sent: {result.sent} | Failed: {result.failed} | Total: {result.total}
                </p>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Select
              label="Channel *"
              value={formData.channel}
              onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
              options={[
                { value: 'sms', label: '📱 SMS (Recommended for Nigeria)' },
                { value: 'email', label: '📧 Email' },
                { value: 'whatsapp', label: '💬 WhatsApp' },
              ]}
            />

            <Select
              label="Recipients"
              value={formData.recipients}
              onChange={(e) => setFormData({ ...formData, recipients: e.target.value })}
              options={[
                { value: 'all', label: 'All Members' },
                { value: 'active', label: 'Active Members Only' },
              ]}
            />

            <Input
              label="Subject *"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="e.g., Weekly Announcements"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message * (HTML supported)
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent"
                rows={10}
                placeholder="Enter your message here..."
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                {formData.channel === 'email' 
                  ? 'You can use HTML tags for formatting. Line breaks will be converted to <br> tags.'
                  : formData.channel === 'sms'
                  ? 'SMS messages are limited to 160 characters. Longer messages may be split.'
                  : 'WhatsApp supports longer messages with basic formatting.'}
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <Send size={20} />
                {loading ? 'Sending...' : 'Send Message'}
              </Button>
            </div>
          </form>
        </Card>

        <Card title="Configuration Guide">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-navy mb-2 flex items-center gap-2">
                <Mail size={18} /> Email Configuration
              </h4>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 ml-4">
                <li>SMTP_HOST (default: smtp.gmail.com)</li>
                <li>SMTP_PORT (default: 587)</li>
                <li>SMTP_USER (your Gmail address)</li>
                <li>SMTP_PASS (your Gmail app password)</li>
                <li>SMTP_FROM (sender name and email)</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-navy mb-2 flex items-center gap-2">
                <Phone size={18} /> SMS Configuration (Bulk SMS Nigeria)
              </h4>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Recommended:</strong> Bulk SMS Nigeria (eBulkSMS, BulkSMSNigeria) - Best for Nigeria
              </p>
              <p className="text-sm font-semibold text-green-700 mb-2">Required for Bulk SMS Nigeria:</p>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 ml-4">
                <li>SMS_PROVIDER=bulksmsnigeria</li>
                <li>SMS_USERNAME (your Bulk SMS Nigeria username)</li>
                <li>SMS_PASSWORD (your Bulk SMS Nigeria API key/password)</li>
                <li>SMS_SENDER_ID (your approved sender ID, e.g., &quot;CHURCH&quot;)</li>
              </ul>
              <p className="text-sm text-gray-600 mt-3 mb-2">Other supported providers:</p>
              <ul className="list-disc list-inside text-sm text-gray-500 space-y-1 ml-4">
                <li>Termii (SMS_PROVIDER=termii)</li>
                <li>Twilio (SMS_PROVIDER=twilio)</li>
                <li>Africa&apos;s Talking (SMS_PROVIDER=africas_talking)</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-navy mb-2 flex items-center gap-2">
                <MessageSquare size={18} /> WhatsApp Configuration
              </h4>
              <p className="text-sm text-gray-600 mb-2">Supported providers: WhatsApp Business API, Twilio WhatsApp, 360dialog, ChatAPI</p>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 ml-4">
                <li>WHATSAPP_PROVIDER (whatsapp_business, twilio_whatsapp, 360dialog, or chatapi)</li>
                <li>WHATSAPP_API_KEY (your provider API key)</li>
                <li>WHATSAPP_PHONE_NUMBER_ID (for WhatsApp Business API)</li>
                <li>WHATSAPP_ACCESS_TOKEN (for WhatsApp Business API)</li>
                <li>WHATSAPP_ACCOUNT_SID (for Twilio)</li>
                <li>WHATSAPP_AUTH_TOKEN (for Twilio)</li>
                <li>WHATSAPP_FROM (from number)</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}


