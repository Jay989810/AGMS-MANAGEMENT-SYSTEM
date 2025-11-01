'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';

export default function EditSermonPage() {
  const router = useRouter();
  const params = useParams();
  const sermonId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    preacher: '',
    date: '',
    summary: '',
    bibleText: '',
    mediaLink: '',
  });

  useEffect(() => {
    fetchSermon();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sermonId]);

  const fetchSermon = async () => {
    try {
      const res = await fetch(`/api/sermons/${sermonId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch sermon');
      }
      const data = await res.json();
      const sermon = data.sermon;
      
      // Format date for input field (YYYY-MM-DD)
      const date = new Date(sermon.date);
      const formattedDate = date.toISOString().split('T')[0];

      setFormData({
        title: sermon.title || '',
        preacher: sermon.preacher || '',
        date: formattedDate,
        summary: sermon.summary || '',
        bibleText: sermon.bibleText || '',
        mediaLink: sermon.mediaLink || '',
      });
    } catch (error) {
      console.error('Error fetching sermon:', error);
      alert('Failed to load sermon');
      router.push('/dashboard/sermons');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/sermons/${sermonId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update sermon');
      }

      router.push('/dashboard/sermons');
    } catch (error: any) {
      console.error('Error updating sermon:', error);
      alert(error.message || 'Failed to update sermon. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-navy">Edit Sermon</h1>

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

              <div className="flex gap-4 pt-4">
                <Button type="submit" variant="primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Update Sermon'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.back()}
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

