'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Plus, Search, Edit, Trash2, Eye, Upload, Download, ChevronDown, ChevronRight, Users } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { exportToCSV } from '@/lib/exportToCSV';
import Toast from '@/components/ui/Toast';
import { format } from 'date-fns';

interface GroupedMembers {
  families: { [key: string]: { family: any; members: any[] } };
  individuals: any[];
}

export default function MembersPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [families, setFamilies] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [ministryFilter, setMinistryFilter] = useState('');
  const [expandedFamilies, setExpandedFamilies] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; isVisible: boolean }>({
    message: '',
    type: 'info',
    isVisible: false,
  });

  useEffect(() => {
    fetchMembers();
    fetchFamilies();
    fetchDepartments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, ministryFilter]);

  const fetchMembers = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (ministryFilter) params.append('ministry', ministryFilter);
      
      const res = await fetch(`/api/members?${params}`, {
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

  const fetchFamilies = async () => {
    try {
      const res = await fetch('/api/families', {
        credentials: 'include',
      });
      const data = await res.json();
      setFamilies(data.families || []);
    } catch (error) {
      console.error('Failed to fetch families:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await fetch('/api/departments', {
        credentials: 'include',
      });
      const data = await res.json();
      setDepartments(data.departments || []);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    }
  };

  const toggleFamily = (familyId: string) => {
    const newExpanded = new Set(expandedFamilies);
    if (newExpanded.has(familyId)) {
      newExpanded.delete(familyId);
    } else {
      newExpanded.add(familyId);
    }
    setExpandedFamilies(newExpanded);
  };

  const groupMembersByFamily = (): GroupedMembers => {
    const grouped: GroupedMembers = {
      families: {},
      individuals: [],
    };

    // Create a map of familyId to family object
    const familyMap = new Map();
    families.forEach(family => {
      familyMap.set(family._id.toString(), family);
    });

    // Group members by family
    members.forEach(member => {
      if (member.familyId) {
        const familyId = member.familyId.toString();
        if (!grouped.families[familyId]) {
          const family = familyMap.get(familyId);
          grouped.families[familyId] = {
            family: family || { familyName: 'Unknown Family', _id: familyId },
            members: [],
          };
        }
        grouped.families[familyId].members.push(member);
      } else {
        grouped.individuals.push(member);
      }
    });

    return grouped;
  };

  const groupedData = groupMembersByFamily();

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this member?')) return;

    try {
      const res = await fetch(`/api/members/${id}`, { 
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        // Update UI immediately
        setMembers(members.filter(m => m._id !== id));
        setToast({ message: 'Member deleted successfully', type: 'success', isVisible: true });
        // Refresh to ensure consistency
        fetchMembers();
      } else {
        setToast({ message: 'Failed to delete member', type: 'error', isVisible: true });
      }
    } catch (error) {
      console.error('Failed to delete member:', error);
      setToast({ message: 'Failed to delete member', type: 'error', isVisible: true });
    }
  };

  const handleExportCSV = () => {
    if (members.length === 0) {
      setToast({ message: 'No records available for export', type: 'error', isVisible: true });
      return;
    }

    try {
      const exportData = members.map((member) => ({
        Name: member.fullName,
        Gender: member.gender,
        'Date of Birth': format(new Date(member.dateOfBirth), 'yyyy-MM-dd'),
        Phone: member.phone,
        Email: member.email || '',
        'Marital Status': member.maritalStatus || 'Single',
        'Life Status': member.lifeStatus || 'Alive',
        Address: member.address || '',
        Department: member.ministry || 'N/A',
        'Membership Status': member.membershipStatus,
      }));

      exportToCSV(exportData, 'members');
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
          <h1 className="text-2xl lg:text-3xl font-bold text-navy">Members</h1>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {members.length > 0 && (
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
            <Link href="/members/new" className="w-full sm:w-auto">
              <Button variant="primary" className="flex items-center justify-center gap-2 w-full sm:w-auto">
                <Plus size={20} />
                Add Member
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                placeholder="Search by name, email, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={ministryFilter}
              onChange={(e) => setMinistryFilter(e.target.value)}
              className="input"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept.name}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
        </Card>

        {/* Members List */}
        <Card>
          {members.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No members found</p>
              <Link href="/members/new">
                <Button variant="primary">Add First Member</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-700 text-sm w-8"></th>
                    <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-700 text-sm">Photo</th>
                    <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-700 text-sm">Name</th>
                    <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-700 text-sm hidden md:table-cell">Gender</th>
                    <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-700 text-sm hidden lg:table-cell">Phone</th>
                    <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-700 text-sm hidden md:table-cell">Department</th>
                    <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-700 text-sm">Status</th>
                    <th className="text-right py-3 px-2 sm:px-4 font-semibold text-gray-700 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Render Families */}
                  {Object.values(groupedData.families).map(({ family, members: familyMembers }) => {
                    const isExpanded = expandedFamilies.has(family._id?.toString() || '');
                    const headOfFamily = familyMembers.find((m: any) => m.relationship === 'Head') || familyMembers[0];
                    
                    return (
                      <React.Fragment key={family._id?.toString() || 'unknown'}>
                        {/* Family Header Row */}
                        <tr className="border-b border-gray-200 bg-navy/5 hover:bg-navy/10 cursor-pointer" onClick={() => toggleFamily(family._id?.toString() || '')}>
                          <td className="py-3 px-2 sm:px-4">
                            {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                          </td>
                          <td className="py-3 px-2 sm:px-4">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-navy flex items-center justify-center text-white">
                              <Users size={16} />
                            </div>
                          </td>
                          <td className="py-3 px-2 sm:px-4 font-semibold text-sm">
                            <div className="flex flex-col">
                              <span className="text-navy">{family.familyName || 'Family'}</span>
                              <span className="text-xs text-gray-500 font-normal">{familyMembers.length} member{familyMembers.length !== 1 ? 's' : ''}</span>
                              {headOfFamily && (
                                <span className="text-xs text-gray-500 md:hidden font-normal">{headOfFamily.gender} • {headOfFamily.phone}</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-2 sm:px-4 text-gray-600 text-sm hidden md:table-cell">
                            {headOfFamily?.gender || '-'}
                          </td>
                          <td className="py-3 px-2 sm:px-4 text-gray-600 text-sm hidden lg:table-cell">
                            {headOfFamily?.phone || family.phone || '-'}
                          </td>
                          <td className="py-3 px-2 sm:px-4 text-gray-600 text-sm hidden md:table-cell">-</td>
                          <td className="py-3 px-2 sm:px-4">-</td>
                          <td className="py-3 px-2 sm:px-4">
                            <div className="flex items-center justify-end gap-1 sm:gap-2">
                              <Link href={`/members/${headOfFamily?._id || ''}`} onClick={(e) => e.stopPropagation()}>
                                <Button variant="secondary" className="p-1.5 sm:p-2">
                                  <Eye size={14} className="sm:w-4 sm:h-4" />
                                </Button>
                              </Link>
                            </div>
                          </td>
                        </tr>
                        
                        {/* Family Members (when expanded) */}
                        {isExpanded && familyMembers.map((member: any) => (
                          <tr key={member._id} className="border-b border-gray-100 hover:bg-gray-50 bg-gray-50/50">
                            <td className="py-3 px-2 sm:px-4"></td>
                            <td className="py-3 px-2 sm:px-4 pl-6">
                              {member.profileImage ? (
                                <Image
                                  src={member.profileImage}
                                  alt={member.fullName}
                                  width={40}
                                  height={40}
                                  className="rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-navy flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
                                  {member.fullName.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-2 sm:px-4 font-medium text-sm pl-6">
                              <div className="flex flex-col">
                                <span>{member.fullName}</span>
                                <span className="text-xs text-gray-500">{member.relationship || 'Member'}</span>
                                <span className="text-xs text-gray-500 md:hidden">{member.gender} • {member.phone}</span>
                                <span className="text-xs text-gray-500 lg:hidden md:inline">{member.phone}</span>
                              </div>
                            </td>
                            <td className="py-3 px-2 sm:px-4 text-gray-600 text-sm hidden md:table-cell">{member.gender}</td>
                            <td className="py-3 px-2 sm:px-4 text-gray-600 text-sm hidden lg:table-cell">{member.phone}</td>
                            <td className="py-3 px-2 sm:px-4 text-gray-600 text-sm hidden md:table-cell">{member.ministry || 'N/A'}</td>
                            <td className="py-3 px-2 sm:px-4">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  member.membershipStatus === 'Active'
                                    ? 'bg-green-100 text-green-800'
                                    : member.membershipStatus === 'Inactive'
                                    ? 'bg-gray-100 text-gray-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}
                              >
                                {member.membershipStatus}
                              </span>
                            </td>
                            <td className="py-3 px-2 sm:px-4">
                              <div className="flex items-center justify-end gap-1 sm:gap-2">
                                <Link href={`/members/${member._id}`}>
                                  <Button variant="secondary" className="p-1.5 sm:p-2">
                                    <Eye size={14} className="sm:w-4 sm:h-4" />
                                  </Button>
                                </Link>
                                <Link href={`/members/${member._id}/edit`}>
                                  <Button variant="secondary" className="p-1.5 sm:p-2">
                                    <Edit size={14} className="sm:w-4 sm:h-4" />
                                  </Button>
                                </Link>
                                <Button
                                  variant="danger"
                                  className="p-1.5 sm:p-2"
                                  onClick={() => handleDelete(member._id)}
                                >
                                  <Trash2 size={14} className="sm:w-4 sm:h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                  })}
                  
                  {/* Render Individual Members (no family) */}
                  {groupedData.individuals.map((member) => (
                    <tr key={member._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-2 sm:px-4"></td>
                      <td className="py-3 px-2 sm:px-4">
                        {member.profileImage ? (
                          <Image
                            src={member.profileImage}
                            alt={member.fullName}
                            width={40}
                            height={40}
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-navy flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
                            {member.fullName.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-2 sm:px-4 font-medium text-sm">
                        <div className="flex flex-col">
                          <span>{member.fullName}</span>
                          <span className="text-xs text-gray-500 md:hidden">{member.gender} • {member.phone}</span>
                          <span className="text-xs text-gray-500 lg:hidden md:inline">{member.phone}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-gray-600 text-sm hidden md:table-cell">{member.gender}</td>
                      <td className="py-3 px-2 sm:px-4 text-gray-600 text-sm hidden lg:table-cell">{member.phone}</td>
                      <td className="py-3 px-2 sm:px-4 text-gray-600 text-sm hidden md:table-cell">{member.ministry || 'N/A'}</td>
                      <td className="py-3 px-2 sm:px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            member.membershipStatus === 'Active'
                              ? 'bg-green-100 text-green-800'
                              : member.membershipStatus === 'Inactive'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {member.membershipStatus}
                        </span>
                      </td>
                      <td className="py-3 px-2 sm:px-4">
                        <div className="flex items-center justify-end gap-1 sm:gap-2">
                          <Link href={`/members/${member._id}`}>
                            <Button variant="secondary" className="p-1.5 sm:p-2">
                              <Eye size={14} className="sm:w-4 sm:h-4" />
                            </Button>
                          </Link>
                          <Link href={`/members/${member._id}/edit`}>
                            <Button variant="secondary" className="p-1.5 sm:p-2">
                              <Edit size={14} className="sm:w-4 sm:h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="danger"
                            className="p-1.5 sm:p-2"
                            onClick={() => handleDelete(member._id)}
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


