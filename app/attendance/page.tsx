'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function AttendancePage() {
  const [attendances, setAttendances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendances();
  }, []);

  const fetchAttendances = async () => {
    try {
      const res = await fetch('/api/attendance');
      const data = await res.json();
      setAttendances(data.attendances || []);
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this attendance record?')) return;

    try {
      const res = await fetch(`/api/attendance/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchAttendances();
      }
    } catch (error) {
      console.error('Failed to delete attendance:', error);
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-navy">Attendance Records</h1>
          <Link href="/attendance/new">
            <Button variant="primary" className="flex items-center gap-2">
              <Plus size={20} />
              Record Attendance
            </Button>
          </Link>
        </div>

        <Card>
          {attendances.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No attendance records found</p>
              <Link href="/attendance/new">
                <Button variant="primary">Record First Attendance</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Event Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Total Present</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Notes</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {attendances.map((attendance) => (
                    <tr key={attendance._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{attendance.eventName}</td>
                      <td className="py-3 px-4 text-gray-600">
                        {format(new Date(attendance.date), 'MMM dd, yyyy')}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-navy">{attendance.totalPresent}</span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {attendance.notes || 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/attendance/${attendance._id}/edit`}>
                            <Button variant="secondary" className="p-2">
                              <Edit size={16} />
                            </Button>
                          </Link>
                          <Button
                            variant="danger"
                            className="p-2"
                            onClick={() => handleDelete(attendance._id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}


