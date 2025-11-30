'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function EditAttendancePage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    eventName: '',
    date: '',
    totalPresent: 0,
    notes: '',
  });

  useEffect(() => {
    if (params.id) {
      fetchAttendance(params.id as string);
    }
  }, [params.id]);

  const fetchAttendance = async (id: string) => {
    try {
      const res = await fetch(`/api/attendance/${id}`);
      const data = await res.json();
      const attendance = data.attendance;
      
      setFormData({
        eventName: attendance.eventName,
        date: new Date(attendance.date).toISOString().split('T')[0],
        totalPresent: attendance.totalPresent,
        notes: attendance.notes || '',
      });
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const attendanceData = {
        ...formData,
        date: new Date(formData.date),
        totalPresent: parseInt(formData.totalPresent.toString()),
      };

      const res = await fetch(`/api/attendance/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attendanceData),
      });

      if (!res.ok) {
        throw new Error('Failed to update attendance record');
      }

      router.push('/attendance');
    } catch (error) {
      console.error('Error updating attendance:', error);
      alert('Failed to update attendance record. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-4 lg:space-y-6 px-4 sm:px-0">
        <h1 className="text-2xl lg:text-3xl font-bold text-navy">Edit Attendance Record</h1>

        <form onSubmit={handleSubmit}>
          <Card>
            <div className="space-y-6">
              <Input
                label="Event Name *"
                value={formData.eventName}
                onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
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
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                <Button type="submit" variant="primary" disabled={loading} className="w-full sm:w-auto">
                  {loading ? 'Updating...' : 'Update Attendance'}
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


