import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISermon extends Document {
  title: string;
  preacher: string;
  date: Date;
  summary: string;
  bibleText: string;
  mediaLink?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SermonSchema: Schema = new Schema<ISermon>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    preacher: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    summary: {
      type: String,
      required: true,
      trim: true,
    },
    bibleText: {
      type: String,
      required: true,
      trim: true,
    },
    mediaLink: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Sermon: Model<ISermon> = mongoose.models.Sermon || mongoose.model<ISermon>('Sermon', SermonSchema);

export default Sermon;

