import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFamily extends Document {
  familyName: string;
  headOfFamily: mongoose.Types.ObjectId;
  address: string;
  phone: string;
  email?: string;
  members: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const FamilySchema: Schema = new Schema<IFamily>(
  {
    familyName: {
      type: String,
      required: true,
      trim: true,
    },
    headOfFamily: {
      type: Schema.Types.ObjectId,
      ref: 'Member',
      required: true,
    },
    address: {
      type: String,
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
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Member',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Add indexes for better query performance
FamilySchema.index({ familyName: 1 });
FamilySchema.index({ headOfFamily: 1 });
FamilySchema.index({ createdAt: -1 });

const Family: Model<IFamily> = mongoose.models.Family || mongoose.model<IFamily>('Family', FamilySchema);

export default Family;

