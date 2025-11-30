import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAuditLog extends Document {
  userId: mongoose.Types.ObjectId;
  userName: string;
  userEmail: string;
  action: string; // e.g., 'CREATE_MEMBER', 'UPDATE_MEMBER', 'DELETE_MEMBER', 'SEND_MESSAGE', etc.
  entityType: string; // e.g., 'Member', 'Attendance', 'Finance', 'Message'
  entityId?: mongoose.Types.ObjectId;
  entityName?: string; // Human-readable name for the entity
  details?: any; // Additional details about the action
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  createdAt: Date;
}

const AuditLogSchema: Schema = new Schema<IAuditLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    entityType: {
      type: String,
      required: true,
      index: true,
    },
    entityId: {
      type: Schema.Types.ObjectId,
      index: true,
    },
    entityName: {
      type: String,
    },
    details: {
      type: Schema.Types.Mixed,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
AuditLogSchema.index({ userId: 1, timestamp: -1 });
AuditLogSchema.index({ action: 1, timestamp: -1 });
AuditLogSchema.index({ entityType: 1, timestamp: -1 });
AuditLogSchema.index({ timestamp: -1 });

// Auto-delete logs older than 1 year (optional, can be adjusted)
AuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 });

const AuditLog: Model<IAuditLog> = mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

export default AuditLog;

