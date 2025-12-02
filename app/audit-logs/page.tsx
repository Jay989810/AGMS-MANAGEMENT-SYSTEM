'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { Search, Filter, Download, Calendar, User, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { exportToCSV } from '@/lib/exportToCSV';
import Toast from '@/components/ui/Toast';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, pages: 0 });
  const [filters, setFilters] = useState({
    action: '',
    entityType: '',
    userId: '',
    startDate: '',
    endDate: '',
    search: '',
  });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; isVisible: boolean }>({
    message: '',
    type: 'info',
    isVisible: false,
  });

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, pagination.page]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (filters.action) params.append('action', filters.action);
      if (filters.entityType) params.append('entityType', filters.entityType);
      if (filters.userId) params.append('userId', filters.userId);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.search) params.append('search', filters.search);

      const res = await fetch(`/api/audit-logs?${params}`, {
        credentials: 'include',
      });

      const data = await res.json();
      setLogs(data.logs || []);
      setPagination(data.pagination || pagination);
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      setToast({ message: 'Failed to load audit logs', type: 'error', isVisible: true });
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (logs.length === 0) {
      setToast({ message: 'No logs available for export', type: 'error', isVisible: true });
      return;
    }

    try {
      const exportData = logs.map((log) => ({
        Timestamp: format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss'),
        User: log.userName,
        'User Email': log.userEmail,
        Action: log.action,
        'Entity Type': log.entityType,
        'Entity Name': log.entityName || 'N/A',
        'Device Info': log.deviceInfo || 'N/A',
        'Device Type': log.deviceType || 'N/A',
        'Browser': log.browser || 'N/A',
        'OS': log.os || 'N/A',
        'IP Address': log.ipAddress || 'N/A',
        Details: JSON.stringify(log.details || {}),
      }));

      exportToCSV(exportData, 'audit-logs');
      setToast({ message: 'CSV file downloaded successfully', type: 'success', isVisible: true });
    } catch (error: any) {
      setToast({ message: error.message || 'Failed to export CSV', type: 'error', isVisible: true });
    }
  };

  const clearFilters = () => {
    setFilters({
      action: '',
      entityType: '',
      userId: '',
      startDate: '',
      endDate: '',
      search: '',
    });
  };

  const getActionColor = (action: string) => {
    if (action.includes('CREATE')) return 'bg-green-100 text-green-800';
    if (action.includes('UPDATE')) return 'bg-blue-100 text-blue-800';
    if (action.includes('DELETE')) return 'bg-red-100 text-red-800';
    if (action.includes('SEND')) return 'bg-purple-100 text-purple-800';
    if (action.includes('LOGIN') || action.includes('LOGOUT')) return 'bg-gray-100 text-gray-800';
    return 'bg-gray-100 text-gray-800';
  };

  const actionOptions = [
    { value: '', label: 'All Actions' },
    { value: 'CREATE_MEMBER', label: 'Create Member' },
    { value: 'UPDATE_MEMBER', label: 'Update Member' },
    { value: 'DELETE_MEMBER', label: 'Delete Member' },
    { value: 'SEND_EMAIL', label: 'Send Email' },
    { value: 'SEND_WHATSAPP', label: 'Send WhatsApp' },
    { value: 'CREATE_ATTENDANCE', label: 'Create Attendance' },
    { value: 'CREATE_FINANCE', label: 'Create Finance Record' },
    { value: 'LOGIN', label: 'Login' },
    { value: 'LOGOUT', label: 'Logout' },
    { value: 'EXPORT_DATA', label: 'Export Data' },
  ];

  const entityTypeOptions = [
    { value: '', label: 'All Entities' },
    { value: 'Member', label: 'Member' },
    { value: 'Family', label: 'Family' },
    { value: 'Attendance', label: 'Attendance' },
    { value: 'Finance', label: 'Finance' },
    { value: 'Sermon', label: 'Sermon' },
    { value: 'Message', label: 'Message' },
    { value: 'Department', label: 'Department' },
    { value: 'User', label: 'User' },
  ];

  if (loading && logs.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          onClose={() => setToast({ ...toast, isVisible: false })}
        />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Activity className="text-navy" size={24} />
            <h1 className="text-2xl lg:text-3xl font-bold text-navy">Audit Logs</h1>
          </div>
          {logs.length > 0 && (
            <Button
              variant="gold"
              onClick={handleExportCSV}
              className="flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <Download size={20} />
              <span className="hidden sm:inline">Export CSV</span>
              <span className="sm:hidden">Export</span>
            </Button>
          )}
        </div>

        {/* Filters */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Filter size={20} className="text-gray-600" />
            <h3 className="text-lg font-semibold text-navy">Filters</h3>
            {(filters.action || filters.entityType || filters.startDate || filters.endDate || filters.search) && (
              <Button
                variant="secondary"
                onClick={clearFilters}
                className="ml-auto flex items-center gap-1 text-sm"
              >
                Clear
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                placeholder="Search by user, action, entity..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10"
              />
            </div>
            <Select
              label="Action"
              value={filters.action}
              onChange={(e) => setFilters({ ...filters, action: e.target.value })}
              options={actionOptions}
            />
            <Select
              label="Entity Type"
              value={filters.entityType}
              onChange={(e) => setFilters({ ...filters, entityType: e.target.value })}
              options={entityTypeOptions}
            />
            <Input
              label="Start Date"
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            />
            <Input
              label="End Date"
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            />
          </div>
        </Card>

        {/* Logs Table */}
        <Card>
          {logs.length === 0 ? (
            <div className="text-center py-12">
              <Activity size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No audit logs found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-700 text-sm">Timestamp</th>
                      <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-700 text-sm">User</th>
                      <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-700 text-sm hidden md:table-cell">Action</th>
                      <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-700 text-sm hidden lg:table-cell">Entity</th>
                      <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-700 text-sm hidden xl:table-cell">Device</th>
                      <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-700 text-sm hidden lg:table-cell">IP Address</th>
                      <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-700 text-sm">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-2 sm:px-4 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar size={14} className="hidden sm:inline" />
                            <span>{format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm')}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2 sm:px-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-sm">{log.userName}</span>
                            <span className="text-xs text-gray-500 hidden md:inline">{log.userEmail}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2 sm:px-4 hidden md:table-cell">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                            {log.action.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-2 sm:px-4 text-sm hidden lg:table-cell">
                          <div className="flex flex-col">
                            <span className="font-medium">{log.entityType}</span>
                            {log.entityName && (
                              <span className="text-xs text-gray-500">{log.entityName}</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-2 sm:px-4 text-sm hidden xl:table-cell">
                          {log.deviceInfo ? (
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-900 text-xs">{log.deviceInfo}</span>
                              {log.deviceType && (
                                <span className="text-xs text-gray-500 mt-1">
                                  {log.deviceType}
                                  {log.browser && ` • ${log.browser}`}
                                  {log.os && ` • ${log.os}`}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="py-3 px-2 sm:px-4 text-sm text-gray-600 hidden lg:table-cell">
                          {log.ipAddress || 'N/A'}
                        </td>
                        <td className="py-3 px-2 sm:px-4 text-sm">
                          {log.details ? (
                            <details className="cursor-pointer">
                              <summary className="text-blue-600 hover:text-blue-800">View Details</summary>
                              <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-x-auto">
                                {JSON.stringify(log.details, null, 2)}
                              </pre>
                            </details>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} logs
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                      disabled={pagination.page === 1}
                      className="text-sm"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                      disabled={pagination.page >= pagination.pages}
                      className="text-sm"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}

