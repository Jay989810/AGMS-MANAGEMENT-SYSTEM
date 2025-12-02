import connectDB from './db';
import AuditLog from './models/AuditLog';
import { parseDeviceInfo, formatDeviceInfo, DeviceInfo } from './device-info';

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
  // Device information (optional - will be parsed from userAgent if not provided)
  deviceType?: string;
  deviceName?: string;
  browser?: string;
  browserVersion?: string;
  os?: string;
  osVersion?: string;
  deviceInfo?: string;
}

/**
 * Create an audit log entry
 */
export async function logAction(data: AuditLogData): Promise<void> {
  try {
    await connectDB();
    
    // Parse device info from userAgent if not provided
    let deviceInfo: DeviceInfo | null = null;
    if (data.userAgent && (!data.deviceType || !data.browser)) {
      deviceInfo = parseDeviceInfo(data.userAgent);
    }
    
    // Prepare audit log data with device information
    const auditData: any = {
      ...data,
      timestamp: new Date(),
    };
    
    // Add device info if available
    if (deviceInfo) {
      auditData.deviceType = data.deviceType || deviceInfo.deviceType;
      auditData.deviceName = data.deviceName || deviceInfo.deviceName;
      auditData.browser = data.browser || deviceInfo.browser;
      auditData.browserVersion = data.browserVersion || deviceInfo.browserVersion;
      auditData.os = data.os || deviceInfo.os;
      auditData.osVersion = data.osVersion || deviceInfo.osVersion;
      auditData.deviceInfo = data.deviceInfo || formatDeviceInfo(deviceInfo);
    } else if (data.deviceType || data.browser || data.os) {
      // If device info was provided directly, format it
      auditData.deviceInfo = data.deviceInfo || formatDeviceInfo({
        deviceType: data.deviceType || 'Unknown',
        deviceName: data.deviceName,
        browser: data.browser || 'Unknown',
        browserVersion: data.browserVersion,
        os: data.os || 'Unknown',
        osVersion: data.osVersion,
        isMobile: data.deviceType === 'Mobile',
        isTablet: data.deviceType === 'Tablet',
        isDesktop: data.deviceType === 'Desktop',
      });
    }
    
    await AuditLog.create(auditData);
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
    deviceType?: string;
    deviceName?: string;
    browser?: string;
    browserVersion?: string;
    os?: string;
    osVersion?: string;
    deviceInfo?: string;
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
    deviceType: options.deviceType,
    deviceName: options.deviceName,
    browser: options.browser,
    browserVersion: options.browserVersion,
    os: options.os,
    osVersion: options.osVersion,
    deviceInfo: options.deviceInfo,
  });
}

// Action constants for consistency
export const AuditActions = {
  // Member actions
  CREATE_MEMBER: 'CREATE_MEMBER',
  UPDATE_MEMBER: 'UPDATE_MEMBER',
  DELETE_MEMBER: 'DELETE_MEMBER',
  VIEW_MEMBER: 'VIEW_MEMBER',
  VIEW_MEMBERS: 'VIEW_MEMBERS',
  
  // Family actions
  CREATE_FAMILY: 'CREATE_FAMILY',
  UPDATE_FAMILY: 'UPDATE_FAMILY',
  DELETE_FAMILY: 'DELETE_FAMILY',
  VIEW_FAMILY: 'VIEW_FAMILY',
  VIEW_FAMILIES: 'VIEW_FAMILIES',
  
  // Attendance actions
  CREATE_ATTENDANCE: 'CREATE_ATTENDANCE',
  UPDATE_ATTENDANCE: 'UPDATE_ATTENDANCE',
  DELETE_ATTENDANCE: 'DELETE_ATTENDANCE',
  VIEW_ATTENDANCE: 'VIEW_ATTENDANCE',
  VIEW_ATTENDANCES: 'VIEW_ATTENDANCES',
  
  // Finance actions
  CREATE_FINANCE: 'CREATE_FINANCE',
  UPDATE_FINANCE: 'UPDATE_FINANCE',
  DELETE_FINANCE: 'DELETE_FINANCE',
  VIEW_FINANCE: 'VIEW_FINANCE',
  VIEW_FINANCES: 'VIEW_FINANCES',
  
  // Sermon actions
  CREATE_SERMON: 'CREATE_SERMON',
  UPDATE_SERMON: 'UPDATE_SERMON',
  DELETE_SERMON: 'DELETE_SERMON',
  VIEW_SERMON: 'VIEW_SERMON',
  VIEW_SERMONS: 'VIEW_SERMONS',
  
  // Bible Study actions
  CREATE_BIBLE_STUDY: 'CREATE_BIBLE_STUDY',
  UPDATE_BIBLE_STUDY: 'UPDATE_BIBLE_STUDY',
  DELETE_BIBLE_STUDY: 'DELETE_BIBLE_STUDY',
  VIEW_BIBLE_STUDY: 'VIEW_BIBLE_STUDY',
  VIEW_BIBLE_STUDIES: 'VIEW_BIBLE_STUDIES',
  
  // Department actions
  CREATE_DEPARTMENT: 'CREATE_DEPARTMENT',
  UPDATE_DEPARTMENT: 'UPDATE_DEPARTMENT',
  DELETE_DEPARTMENT: 'DELETE_DEPARTMENT',
  VIEW_DEPARTMENT: 'VIEW_DEPARTMENT',
  VIEW_DEPARTMENTS: 'VIEW_DEPARTMENTS',
  
  // Message actions
  SEND_EMAIL: 'SEND_EMAIL',
  SEND_SMS: 'SEND_SMS',
  SEND_WHATSAPP: 'SEND_WHATSAPP',
  SEND_PRAYER: 'SEND_PRAYER',
  
  // User actions
  CREATE_USER: 'CREATE_USER',
  UPDATE_USER: 'UPDATE_USER',
  DELETE_USER: 'DELETE_USER',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  VIEW_USER: 'VIEW_USER',
  
  // System actions
  EXPORT_DATA: 'EXPORT_DATA',
  IMPORT_DATA: 'IMPORT_DATA',
  BACKUP_DATA: 'BACKUP_DATA',
  RESTORE_DATA: 'RESTORE_DATA',
  VIEW_AUDIT_LOGS: 'VIEW_AUDIT_LOGS',
  VIEW_DASHBOARD: 'VIEW_DASHBOARD',
  VIEW_STATS: 'VIEW_STATS',
  VIEW_BIRTHDAYS: 'VIEW_BIRTHDAYS',
  VIEW_WEEKLY_SELECTION: 'VIEW_WEEKLY_SELECTION',
} as const;

