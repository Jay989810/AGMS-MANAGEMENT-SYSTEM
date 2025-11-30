'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';

interface FamilyMember {
  fullName: string;
  gender: 'Male' | 'Female';
  dateOfBirth: string;
  phone: string;
  email: string;
  relationship: string;
  ministry: string;
  membershipStatus: 'Active' | 'Inactive' | 'Visitor';
  lifeStatus: 'Alive' | 'Deceased';
  maritalStatus: 'Single' | 'Married';
}

export default function NewMemberPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [isFamily, setIsFamily] = useState(false);
  const [familyName, setFamilyName] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    gender: 'Male' as 'Male' | 'Female',
    dateOfBirth: '',
    phone: '',
    email: '',
    address: '',
    ministry: '',
    membershipStatus: 'Active' as 'Active' | 'Inactive' | 'Visitor',
    maritalStatus: 'Single' as 'Single' | 'Married',
    lifeStatus: 'Alive' as 'Alive' | 'Deceased',
    relationship: 'Head',
    profileImage: '',
  });
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    fetchDepartments();
  }, []);

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

  const addFamilyMember = () => {
    setFamilyMembers([
      ...familyMembers,
      {
        fullName: '',
        gender: 'Male',
        dateOfBirth: '',
        phone: '',
        email: '',
        relationship: 'Child',
        ministry: '',
        membershipStatus: 'Active',
        lifeStatus: 'Alive',
        maritalStatus: 'Single',
      },
    ]);
  };

  const removeFamilyMember = (index: number) => {
    setFamilyMembers(familyMembers.filter((_, i) => i !== index));
  };

  const updateFamilyMember = (index: number, field: keyof FamilyMember, value: any) => {
    const updated = [...familyMembers];
    updated[index] = { ...updated[index], [field]: value };
    setFamilyMembers(updated);
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

      if (isFamily) {
        // Create family with multiple members
        const familyData = {
          familyName: familyName || formData.fullName + ' Family',
          address: formData.address,
          phone: formData.phone,
          email: formData.email,
          headOfFamily: {
            ...formData,
            dateOfBirth: new Date(formData.dateOfBirth),
            profileImage: profileImageUrl || undefined,
            relationship: 'Head',
          },
          members: familyMembers.map((member) => ({
            ...member,
            dateOfBirth: new Date(member.dateOfBirth),
            address: formData.address, // Use family address
          })),
        };

        const res = await fetch('/api/members/family', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(familyData),
        });

        if (!res.ok) {
          throw new Error('Failed to create family');
        }
      } else {
        // Create single member
        const memberData = {
          ...formData,
          dateOfBirth: new Date(formData.dateOfBirth),
          profileImage: profileImageUrl || undefined,
        };

        const res = await fetch('/api/members', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(memberData),
        });

        if (!res.ok) {
          throw new Error('Failed to create member');
        }
      }

      // Redirect and refresh
      router.push('/members');
      router.refresh();
    } catch (error) {
      console.error('Error creating member:', error);
      alert('Failed to create member. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-4 lg:space-y-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-navy">Add New Member</h1>

        <form onSubmit={handleSubmit}>
          <Card>
            <div className="space-y-4 lg:space-y-6">
              {/* Registration Type */}
              <div className="border-b pb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registration Type *
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="registrationType"
                      checked={!isFamily}
                      onChange={() => setIsFamily(false)}
                      className="mr-2"
                    />
                    Single Member
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="registrationType"
                      checked={isFamily}
                      onChange={() => setIsFamily(true)}
                      className="mr-2"
                    />
                    Family (Multiple Members)
                  </label>
                </div>
              </div>

              {/* Family Name (if family) */}
              {isFamily && (
                <Input
                  label="Family Name *"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  placeholder="e.g., Smith Family"
                  required={isFamily}
                />
              )}

              {/* Head of Family / Primary Member */}
              <div className="border-t pt-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  {isFamily ? 'Head of Family' : 'Member Information'}
                </h2>

                {/* Profile Image */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Photo
                  </label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    {imagePreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-xs sm:text-sm">No Image</span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="text-sm w-full sm:w-auto"
                    />
                  </div>
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Full Name *"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                  />
                  <Select
                    label="Gender *"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'Male' | 'Female' })}
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
                    label="Marital Status *"
                    value={formData.maritalStatus}
                    onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value as 'Single' | 'Married' })}
                    options={[
                      { value: 'Single', label: 'Single' },
                      { value: 'Married', label: 'Married' },
                    ]}
                  />
                  <Select
                    label="Life Status *"
                    value={formData.lifeStatus}
                    onChange={(e) => setFormData({ ...formData, lifeStatus: e.target.value as 'Alive' | 'Deceased' })}
                    options={[
                      { value: 'Alive', label: 'Alive' },
                      { value: 'Deceased', label: 'Deceased / Demise' },
                    ]}
                  />
                  <Select
                    label="Membership Status *"
                    value={formData.membershipStatus}
                    onChange={(e) => setFormData({ ...formData, membershipStatus: e.target.value as 'Active' | 'Inactive' | 'Visitor' })}
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
              </div>

              {/* Family Members Section */}
              {isFamily && (
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">Family Members</h2>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={addFamilyMember}
                    >
                      + Add Member
                    </Button>
                  </div>

                  {familyMembers.map((member, index) => (
                    <Card key={index} className="mb-4 bg-gray-50">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-md font-medium text-gray-700">
                          Family Member {index + 1}
                        </h3>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => removeFamilyMember(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Remove
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          label="Full Name *"
                          value={member.fullName}
                          onChange={(e) => updateFamilyMember(index, 'fullName', e.target.value)}
                          required
                        />
                        <Select
                          label="Gender *"
                          value={member.gender}
                          onChange={(e) => updateFamilyMember(index, 'gender', e.target.value)}
                          options={[
                            { value: 'Male', label: 'Male' },
                            { value: 'Female', label: 'Female' },
                          ]}
                        />
                        <Input
                          label="Date of Birth *"
                          type="date"
                          value={member.dateOfBirth}
                          onChange={(e) => updateFamilyMember(index, 'dateOfBirth', e.target.value)}
                          required
                        />
                        <Input
                          label="Phone"
                          value={member.phone}
                          onChange={(e) => updateFamilyMember(index, 'phone', e.target.value)}
                        />
                        <Input
                          label="Email"
                          type="email"
                          value={member.email}
                          onChange={(e) => updateFamilyMember(index, 'email', e.target.value)}
                        />
                        <Select
                          label="Relationship *"
                          value={member.relationship}
                          onChange={(e) => updateFamilyMember(index, 'relationship', e.target.value)}
                          options={[
                            { value: 'Spouse', label: 'Spouse' },
                            { value: 'Child', label: 'Child' },
                            { value: 'Parent', label: 'Parent' },
                            { value: 'Sibling', label: 'Sibling' },
                            { value: 'Other', label: 'Other' },
                          ]}
                        />
                        <Select
                          label="Marital Status *"
                          value={member.maritalStatus}
                          onChange={(e) => updateFamilyMember(index, 'maritalStatus', e.target.value)}
                          options={[
                            { value: 'Single', label: 'Single' },
                            { value: 'Married', label: 'Married' },
                          ]}
                        />
                        <Select
                          label="Life Status *"
                          value={member.lifeStatus}
                          onChange={(e) => updateFamilyMember(index, 'lifeStatus', e.target.value)}
                          options={[
                            { value: 'Alive', label: 'Alive' },
                            { value: 'Deceased', label: 'Deceased / Demise' },
                          ]}
                        />
                        <Select
                          label="Membership Status *"
                          value={member.membershipStatus}
                          onChange={(e) => updateFamilyMember(index, 'membershipStatus', e.target.value)}
                          options={[
                            { value: 'Active', label: 'Active' },
                            { value: 'Inactive', label: 'Inactive' },
                            { value: 'Visitor', label: 'Visitor' },
                          ]}
                        />
                        <Select
                          label="Ministry/Department"
                          value={member.ministry}
                          onChange={(e) => updateFamilyMember(index, 'ministry', e.target.value)}
                          options={[
                            { value: '', label: 'None' },
                            ...departments.map((dept) => ({
                              value: dept.name,
                              label: dept.name,
                            })),
                          ]}
                        />
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <Button type="submit" variant="primary" disabled={loading}>
                  {loading ? 'Creating...' : isFamily ? 'Create Family' : 'Create Member'}
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
