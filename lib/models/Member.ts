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
MemberSchema.index({ createdAt: -1 });
MemberSchema.index({ dateOfBirth: 1 });

const Member: Model<IMember> = mongoose.models.Member || mongoose.model<IMember>('Member', MemberSchema);

export default Member;


