'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Calendar, Users, User, Send, MessageSquare, Mail } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

export default function WeeklySelectionPage() {
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selection, setSelection] = useState<any>(null);
  const [channel, setChannel] = useState<'sms' | 'email'>('sms');
  const [message, setMessage] = useState('');
  
  // Calculate remaining prayer sends (max 2 per week)
  const prayerSentCount = selection?.prayerSentCount || 0;
  const remainingSends = 2 - prayerSentCount;
  const canSendPrayer = remainingSends > 0;

  useEffect(() => {
    fetchSelection();
  }, []);

  const fetchSelection = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/weekly-selection');
      const data = await res.json();
      if (res.ok) {
        setSelection(data.selection);
      }
    } catch (error) {
      console.error('Failed to fetch weekly selection:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendPrayer = async () => {
    setSending(true);
    try {
      const res = await fetch('/api/weekly-selection/send-prayer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel,
          customMessage: message || undefined,
        }),
        credentials: 'include',
      });

      const data = await res.json();
      if (res.ok) {
        alert(`Prayer sent successfully! ${data.message}`);
        fetchSelection(); // Refresh to update prayerSent status
      } else {
        alert(data.error || 'Failed to send prayer');
      }
    } catch (error: any) {
      alert(error.message || 'Failed to send prayer');
    } finally {
      setSending(false);
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

  const weekStart = selection?.weekStartDate ? new Date(selection.weekStartDate) : new Date();
  const weekEnd = selection?.weekEndDate ? new Date(selection.weekEndDate) : new Date();
  const isFamily = selection?.selectionType === 'family';
  const selectedEntity = isFamily ? selection.familyId : selection.memberId;

  return (
    <DashboardLayout>
      <div className="space-y-4 lg:space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-navy">Member/Family of the Week</h1>
            <p className="text-sm text-gray-600 mt-1">
              {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
            </p>
          </div>
          <div className="flex items-center gap-2 text-navy">
            <Calendar size={24} />
          </div>
        </div>

        {selection && selectedEntity ? (
          <>
            <Card>
              <div className="space-y-4 lg:space-y-6">
                <div className="flex items-start gap-4 pb-4 border-b">
                  <div className={`p-4 rounded-lg ${isFamily ? 'bg-navy' : 'bg-gold'}`}>
                    {isFamily ? (
                      <Users className="text-white" size={32} />
                    ) : (
                      <User className="text-white" size={32} />
                    )}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl lg:text-2xl font-bold text-navy mb-2">
                      {isFamily ? selectedEntity.familyName : selectedEntity.fullName}
                    </h2>
                    <p className="text-gray-600 text-sm lg:text-base">
                      {isFamily ? 'Family' : 'Member'} of the Week
                    </p>
                    {isFamily && selectedEntity.members && (
                      <p className="text-gray-500 text-xs sm:text-sm mt-1">
                        {selectedEntity.members.length} member{selectedEntity.members.length !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>

                {isFamily && selectedEntity.members && selectedEntity.members.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-3 text-sm lg:text-base">Family Members:</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {selectedEntity.members.map((member: any) => (
                        <div
                          key={member._id}
                          className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <p className="font-medium text-sm lg:text-base text-gray-900">{member.fullName}</p>
                          {member.phone && (
                            <p className="text-xs sm:text-sm text-gray-600 mt-1">📱 {member.phone}</p>
                          )}
                          {member.email && (
                            <p className="text-xs sm:text-sm text-gray-600">📧 {member.email}</p>
                          )}
                          {member.relationship && (
                            <span className="inline-block mt-1 px-2 py-1 text-xs bg-navy/10 text-navy rounded">
                              {member.relationship}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!isFamily && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm lg:text-base">
                    {selectedEntity.phone && (
                      <div>
                        <span className="text-gray-600">Phone:</span>
                        <p className="font-medium text-gray-900">{selectedEntity.phone}</p>
                      </div>
                    )}
                    {selectedEntity.email && (
                      <div>
                        <span className="text-gray-600">Email:</span>
                        <p className="font-medium text-gray-900">{selectedEntity.email}</p>
                      </div>
                    )}
                    {selectedEntity.address && (
                      <div className="sm:col-span-2">
                        <span className="text-gray-600">Address:</span>
                        <p className="font-medium text-gray-900">{selectedEntity.address}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg lg:text-xl font-semibold text-navy">Send Weekly Prayer</h3>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  canSendPrayer 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {canSendPrayer 
                    ? `${remainingSends} send${remainingSends > 1 ? 's' : ''} remaining` 
                    : 'All sends used (2/2)'}
                </div>
              </div>
              
              <div className="space-y-4 lg:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Channel *
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={() => setChannel('sms')}
                      className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                        channel === 'sms'
                          ? 'border-navy bg-navy text-white'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      <MessageSquare size={20} />
                      <span className="text-sm lg:text-base">SMS</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setChannel('email')}
                      className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                        channel === 'email'
                          ? 'border-navy bg-navy text-white'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      <Mail size={20} />
                      <span className="text-sm lg:text-base">Email</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Message (Optional)
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Leave empty to use default prayer message..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent"
                    rows={6}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use {"{name}"} placeholder to insert the member/family name
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  <Button
                    variant="primary"
                    onClick={handleSendPrayer}
                    disabled={sending || !canSendPrayer}
                    className="flex items-center justify-center gap-2 w-full sm:w-auto"
                  >
                    <Send size={20} />
                    {sending 
                      ? 'Sending...' 
                      : !canSendPrayer 
                      ? 'All Sends Used (2/2)' 
                      : `Send Prayer (${remainingSends} remaining)`}
                  </Button>
                  {prayerSentCount > 0 && (
                    <div className="flex items-center gap-2 text-green-600 text-sm lg:text-base">
                      <span>✓</span>
                      <span>Prayer sent {prayerSentCount} time{prayerSentCount > 1 ? 's' : ''} this week</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </>
        ) : (
          <Card>
            <p className="text-center text-gray-500 py-8">
              No member or family selected for this week. The selection will be created automatically.
            </p>
            <div className="text-center">
              <Button variant="primary" onClick={fetchSelection}>
                Create Selection
              </Button>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

