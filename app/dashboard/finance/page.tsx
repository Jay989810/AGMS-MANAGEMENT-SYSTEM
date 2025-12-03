'use client';

import { useEffect, useState, FormEvent } from 'react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import { Plus, Edit, Trash2, Download, Calendar, Filter, X } from 'lucide-react';
import { format } from 'date-fns';
import { exportToCSV } from '@/lib/exportToCSV';
import Toast from '@/components/ui/Toast';

const categories = [
  { value: 'Offering', label: 'Offering' },
  { value: 'Tithe', label: 'Tithe' },
  { value: 'Building Fund', label: 'Building Fund' },
  { value: 'Welfare', label: 'Welfare' },
  { value: 'Donation', label: 'Donation' },
  { value: 'Other', label: 'Other' },
];

export default function FinancePage() {
  const [records, setRecords] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; isVisible: boolean }>({
    message: '',
    type: 'info',
    isVisible: false,
  });
  const [formData, setFormData] = useState({
    date: '',
    category: 'Offering',
    description: '',
    amount: '',
    type: 'Income',
  });

  // Filters
  const [filters, setFilters] = useState({
    category: 'all',
    type: 'all',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchRecords();
    fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchRecords = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.category !== 'all') params.append('category', filters.category);
      if (filters.type !== 'all') params.append('type', filters.type);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const res = await fetch(`/api/finance?${params}`, {
        credentials: 'include',
      });
      const data = await res.json();
      setRecords(data.records || []);
    } catch (error) {
      console.error('Failed to fetch records:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const res = await fetch(`/api/finance/summary?${params}`, {
        credentials: 'include',
      });
      const data = await res.json();
      setSummary(data);
    } catch (error) {
      console.error('Failed to fetch summary:', error);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingId ? `/api/finance/${editingId}` : '/api/finance';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to save record');
      }

      const data = await res.json();
      // Update UI immediately
      if (editingId) {
        setRecords(records.map(r => r._id === editingId ? data.record : r));
        setToast({ message: 'Record updated successfully', type: 'success', isVisible: true });
      } else {
        setRecords([data.record, ...records]);
        setToast({ message: 'Record created successfully', type: 'success', isVisible: true });
      }
      resetForm();
      setShowModal(false);
      // Refresh to ensure consistency
      fetchRecords();
      fetchSummary();
    } catch (error: any) {
      setToast({ message: error.message || 'Failed to save record. Please try again.', type: 'error', isVisible: true });
    }
  };

  const handleEdit = (record: any) => {
    const date = new Date(record.date);
    const formattedDate = date.toISOString().split('T')[0];
    
    setFormData({
      date: formattedDate,
      category: record.category,
      description: record.description,
      amount: record.amount.toString(),
      type: record.type,
    });
    setEditingId(record._id);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this financial record? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch(`/api/finance/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete record');
      }

      setRecords(records.filter(r => r._id !== id));
      setToast({ message: 'Record deleted successfully', type: 'success', isVisible: true });
      fetchSummary();
    } catch (error: any) {
      setToast({ message: error.message || 'Failed to delete record. Please try again.', type: 'error', isVisible: true });
    }
  };

  const resetForm = () => {
    setFormData({
      date: '',
      category: 'Offering',
      description: '',
      amount: '',
      type: 'Income',
    });
    setEditingId(null);
    setShowModal(false);
  };

  const handleExportCSV = () => {
    if (records.length === 0) {
      setToast({ message: 'No records available for export', type: 'error', isVisible: true });
      return;
    }

    try {
      const exportData = records.map((record) => ({
        Date: format(new Date(record.date), 'yyyy-MM-dd'),
        Category: record.category,
        Description: record.description,
        Type: record.type,
        Amount: record.amount.toFixed(2),
      }));

      exportToCSV(exportData, 'financial-records');
      setToast({ message: 'CSV file downloaded successfully', type: 'success', isVisible: true });
    } catch (error: any) {
      setToast({ message: error.message || 'Failed to export CSV', type: 'error', isVisible: true });
    }
  };

  const clearFilters = () => {
    setFilters({
      category: 'all',
      type: 'all',
      startDate: '',
      endDate: '',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  if (loading) {
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
        {/* Toast Notification */}
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          onClose={() => setToast({ ...toast, isVisible: false })}
        />

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-2xl lg:text-3xl font-bold text-navy">Financial Records</h1>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {records.length > 0 && (
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
            <Button
              variant="primary"
              onClick={() => setShowModal(true)}
              className="flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <Plus size={20} />
              Add Record
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-700 text-sm font-medium">Total Income</p>
                  <p className="text-2xl lg:text-3xl font-bold text-green-800 mt-2">
                    {formatCurrency(summary.totalIncome)}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    {summary.incomeCount} record{summary.incomeCount !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-200 flex items-center justify-center">
                  <span className="text-2xl">💰</span>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-700 text-sm font-medium">Total Expense</p>
                  <p className="text-2xl lg:text-3xl font-bold text-red-800 mt-2">
                    {formatCurrency(summary.totalExpense)}
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    {summary.expenseCount} record{summary.expenseCount !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-red-200 flex items-center justify-center">
                  <span className="text-2xl">📉</span>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-gold to-gold-dark border-gold-dark">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-navy text-sm font-medium">Current Balance</p>
                  <p className={`text-2xl lg:text-3xl font-bold mt-2 ${summary.balance >= 0 ? 'text-navy' : 'text-red-700'}`}>
                    {formatCurrency(summary.balance)}
                  </p>
                  <p className="text-xs text-navy mt-1">
                    Income - Expense
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-navy flex items-center justify-center">
                  <span className="text-2xl">💵</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Filter size={20} className="text-gray-600" />
            <h3 className="text-lg font-semibold text-navy">Filters</h3>
            {(filters.category !== 'all' || filters.type !== 'all' || filters.startDate || filters.endDate) && (
              <Button
                variant="secondary"
                onClick={clearFilters}
                className="ml-auto flex items-center gap-1 text-sm"
              >
                <X size={16} />
                Clear
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select
              label="Category"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              options={[
                { value: 'all', label: 'All Categories' },
                ...categories,
              ]}
            />
            <Select
              label="Type"
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              options={[
                { value: 'all', label: 'All Types' },
                { value: 'Income', label: 'Income' },
                { value: 'Expense', label: 'Expense' },
              ]}
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

        {/* Records Table */}
        <Card>
          {records.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No financial records found</p>
              <Button variant="primary" onClick={() => setShowModal(true)}>
                Add First Record
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-700 text-sm">Date</th>
                    <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-700 text-sm hidden md:table-cell">Category</th>
                    <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-700 text-sm">Description</th>
                    <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-700 text-sm hidden lg:table-cell">Type</th>
                    <th className="text-right py-3 px-2 sm:px-4 font-semibold text-gray-700 text-sm">Amount</th>
                    <th className="text-right py-3 px-2 sm:px-4 font-semibold text-gray-700 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr key={record._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-2 sm:px-4">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2 text-gray-600 text-sm">
                            <Calendar size={14} className="hidden sm:inline" />
                            <span>{format(new Date(record.date), 'MMM dd, yyyy')}</span>
                          </div>
                          <div className="md:hidden mt-1">
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gold/20 text-navy">
                              {record.category}
                            </span>
                            <span
                              className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                                record.type === 'Income'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {record.type}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2 sm:px-4 hidden md:table-cell">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gold/20 text-navy">
                          {record.category}
                        </span>
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-gray-600 text-sm">{record.description}</td>
                      <td className="py-3 px-2 sm:px-4 hidden lg:table-cell">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            record.type === 'Income'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {record.type}
                        </span>
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-right font-semibold text-sm">
                        <span
                          className={record.type === 'Income' ? 'text-green-700' : 'text-red-700'}
                        >
                          {record.type === 'Income' ? '+' : '-'}
                          {formatCurrency(record.amount)}
                        </span>
                      </td>
                      <td className="py-3 px-2 sm:px-4">
                        <div className="flex items-center justify-end gap-1 sm:gap-2">
                          <Button
                            variant="secondary"
                            className="p-1.5 sm:p-2"
                            onClick={() => handleEdit(record)}
                          >
                            <Edit size={14} className="sm:w-4 sm:h-4" />
                          </Button>
                          <Button
                            variant="danger"
                            className="p-1.5 sm:p-2"
                            onClick={() => handleDelete(record._id)}
                          >
                            <Trash2 size={14} className="sm:w-4 sm:h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Modal for Add/Edit */}
        <Modal
          isOpen={showModal}
          onClose={resetForm}
          title={editingId ? 'Edit Financial Record' : 'Add Financial Record'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Date *"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
              <Select
                label="Type *"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                options={[
                  { value: 'Income', label: 'Income' },
                  { value: 'Expense', label: 'Expense' },
                ]}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Category *"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                options={categories}
                required
              />
              <Input
                label="Amount *"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent resize-vertical"
                rows={3}
                required
                placeholder="Enter description..."
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" variant="primary" className="flex-1">
                {editingId ? 'Update' : 'Create'} Record
              </Button>
              <Button type="button" variant="secondary" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}

