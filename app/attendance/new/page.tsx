'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function NewAttendancePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    eventName: '',
    date: new Date().toISOString().split('T')[0],
    totalPresent: 0,
    notes: '',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const attendanceData = {
        ...formData,
        date: new Date(formData.date),
        totalPresent: parseInt(formData.totalPresent.toString()),
      };

      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attendanceData),
      });

      if (!res.ok) {
        throw new Error('Failed to create attendance record');
      }

      router.push('/attendance');
    } catch (error) {
      console.error('Error creating attendance:', error);
      alert('Failed to create attendance record. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-navy">Record Attendance</h1>

        <form onSubmit={handleSubmit}>
          <Card>
            <div className="space-y-6">
              <Input
                label="Event Name *"
                value={formData.eventName}
                onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                placeholder="e.g., Sunday Service, Prayer Meeting"
                required
              />

              <Input
                label="Date *"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />

              <Input
                label="Total Present *"
                type="number"
                min="0"
                value={formData.totalPresent}
                onChange={(e) => setFormData({ ...formData, totalPresent: parseInt(e.target.value) || 0 })}
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent"
                  rows={4}
                  placeholder="Optional notes about the service..."
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" variant="primary" disabled={loading}>
                  {loading ? 'Recording...' : 'Record Attendance'}
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


