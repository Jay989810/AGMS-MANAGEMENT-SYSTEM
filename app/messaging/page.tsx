'use client';

import { useState, FormEvent, useEffect } from 'react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { Mail, Send, Search, X } from 'lucide-react';

interface Member {
  _id: string;
  fullName: string;
  phone?: string;
  email?: string;
  membershipStatus: string;
}

interface Family {
  _id: string;
  familyName: string;
  headOfFamily?: {
    fullName: string;
  };
  members?: Member[];
}

export default function MessagingPage() {
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [families, setFamilies] = useState<Family[]>([]);
  const [searchMemberQuery, setSearchMemberQuery] = useState('');
  const [searchFamilyQuery, setSearchFamilyQuery] = useState('');
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [filteredFamilies, setFilteredFamilies] = useState<Family[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectedFamilies, setSelectedFamilies] = useState<string[]>([]);
  const [recipientType, setRecipientType] = useState<'all' | 'active' | 'inactive' | 'visitors' | 'members' | 'families'>('all');
  
  const [formData, setFormData] = useState({
    type: 'broadcast',
    recipients: 'all' as any,
    channel: 'sms', // email, sms, whatsapp (default to SMS for Nigeria)
    subject: '',
    message: '',
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ sent: number; failed: number; total: number } | null>(null);

  useEffect(() => {
    fetchMembers();
    fetchFamilies();
  }, []);

  useEffect(() => {
    if (searchMemberQuery) {
      const filtered = members.filter(m => 
        m.fullName.toLowerCase().includes(searchMemberQuery.toLowerCase()) ||
        m.phone?.includes(searchMemberQuery) ||
        m.email?.toLowerCase().includes(searchMemberQuery.toLowerCase())
      );
      setFilteredMembers(filtered.slice(0, 10)); // Limit to 10 results
    } else {
      setFilteredMembers([]);
    }
  }, [searchMemberQuery, members]);

  useEffect(() => {
    if (searchFamilyQuery) {
      const filtered = families.filter(f => 
        f.familyName.toLowerCase().includes(searchFamilyQuery.toLowerCase()) ||
        f.headOfFamily?.fullName.toLowerCase().includes(searchFamilyQuery.toLowerCase())
      );
      setFilteredFamilies(filtered.slice(0, 10)); // Limit to 10 results
    } else {
      setFilteredFamilies([]);
    }
  }, [searchFamilyQuery, families]);

  const fetchMembers = async () => {
    try {
      const res = await fetch('/api/members');
      const data = await res.json();
      setMembers(data.members || []);
    } catch (error) {
      console.error('Failed to fetch members:', error);
    }
  };

  const fetchFamilies = async () => {
    try {
      const res = await fetch('/api/families');
      const data = await res.json();
      setFamilies(data.families || []);
    } catch (error) {
      console.error('Failed to fetch families:', error);
    }
  };

  const handleRecipientTypeChange = (type: string) => {
    setRecipientType(type as any);
    setSelectedMembers([]);
    setSelectedFamilies([]);
    setSearchMemberQuery('');
    setSearchFamilyQuery('');
    
    if (type === 'all' || type === 'active' || type === 'inactive' || type === 'visitors') {
      setFormData({ ...formData, recipients: type });
    } else {
      setFormData({ ...formData, recipients: { type, ids: [] } });
    }
  };

  const addMember = (memberId: string) => {
    if (!selectedMembers.includes(memberId)) {
      const newSelected = [...selectedMembers, memberId];
      setSelectedMembers(newSelected);
      setFormData({ ...formData, recipients: { type: 'members', ids: newSelected } });
      setSearchMemberQuery('');
      setFilteredMembers([]);
    }
  };

  const removeMember = (memberId: string) => {
    const newSelected = selectedMembers.filter(id => id !== memberId);
    setSelectedMembers(newSelected);
    setFormData({ ...formData, recipients: { type: 'members', ids: newSelected } });
  };

  const addFamily = (familyId: string) => {
    if (!selectedFamilies.includes(familyId)) {
      const newSelected = [...selectedFamilies, familyId];
      setSelectedFamilies(newSelected);
      setFormData({ ...formData, recipients: { type: 'families', ids: newSelected } });
      setSearchFamilyQuery('');
      setFilteredFamilies([]);
    }
  };

  const removeFamily = (familyId: string) => {
    const newSelected = selectedFamilies.filter(id => id !== familyId);
    setSelectedFamilies(newSelected);
    setFormData({ ...formData, recipients: { type: 'families', ids: newSelected } });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    
    // Validate selections
    if (recipientType === 'members' && selectedMembers.length === 0) {
      setError('Please select at least one member');
      setLoading(false);
      return;
    }
    
    if (recipientType === 'families' && selectedFamilies.length === 0) {
      setError('Please select at least one family');
      setLoading(false);
      return;
    }

    // Prepare recipients based on type
    let recipientsToSend: any;
    if (recipientType === 'all' || recipientType === 'active' || recipientType === 'inactive' || recipientType === 'visitors') {
      recipientsToSend = recipientType;
    } else if (recipientType === 'members') {
      recipientsToSend = { type: 'members', ids: selectedMembers };
    } else if (recipientType === 'families') {
      recipientsToSend = { type: 'families', ids: selectedFamilies };
    } else {
      recipientsToSend = 'all';
    }

    try {
      const res = await fetch('/api/messaging/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          recipients: recipientsToSend,
        }),
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.errorMessage || 'Failed to send message');
      }

      // Show error message if there were failures
      if (data.errorMessage && data.failed > 0) {
        setError(data.errorMessage);
      } else {
        setSuccess(data.message || 'Message sent successfully!');
      }
      
      setResult({
        sent: data.sent || 0,
        failed: data.failed || 0,
        total: data.total || 0,
      });
      
      // Log errors to console for debugging
      if (data.errors && data.errors.length > 0) {
        console.error('SMS Errors:', data.errors);
      }
      setFormData({
        type: 'broadcast',
        recipients: recipientType === 'all' || recipientType === 'active' || recipientType === 'inactive' || recipientType === 'visitors' 
          ? recipientType 
          : { type: recipientType, ids: [] },
        channel: formData.channel,
        subject: '',
        message: '',
      });
      setSelectedMembers([]);
      setSelectedFamilies([]);
      setRecipientType('all');
    } catch (error: any) {
      setError(error.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-4 lg:space-y-6">
        <div className="flex items-center gap-3">
          <Mail className="text-navy" size={24} />
          <h1 className="text-2xl lg:text-3xl font-bold text-navy">Messaging</h1>
        </div>

        <Card>
          <p className="text-gray-600 mb-6">
            Send broadcast messages to church members via Email, SMS, or WhatsApp. Use this for announcements, reminders, or special messages.
          </p>

          {error && (
            <div className="mb-6 p-4 border border-red-200 bg-red-50 text-red-700 rounded-lg">
              <p className="font-semibold">{error}</p>
            </div>
          )}

          {success && (
            <div className={`mb-6 p-4 border rounded-lg ${
              result && result.failed > 0
                ? 'bg-yellow-50 border-yellow-200 text-yellow-700'
                : 'bg-green-50 border-green-200 text-green-700'
            }`}>
              <p className="font-semibold">{success}</p>
              {result && (
                <p className="text-sm mt-1">
                  Successfully sent: {result.sent} | Failed: {result.failed} | Total: {result.total}
                </p>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Select
              label="Channel *"
              value={formData.channel}
              onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
              options={[
                { value: 'sms', label: '📱 SMS (Recommended for Nigeria)' },
                { value: 'email', label: '📧 Email' },
                { value: 'whatsapp', label: '💬 WhatsApp' },
              ]}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipients *
              </label>
              <Select
                value={recipientType}
                onChange={(e) => handleRecipientTypeChange(e.target.value)}
                options={[
                  { value: 'all', label: 'All Members' },
                  { value: 'active', label: 'Active Members Only' },
                  { value: 'inactive', label: 'Inactive Members Only' },
                  { value: 'visitors', label: 'Visitors Only' },
                  { value: 'members', label: 'Select Specific Members' },
                  { value: 'families', label: 'Select Specific Families' },
                ]}
              />
            </div>

            {/* Specific Members Selection */}
            {recipientType === 'members' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search and Select Members
                </label>
                <div className="relative">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        value={searchMemberQuery}
                        onChange={(e) => setSearchMemberQuery(e.target.value)}
                        placeholder="Search by name, phone, or email..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                      />
                    </div>
                  </div>
                  
                  {filteredMembers.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredMembers.map((member) => (
                        <div
                          key={member._id}
                          onClick={() => addMember(member._id)}
                          className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                        >
                          <div className="font-medium text-gray-900">{member.fullName}</div>
                          <div className="text-sm text-gray-500">
                            {member.phone && `📱 ${member.phone}`}
                            {member.phone && member.email && ' • '}
                            {member.email && `📧 ${member.email}`}
                            {member.membershipStatus && ` • ${member.membershipStatus}`}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedMembers.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <div className="text-sm font-medium text-gray-700">
                        Selected Members ({selectedMembers.length}):
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedMembers.map((memberId) => {
                          const member = members.find(m => m._id === memberId);
                          if (!member) return null;
                          return (
                            <div
                              key={memberId}
                              className="flex items-center gap-2 bg-navy text-white px-3 py-1 rounded-full text-sm"
                            >
                              <span>{member.fullName}</span>
                              <button
                                type="button"
                                onClick={() => removeMember(memberId)}
                                className="hover:text-red-200"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Specific Families Selection */}
            {recipientType === 'families' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search and Select Families
                </label>
                <div className="relative">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        value={searchFamilyQuery}
                        onChange={(e) => setSearchFamilyQuery(e.target.value)}
                        placeholder="Search by family name..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                      />
                    </div>
                  </div>
                  
                  {filteredFamilies.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredFamilies.map((family) => (
                        <div
                          key={family._id}
                          onClick={() => addFamily(family._id)}
                          className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                        >
                          <div className="font-medium text-gray-900">{family.familyName}</div>
                          <div className="text-sm text-gray-500">
                            {family.headOfFamily?.fullName && `Head: ${family.headOfFamily.fullName}`}
                            {family.members && ` • ${family.members.length} member(s)`}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedFamilies.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <div className="text-sm font-medium text-gray-700">
                        Selected Families ({selectedFamilies.length}):
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedFamilies.map((familyId) => {
                          const family = families.find(f => f._id === familyId);
                          if (!family) return null;
                          return (
                            <div
                              key={familyId}
                              className="flex items-center gap-2 bg-navy text-white px-3 py-1 rounded-full text-sm"
                            >
                              <span>{family.familyName}</span>
                              <button
                                type="button"
                                onClick={() => removeFamily(familyId)}
                                className="hover:text-red-200"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Subject field only for Email - SMS and WhatsApp don't use subject */}
            {formData.channel === 'email' && (
              <Input
                label="Subject *"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="e.g., Weekly Announcements"
                required
              />
            )}

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
                {formData.channel === 'email' 
                  ? 'You can use HTML tags for formatting. Line breaks will be converted to <br> tags.'
                  : formData.channel === 'sms'
                  ? 'SMS messages are limited to 160 characters. Longer messages may be split.'
                  : 'WhatsApp supports longer messages with basic formatting.'}
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <Send size={20} />
                {loading ? 'Sending...' : 'Send Message'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}


