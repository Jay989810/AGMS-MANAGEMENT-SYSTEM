'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Users, Building2, Calendar, Gift, Mail, Plus } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
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
          <h1 className="text-3xl font-bold text-navy">Dashboard</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-navy to-navy-dark text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Total Members</p>
                <p className="text-3xl font-bold mt-2">{stats?.totalMembers || 0}</p>
              </div>
              <Users size={40} className="text-gold" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-navy to-navy-dark text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Departments</p>
                <p className="text-3xl font-bold mt-2">{stats?.totalDepartments || 0}</p>
              </div>
              <Building2 size={40} className="text-gold" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-navy to-navy-dark text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Attendance Records</p>
                <p className="text-3xl font-bold mt-2">{stats?.totalAttendance || 0}</p>
              </div>
              <Calendar size={40} className="text-gold" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-gold to-gold-dark text-navy">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-navy text-sm font-medium">Upcoming Birthdays</p>
                <p className="text-3xl font-bold mt-2">{stats?.upcomingBirthdays?.length || 0}</p>
              </div>
              <Gift size={40} className="text-navy" />
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card title="Quick Actions">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/members/new">
              <Button variant="primary" className="w-full flex items-center justify-center gap-2">
                <Plus size={20} />
                Add Member
              </Button>
            </Link>
            <Link href="/attendance/new">
              <Button variant="gold" className="w-full flex items-center justify-center gap-2">
                <Calendar size={20} />
                Record Attendance
              </Button>
            </Link>
            <Link href="/messaging">
              <Button variant="secondary" className="w-full flex items-center justify-center gap-2">
                <Mail size={20} />
                Send Email
              </Button>
            </Link>
          </div>
        </Card>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Upcoming Birthdays">
            {stats?.upcomingBirthdays?.length > 0 ? (
              <div className="space-y-3">
                {stats.upcomingBirthdays.map((bday: any) => (
                  <div key={bday.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{bday.name}</p>
                      <p className="text-sm text-gray-500">{bday.date}</p>
                    </div>
                    <Gift size={20} className="text-gold" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No upcoming birthdays</p>
            )}
          </Card>

          <Card title="Recent Attendance">
            {stats?.recentAttendance?.length > 0 ? (
              <div className="space-y-3">
                {stats.recentAttendance.map((att: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{att.eventName}</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(att.date), 'MMM dd, yyyy')} • {att.totalPresent} present
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No recent attendance records</p>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}


