import connectDB from './db';
import AuditLog from './models/AuditLog';

export interface AuditLogData {
  userId: string;
  userName: string;
  userEmail: string;
  action: string;
  entityType: string;
  entityId?: string;
  entityName?: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Create an audit log entry
 */
export async function logAction(data: AuditLogData): Promise<void> {
  try {
    await connectDB();
    await AuditLog.create({
      ...data,
      timestamp: new Date(),
    });
  } catch (error) {
    // Don't throw - audit logging should never break the main flow
    console.error('Failed to create audit log:', error);
  }
}

/**
 * Helper function to create audit log from request context
 */
export async function logActionFromRequest(
  user: any,
  action: string,
  entityType: string,
  options: {
    entityId?: string;
    entityName?: string;
    details?: any;
    ipAddress?: string;
    userAgent?: string;
  } = {}
): Promise<void> {
  await logAction({
    userId: user._id || user.id,
    userName: user.name || user.fullName || 'Unknown',
    userEmail: user.email || 'unknown@example.com',
    action,
    entityType,
    entityId: options.entityId,
    entityName: options.entityName,
    details: options.details,
    ipAddress: options.ipAddress,
    userAgent: options.userAgent,
  });
}

// Action constants for consistency
export const AuditActions = {
  // Member actions
  CREATE_MEMBER: 'CREATE_MEMBER',
  UPDATE_MEMBER: 'UPDATE_MEMBER',
  DELETE_MEMBER: 'DELETE_MEMBER',
  VIEW_MEMBER: 'VIEW_MEMBER',
  
  // Family actions
  CREATE_FAMILY: 'CREATE_FAMILY',
  UPDATE_FAMILY: 'UPDATE_FAMILY',
  DELETE_FAMILY: 'DELETE_FAMILY',
  
  // Attendance actions
  CREATE_ATTENDANCE: 'CREATE_ATTENDANCE',
  UPDATE_ATTENDANCE: 'UPDATE_ATTENDANCE',
  DELETE_ATTENDANCE: 'DELETE_ATTENDANCE',
  
  // Finance actions
  CREATE_FINANCE: 'CREATE_FINANCE',
  UPDATE_FINANCE: 'UPDATE_FINANCE',
  DELETE_FINANCE: 'DELETE_FINANCE',
  
  // Sermon actions
  CREATE_SERMON: 'CREATE_SERMON',
  UPDATE_SERMON: 'UPDATE_SERMON',
  DELETE_SERMON: 'DELETE_SERMON',
  
  // Bible Study actions
  CREATE_BIBLE_STUDY: 'CREATE_BIBLE_STUDY',
  UPDATE_BIBLE_STUDY: 'DELETE_BIBLE_STUDY',
  
  // Department actions
  CREATE_DEPARTMENT: 'CREATE_DEPARTMENT',
  UPDATE_DEPARTMENT: 'UPDATE_DEPARTMENT',
  DELETE_DEPARTMENT: 'DELETE_DEPARTMENT',
  
  // Message actions
  SEND_EMAIL: 'SEND_EMAIL',
  SEND_SMS: 'SEND_SMS',
  SEND_WHATSAPP: 'SEND_WHATSAPP',
  
  // User actions
  CREATE_USER: 'CREATE_USER',
  UPDATE_USER: 'UPDATE_USER',
  DELETE_USER: 'DELETE_USER',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  
  // System actions
  EXPORT_DATA: 'EXPORT_DATA',
  IMPORT_DATA: 'IMPORT_DATA',
  BACKUP_DATA: 'BACKUP_DATA',
  RESTORE_DATA: 'RESTORE_DATA',
} as const;

