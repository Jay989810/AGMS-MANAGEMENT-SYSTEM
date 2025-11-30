# Audit Logs Implementation Guide

## ✅ What's Been Implemented

### 1. AuditLog Model
- Created `lib/models/AuditLog.ts`
- Tracks: user, action, entity, timestamp, IP address, user agent
- Auto-expires logs older than 1 year
- Indexed for fast queries

### 2. Audit Logging Library
- Created `lib/audit.ts`
- Helper functions for easy logging
- Action constants for consistency
- Automatic user context capture

### 3. API Endpoint
- Created `app/api/audit-logs/route.ts`
- View logs with filters and pagination
- Search functionality
- Date range filtering

### 4. UI Page
- Created `app/audit-logs/page.tsx`
- View all audit logs in a table
- Filter by action, entity type, date range
- Search by user, action, entity name
- Export to CSV
- Mobile responsive

### 5. Automatic Logging
- Member creation is logged
- WhatsApp messages are logged
- (More endpoints can be added as needed)

---

## 🔧 How to Use Audit Logs

### Viewing Logs
1. Go to **Audit Logs** in the sidebar
2. View all recent activities
3. Use filters to find specific actions
4. Search for specific users or actions

### Filters Available
- **Action**: Filter by specific action (Create, Update, Delete, etc.)
- **Entity Type**: Filter by entity (Member, Message, etc.)
- **Date Range**: Filter by date
- **Search**: Search by user name, email, action, or entity name

### Export Logs
1. Apply filters if needed
2. Click **Export CSV**
3. Download CSV file with all filtered logs

---

## 🔧 Adding Audit Logging to More Endpoints

To add audit logging to other endpoints, follow this pattern:

### Example: Logging Member Updates

```typescript
import { logActionFromRequest, AuditActions } from '@/lib/audit';

// In your PUT/PATCH handler:
await logActionFromRequest(
  user,
  AuditActions.UPDATE_MEMBER,
  'Member',
  {
    entityId: member._id.toString(),
    entityName: member.fullName,
    details: { changes: 'Updated email and phone' },
    ipAddress: req.headers.get('x-forwarded-for') || undefined,
    userAgent: req.headers.get('user-agent') || undefined,
  }
);
```

### Example: Logging Deletions

```typescript
await logActionFromRequest(
  user,
  AuditActions.DELETE_MEMBER,
  'Member',
  {
    entityId: memberId,
    entityName: member.fullName,
    ipAddress: req.headers.get('x-forwarded-for') || undefined,
    userAgent: req.headers.get('user-agent') || undefined,
  }
);
```

---

## 📋 Actions to Log

Here are common actions you should log:

### Member Management
- ✅ CREATE_MEMBER (implemented)
- 🔄 UPDATE_MEMBER (add to member update endpoint)
- 🔄 DELETE_MEMBER (add to member delete endpoint)
- 🔄 VIEW_MEMBER (optional - for sensitive data access)

### Messaging
- ✅ SEND_WHATSAPP (implemented)
- 🔄 SEND_EMAIL (add to email sending)
- 🔄 SEND_SMS (add to SMS sending)

### Finance
- 🔄 CREATE_FINANCE
- 🔄 UPDATE_FINANCE
- 🔄 DELETE_FINANCE

### Attendance
- 🔄 CREATE_ATTENDANCE
- 🔄 UPDATE_ATTENDANCE
- 🔄 DELETE_ATTENDANCE

### System Actions
- 🔄 EXPORT_DATA
- 🔄 IMPORT_DATA
- 🔄 LOGIN
- 🔄 LOGOUT

---

## 🔧 Quick Implementation Checklist

To add logging to all endpoints:

1. **Import the logging functions:**
   ```typescript
   import { logActionFromRequest, AuditActions } from '@/lib/audit';
   ```

2. **Add logging after successful operations:**
   ```typescript
   await logActionFromRequest(user, AuditActions.ACTION_NAME, 'EntityType', {
     entityId: entity._id.toString(),
     entityName: entity.name,
     ipAddress: req.headers.get('x-forwarded-for') || undefined,
     userAgent: req.headers.get('user-agent') || undefined,
   });
   ```

3. **Use appropriate action constant from `AuditActions`**

---

## 📊 What Gets Logged

Each audit log entry contains:
- **Who**: User ID, name, email
- **What**: Action performed
- **Entity**: What was affected (Member, Message, etc.)
- **When**: Timestamp
- **Where**: IP address (if available)
- **How**: User agent/browser info
- **Details**: Additional information (optional)

---

## 🔒 Security Notes

1. **Access Control**: Only admins should view audit logs (currently requires auth)
2. **Data Retention**: Logs auto-expire after 1 year (configurable in model)
3. **IP Privacy**: Consider masking IP addresses for GDPR compliance
4. **Performance**: Logging is async and won't block requests

---

## 🎯 Next Steps

1. Add logging to remaining endpoints:
   - Member update/delete
   - Attendance create/update/delete
   - Finance create/update/delete
   - Export/import operations
   - Login/logout

2. Enhanced Features (Future):
   - Real-time audit log streaming
   - Audit log alerts for sensitive actions
   - Detailed action diff (what changed)
   - User activity dashboard

---

**Status:** ✅ Audit logging system is functional and ready to use!

