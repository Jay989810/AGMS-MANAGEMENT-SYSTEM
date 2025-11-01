'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Plus, Edit, Trash2, Download } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { exportToCSV } from '@/lib/exportToCSV';
import Toast from '@/components/ui/Toast';

export default function AttendancePage() {
  const [attendances, setAttendances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; isVisible: boolean }>({
    message: '',
    type: 'info',
    isVisible: false,
  });

  useEffect(() => {
    fetchAttendances();
  }, []);

  const fetchAttendances = async () => {
    try {
      const res = await fetch('/api/attendance', {
        credentials: 'include',
      });
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
      const res = await fetch(`/api/attendance/${id}`, { 
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        // Update UI immediately
        setAttendances(attendances.filter(a => a._id !== id));
        setToast({ message: 'Attendance record deleted successfully', type: 'success', isVisible: true });
        // Refresh to ensure consistency
        fetchAttendances();
      } else {
        setToast({ message: 'Failed to delete attendance record', type: 'error', isVisible: true });
      }
    } catch (error) {
      console.error('Failed to delete attendance:', error);
      setToast({ message: 'Failed to delete attendance record', type: 'error', isVisible: true });
    }
  };

  const handleExportCSV = () => {
    if (attendances.length === 0) {
      setToast({ message: 'No records available for export', type: 'error', isVisible: true });
      return;
    }

    try {
      const exportData = attendances.map((attendance) => ({
        Date: format(new Date(attendance.date), 'yyyy-MM-dd'),
        Event: attendance.eventName,
        'Total Present': attendance.totalPresent,
        Notes: attendance.notes || '',
      }));

      exportToCSV(exportData, 'attendance');
      setToast({ message: 'CSV file downloaded successfully', type: 'success', isVisible: true });
    } catch (error: any) {
      setToast({ message: error.message || 'Failed to export CSV', type: 'error', isVisible: true });
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
        {/* Toast Notification */}
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          onClose={() => setToast({ ...toast, isVisible: false })}
        />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-2xl lg:text-3xl font-bold text-navy">Attendance Records</h1>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {attendances.length > 0 && (
              <Button
                variant="gold"
                onClick={handleExportCSV}
                className="flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <Download size={20} />
                <span className="hidden sm:inline">Export CSV</span>
                <span className="sm:hidden">Export</span>
              </Button>
            )}
            <Link href="/attendance/new" className="w-full sm:w-auto">
              <Button variant="primary" className="flex items-center justify-center gap-2 w-full sm:w-auto">
                <Plus size={20} />
                Record Attendance
              </Button>
            </Link>
          </div>
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
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-700 text-sm">Event Name</th>
                    <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-700 text-sm">Date</th>
                    <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-700 text-sm">Total Present</th>
                    <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-700 text-sm hidden md:table-cell">Notes</th>
                    <th className="text-right py-3 px-2 sm:px-4 font-semibold text-gray-700 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {attendances.map((attendance) => (
                    <tr key={attendance._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-2 sm:px-4 font-medium text-sm">
                        <div className="flex flex-col">
                          <span>{attendance.eventName}</span>
                          <span className="text-xs text-gray-500 md:hidden">{attendance.notes || 'No notes'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-gray-600 text-sm">
                        {format(new Date(attendance.date), 'MMM dd, yyyy')}
                      </td>
                      <td className="py-3 px-2 sm:px-4">
                        <span className="font-semibold text-navy text-sm">{attendance.totalPresent}</span>
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-gray-600 text-sm hidden md:table-cell">
                        {attendance.notes || 'N/A'}
                      </td>
                      <td className="py-3 px-2 sm:px-4">
                        <div className="flex items-center justify-end gap-1 sm:gap-2">
                          <Link href={`/attendance/${attendance._id}/edit`}>
                            <Button variant="secondary" className="p-1.5 sm:p-2">
                              <Edit size={14} className="sm:w-4 sm:h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="danger"
                            className="p-1.5 sm:p-2"
                            onClick={() => handleDelete(attendance._id)}
                          >
                            <Trash2 size={14} className="sm:w-4 sm:h-4" />
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


