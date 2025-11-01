'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';

export default function EditMemberPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    fullName: '',
    gender: 'Male',
    dateOfBirth: '',
    phone: '',
    email: '',
    address: '',
    ministry: '',
    membershipStatus: 'Active',
    profileImage: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    fetchDepartments();
    if (params.id) {
      fetchMember(params.id as string);
    }
  }, [params.id]);

  const fetchMember = async (id: string) => {
    try {
      const res = await fetch(`/api/members/${id}`);
      const data = await res.json();
      const member = data.member;
      
      setFormData({
        fullName: member.fullName,
        gender: member.gender,
        dateOfBirth: formatDateForInput(member.dateOfBirth),
        phone: member.phone,
        email: member.email || '',
        address: member.address,
        ministry: member.ministry || '',
        membershipStatus: member.membershipStatus,
        profileImage: member.profileImage || '',
      });
      
      if (member.profileImage) {
        setImagePreview(member.profileImage);
      }
    } catch (error) {
      console.error('Failed to fetch member:', error);
    }
  };

  const formatDateForInput = (date: string | Date) => {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  const fetchDepartments = async () => {
    try {
      const res = await fetch('/api/departments');
      const data = await res.json();
      setDepartments(data.departments || []);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (): Promise<string | undefined> => {
    if (!imageFile) return undefined;

    try {
      const formData = new FormData();
      formData.append('file', imageFile);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      return data.url;
    } catch (error) {
      console.error('Failed to upload image:', error);
      return undefined;
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let profileImageUrl = formData.profileImage;
      if (imageFile) {
        const url = await uploadImage();
        if (url) profileImageUrl = url;
      }

      const memberData = {
        ...formData,
        dateOfBirth: new Date(formData.dateOfBirth),
        profileImage: profileImageUrl || undefined,
      };

      const res = await fetch(`/api/members/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memberData),
      });

      if (!res.ok) {
        throw new Error('Failed to update member');
      }

      router.push(`/members/${params.id}`);
    } catch (error) {
      console.error('Error updating member:', error);
      alert('Failed to update member. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-navy">Edit Member</h1>

        <form onSubmit={handleSubmit}>
          <Card>
            <div className="space-y-6">
              {/* Profile Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Photo
                </label>
                <div className="flex items-center gap-4">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">No Image</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="text-sm"
                  />
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Full Name *"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
                <Select
                  label="Gender *"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  options={[
                    { value: 'Male', label: 'Male' },
                    { value: 'Female', label: 'Female' },
                  ]}
                />
                <Input
                  label="Date of Birth *"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  required
                />
                <Input
                  label="Phone *"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                <Select
                  label="Membership Status *"
                  value={formData.membershipStatus}
                  onChange={(e) => setFormData({ ...formData, membershipStatus: e.target.value })}
                  options={[
                    { value: 'Active', label: 'Active' },
                    { value: 'Inactive', label: 'Inactive' },
                    { value: 'Visitor', label: 'Visitor' },
                  ]}
                />
              </div>

              <Input
                label="Address *"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />

              <Select
                label="Ministry/Department"
                value={formData.ministry}
                onChange={(e) => setFormData({ ...formData, ministry: e.target.value })}
                options={[
                  { value: '', label: 'None' },
                  ...departments.map((dept) => ({
                    value: dept.name,
                    label: dept.name,
                  })),
                ]}
              />

              <div className="flex gap-4 pt-4">
                <Button type="submit" variant="primary" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Member'}
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


