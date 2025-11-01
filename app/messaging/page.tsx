'use client';

import { useState, FormEvent } from 'react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { Mail, Send } from 'lucide-react';

export default function MessagingPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'broadcast',
    recipients: 'all',
    subject: '',
    message: '',
  });
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');

    try {
      const res = await fetch('/api/messaging/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      setSuccess(data.message || 'Message sent successfully!');
      setFormData({
        type: 'broadcast',
        recipients: 'all',
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
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Mail className="text-navy" size={32} />
          <h1 className="text-3xl font-bold text-navy">Messaging</h1>
        </div>

        <Card>
          <p className="text-gray-600 mb-6">
            Send broadcast emails to church members. Use this for announcements, reminders, or special messages.
          </p>

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
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
                You can use HTML tags for formatting. Line breaks will be converted to &lt;br&gt; tags.
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Send size={20} />
                {loading ? 'Sending...' : 'Send Message'}
              </Button>
            </div>
          </form>
        </Card>

        <Card title="Email Configuration">
          <p className="text-sm text-gray-600 mb-2">
            Make sure your SMTP credentials are configured in your environment variables:
          </p>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
            <li>SMTP_HOST (default: smtp.gmail.com)</li>
            <li>SMTP_PORT (default: 587)</li>
            <li>SMTP_USER (your Gmail address)</li>
            <li>SMTP_PASS (your Gmail app password)</li>
            <li>SMTP_FROM (sender name and email)</li>
          </ul>
        </Card>
      </div>
    </DashboardLayout>
  );
}


