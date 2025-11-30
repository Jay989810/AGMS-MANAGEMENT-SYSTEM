'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';

export default function NewSermonPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    preacher: '',
    date: '',
    summary: '',
    bibleText: '',
    mediaLink: '',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/sermons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create sermon');
      }

      router.push('/dashboard/sermons');
    } catch (error: any) {
      console.error('Error creating sermon:', error);
      alert(error.message || 'Failed to create sermon. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-4 lg:space-y-6 px-4 sm:px-0">
        <h1 className="text-2xl lg:text-3xl font-bold text-navy">Add New Sermon</h1>

        <form onSubmit={handleSubmit}>
          <Card>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Sermon Title *"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="e.g., The Power of Faith"
                />
                <Input
                  label="Preacher *"
                  value={formData.preacher}
                  onChange={(e) => setFormData({ ...formData, preacher: e.target.value })}
                  required
                  placeholder="e.g., Pastor John Doe"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Date *"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
                <Input
                  label="Bible Text *"
                  value={formData.bibleText}
                  onChange={(e) => setFormData({ ...formData, bibleText: e.target.value })}
                  required
                  placeholder="e.g., John 3:16"
                />
              </div>

              <Textarea
                label="Summary *"
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                required
                rows={5}
                placeholder="Enter a brief summary of the sermon..."
              />

              <Input
                label="Media Link (Optional)"
                type="url"
                value={formData.mediaLink}
                onChange={(e) => setFormData({ ...formData, mediaLink: e.target.value })}
                placeholder="YouTube, audio, or PDF link"
              />
              <p className="text-sm text-gray-500 -mt-4">
                You can add links to YouTube videos, audio recordings, or PDF notes
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                <Button type="submit" variant="primary" disabled={loading} className="w-full sm:w-auto">
                  {loading ? 'Creating...' : 'Create Sermon'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.back()}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  );
}

