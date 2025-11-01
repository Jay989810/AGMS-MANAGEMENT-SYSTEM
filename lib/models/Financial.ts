import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFinancial extends Document {
  date: Date;
  category: 'Offering' | 'Tithe' | 'Building Fund' | 'Welfare' | 'Donation' | 'Other';
  description: string;
  amount: number;
  type: 'Income' | 'Expense';
  createdAt: Date;
  updatedAt: Date;
}

const FinancialSchema: Schema = new Schema<IFinancial>(
  {
    date: {
      type: Date,
      required: true,
    },
    category: {
      type: String,
      enum: ['Offering', 'Tithe', 'Building Fund', 'Welfare', 'Donation', 'Other'],
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    type: {
      type: String,
      enum: ['Income', 'Expense'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Financial: Model<IFinancial> = mongoose.models.Financial || mongoose.model<IFinancial>('Financial', FinancialSchema);

export default Financial;

