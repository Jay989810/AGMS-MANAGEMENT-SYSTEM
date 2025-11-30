'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Edit, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';

export default function MemberDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchMember(params.id as string);
    }
  }, [params.id]);

  const fetchMember = async (id: string) => {
    try {
      const res = await fetch(`/api/members/${id}`);
      const data = await res.json();
      setMember(data.member);
    } catch (error) {
      console.error('Failed to fetch member:', error);
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

  if (!member) {
    return (
      <DashboardLayout>
        <Card>
          <p className="text-gray-500">Member not found</p>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-4 lg:space-y-6 px-4 sm:px-0">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
          <Button variant="secondary" onClick={() => router.back()} className="flex items-center justify-center gap-2 w-full sm:w-auto">
            <ArrowLeft size={20} />
            Back
          </Button>
          <Link href={`/members/${member._id}/edit`} className="w-full sm:w-auto">
            <Button variant="primary" className="flex items-center justify-center gap-2 w-full sm:w-auto">
              <Edit size={20} />
              Edit Member
            </Button>
          </Link>
        </div>

        <Card>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              {member.profileImage ? (
                <Image
                  src={member.profileImage}
                  alt={member.fullName}
                  width={200}
                  height={200}
                  className="rounded-lg object-cover"
                />
              ) : (
                <div className="w-48 h-48 rounded-lg bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-lg">
                    {member.fullName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-navy">{member.fullName}</h2>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      member.membershipStatus === 'Active'
                        ? 'bg-green-100 text-green-800'
                        : member.membershipStatus === 'Inactive'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {member.membershipStatus}
                  </span>
                  {member.maritalStatus && (
                    <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {member.maritalStatus}
                    </span>
                  )}
                  {member.lifeStatus && (
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        member.lifeStatus === 'Alive'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {member.lifeStatus === 'Deceased' ? 'Deceased' : member.lifeStatus}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="font-medium">{member.gender}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date of Birth</p>
                  <p className="font-medium">
                    {format(new Date(member.dateOfBirth), 'MMMM dd, yyyy')}
                  </p>
                </div>
                {member.maritalStatus && (
                  <div>
                    <p className="text-sm text-gray-500">Marital Status</p>
                    <p className="font-medium">{member.maritalStatus}</p>
                  </div>
                )}
                {member.lifeStatus && (
                  <div>
                    <p className="text-sm text-gray-500">Life Status</p>
                    <p className={`font-medium ${member.lifeStatus === 'Deceased' ? 'text-red-600' : ''}`}>
                      {member.lifeStatus === 'Deceased' ? 'Deceased / Demise' : member.lifeStatus}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{member.phone}</p>
                </div>
                {member.email && (
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{member.email}</p>
                  </div>
                )}
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">{member.address}</p>
                </div>
                {member.ministry && (
                  <div>
                    <p className="text-sm text-gray-500">Ministry/Department</p>
                    <p className="font-medium">{member.ministry}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}


