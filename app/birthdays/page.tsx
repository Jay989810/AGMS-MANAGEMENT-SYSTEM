'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Gift, Mail, Download } from 'lucide-react';
import { format, addDays, startOfMonth, endOfMonth } from 'date-fns';
import Image from 'next/image';
import { exportToCSV } from '@/lib/exportToCSV';
import Toast from '@/components/ui/Toast';

export default function BirthdaysPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'month' | 'week'>('month');
  const [sending, setSending] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; isVisible: boolean }>({
    message: '',
    type: 'info',
    isVisible: false,
  });

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const res = await fetch('/api/members', {
        credentials: 'include',
      });
      const data = await res.json();
      setMembers(data.members || []);
    } catch (error) {
      console.error('Failed to fetch members:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUpcomingBirthdays = () => {
    const today = new Date();
    const nextWeek = addDays(today, 7);
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);

    return members.filter((member) => {
      const dob = new Date(member.dateOfBirth);
      const thisYearBirthday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
      
      if (filter === 'week') {
        return thisYearBirthday >= today && thisYearBirthday <= nextWeek;
      } else {
        return thisYearBirthday >= monthStart && thisYearBirthday <= monthEnd;
      }
    }).sort((a, b) => {
      const aDob = new Date(a.dateOfBirth);
      const bDob = new Date(b.dateOfBirth);
      const aThisYear = new Date(today.getFullYear(), aDob.getMonth(), aDob.getDate());
      const bThisYear = new Date(today.getFullYear(), bDob.getMonth(), bDob.getDate());
      return aThisYear.getTime() - bThisYear.getTime();
    });
  };

  const sendBirthdayEmail = async (memberId: string) => {
    setSending(memberId);
    try {
      const res = await fetch('/api/messaging/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'birthday',
          memberId,
        }),
        credentials: 'include',
      });

      if (res.ok) {
        alert('Birthday email sent successfully!');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to send email');
      }
    } catch (error) {
      console.error('Failed to send email:', error);
      alert('Failed to send email. Please try again.');
    } finally {
      setSending(null);
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

  const upcomingBirthdays = getUpcomingBirthdays();

  const handleExportCSV = () => {
    if (upcomingBirthdays.length === 0) {
      setToast({ message: 'No records available for export', type: 'error', isVisible: true });
      return;
    }

    try {
      const today = new Date();
      const exportData = upcomingBirthdays.map((member) => {
        const dob = new Date(member.dateOfBirth);
        const age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate()) ? age - 1 : age;

        return {
          Name: member.fullName,
          'Date of Birth': format(dob, 'yyyy-MM-dd'),
          Department: member.ministry || 'N/A',
          Age: actualAge,
        };
      });

      exportToCSV(exportData, 'birthdays');
      setToast({ message: 'CSV file downloaded successfully', type: 'success', isVisible: true });
    } catch (error: any) {
      setToast({ message: error.message || 'Failed to export CSV', type: 'error', isVisible: true });
    }
  };

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
          <h1 className="text-2xl lg:text-3xl font-bold text-navy">Birthday Tracker</h1>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {upcomingBirthdays.length > 0 && (
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
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant={filter === 'month' ? 'primary' : 'secondary'}
                onClick={() => setFilter('month')}
                className="flex-1 sm:flex-none"
              >
                This Month
              </Button>
              <Button
                variant={filter === 'week' ? 'primary' : 'secondary'}
                onClick={() => setFilter('week')}
                className="flex-1 sm:flex-none"
              >
                Next 7 Days
              </Button>
            </div>
          </div>
        </div>

        <Card>
          {upcomingBirthdays.length === 0 ? (
            <div className="text-center py-12">
              <Gift size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">
                No birthdays in the {filter === 'week' ? 'next 7 days' : 'current month'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {upcomingBirthdays.map((member) => {
                const dob = new Date(member.dateOfBirth);
                const today = new Date();
                const thisYearBirthday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
                const isToday = format(thisYearBirthday, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');

                return (
                  <div
                    key={member._id}
                    className={`p-6 rounded-lg border-2 ${
                      isToday
                        ? 'border-gold bg-gold/10'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      {member.profileImage ? (
                        <Image
                          src={member.profileImage}
                          alt={member.fullName}
                          width={60}
                          height={60}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-15 h-15 rounded-full bg-navy flex items-center justify-center text-white font-semibold text-lg min-w-[60px] min-h-[60px]">
                          {member.fullName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-lg">{member.fullName}</h3>
                        <p className="text-sm text-gray-600">
                          {format(thisYearBirthday, 'MMMM dd, yyyy')}
                          {isToday && (
                            <span className="ml-2 px-2 py-1 bg-gold text-navy rounded-full text-xs font-semibold">
                              Today!
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    {member.email && (
                      <Button
                        variant="gold"
                        className="w-full flex items-center justify-center gap-2"
                        onClick={() => sendBirthdayEmail(member._id)}
                        disabled={sending === member._id}
                      >
                        <Mail size={16} />
                        {sending === member._id ? 'Sending...' : 'Send Birthday Email'}
                      </Button>
                    )}
                    {!member.email && (
                      <p className="text-sm text-gray-500 text-center">
                        No email address on file
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}

