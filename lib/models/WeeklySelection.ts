import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IWeeklySelection extends Document {
  selectionType: 'member' | 'family';
  memberId?: mongoose.Schema.Types.ObjectId;
  familyId?: mongoose.Schema.Types.ObjectId;
  weekStartDate: Date; // Monday of the week
  weekEndDate: Date; // Sunday of the week
  year: number;
  weekNumber: number; // Week number in the year (1-52)
  prayerSent: boolean; // Deprecated: kept for backward compatibility
  prayerSentCount: number; // Number of times prayer has been sent (max 2)
  createdAt: Date;
  updatedAt: Date;
}

const WeeklySelectionSchema: Schema = new Schema<IWeeklySelection>(
  {
    selectionType: {
      type: String,
      enum: ['member', 'family'],
      required: true,
    },
    memberId: {
      type: Schema.Types.ObjectId,
      ref: 'Member',
      index: true,
    },
    familyId: {
      type: Schema.Types.ObjectId,
      ref: 'Family',
      index: true,
    },
    weekStartDate: {
      type: Date,
      required: true,
      index: true,
    },
    weekEndDate: {
      type: Date,
      required: true,
    },
    year: {
      type: Number,
      required: true,
      index: true,
    },
    weekNumber: {
      type: Number,
      required: true,
      index: true,
    },
    prayerSent: {
      type: Boolean,
      default: false,
    },
    prayerSentCount: {
      type: Number,
      default: 0,
      min: 0,
      max: 2,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
WeeklySelectionSchema.index({ year: 1, weekNumber: 1 });
WeeklySelectionSchema.index({ selectionType: 1, memberId: 1 });
WeeklySelectionSchema.index({ selectionType: 1, familyId: 1 });

const WeeklySelection: Model<IWeeklySelection> = 
  mongoose.models.WeeklySelection || 
  mongoose.model<IWeeklySelection>('WeeklySelection', WeeklySelectionSchema);

export default WeeklySelection;

