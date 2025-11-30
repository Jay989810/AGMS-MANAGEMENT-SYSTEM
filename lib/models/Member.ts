import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMember extends Document {
  fullName: string;
  gender: 'Male' | 'Female';
  dateOfBirth: Date;
  phone: string;
  email?: string;
  address: string;
  ministry?: string;
  membershipStatus: 'Active' | 'Inactive' | 'Visitor';
  maritalStatus: 'Single' | 'Married';
  lifeStatus: 'Alive' | 'Deceased';
  familyId?: mongoose.Types.ObjectId;
  relationship?: string; // e.g., 'Head', 'Spouse', 'Child', 'Parent'
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MemberSchema: Schema = new Schema<IMember>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female'],
      required: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    address: {
      type: String,
      required: true,
    },
    ministry: {
      type: String,
      trim: true,
    },
    membershipStatus: {
      type: String,
      enum: ['Active', 'Inactive', 'Visitor'],
      default: 'Active',
    },
    maritalStatus: {
      type: String,
      enum: ['Single', 'Married'],
      default: 'Single',
    },
    lifeStatus: {
      type: String,
      enum: ['Alive', 'Deceased'],
      default: 'Alive',
    },
    familyId: {
      type: Schema.Types.ObjectId,
      ref: 'Family',
      default: null,
    },
    relationship: {
      type: String,
      trim: true,
    },
    profileImage: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for better query performance
MemberSchema.index({ fullName: 1 });
MemberSchema.index({ email: 1 });
MemberSchema.index({ phone: 1 });
MemberSchema.index({ ministry: 1 });
MemberSchema.index({ membershipStatus: 1 });
MemberSchema.index({ familyId: 1 });
MemberSchema.index({ lifeStatus: 1 });
MemberSchema.index({ createdAt: -1 });
MemberSchema.index({ dateOfBirth: 1 });

const Member: Model<IMember> = mongoose.models.Member || mongoose.model<IMember>('Member', MemberSchema);

export default Member;


