import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBibleStudyReport extends Document {
  date: Date;
  serviceType: 'Bible Study' | 'Mid-Week Service';
  topic: string;
  teacher: string;
  keyVerses: string;
  summary: string;
  attendance: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BibleStudyReportSchema: Schema = new Schema<IBibleStudyReport>(
  {
    date: {
      type: Date,
      required: true,
    },
    serviceType: {
      type: String,
      enum: ['Bible Study', 'Mid-Week Service'],
      required: true,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
    },
    teacher: {
      type: String,
      required: true,
      trim: true,
    },
    keyVerses: {
      type: String,
      required: true,
      trim: true,
    },
    summary: {
      type: String,
      required: true,
      trim: true,
    },
    attendance: {
      type: Number,
      required: true,
      min: 0,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const BibleStudyReport: Model<IBibleStudyReport> =
  mongoose.models.BibleStudyReport ||
  mongoose.model<IBibleStudyReport>('BibleStudyReport', BibleStudyReportSchema);

export default BibleStudyReport;

