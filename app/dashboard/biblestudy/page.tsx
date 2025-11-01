'use client';

import { useEffect, useState, FormEvent } from 'react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import Toast from '@/components/ui/Toast';
import { Plus, Edit, Trash2, Eye, Calendar, BookOpen, Download } from 'lucide-react';
import { format } from 'date-fns';
import { exportToCSV } from '@/lib/exportToCSV';
import dynamic from 'next/dynamic';

// Lazy load chart components for better performance
const AttendanceChart = dynamic(
  () => import('@/components/charts/AttendanceChart'),
  { 
    ssr: false,
    loading: () => <div className="h-[300px] flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy"></div></div>
  }
);

const serviceTypes = [
  { value: 'Bible Study', label: 'Bible Study' },
  { value: 'Mid-Week Service', label: 'Mid-Week Service' },
];

export default function BibleStudyPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; isVisible: boolean }>({
    message: '',
    type: 'info',
    isVisible: false,
  });
  const [formData, setFormData] = useState({
    date: '',
    serviceType: 'Bible Study',
    topic: '',
    teacher: '',
    keyVerses: '',
    summary: '',
    attendance: '',
    notes: '',
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await fetch('/api/biblestudy');
      const data = await res.json();
      setReports(data.reports || []);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      showToast('Failed to load reports', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type, isVisible: true });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const url = editingId ? `/api/biblestudy/${editingId}` : '/api/biblestudy';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to save report');
      }

      showToast(editingId ? 'Report updated successfully!' : 'Report created successfully!', 'success');
      resetForm();
      fetchReports();
    } catch (error: any) {
      showToast(error.message || 'Failed to save report. Please try again.', 'error');
    }
  };

  const handleEdit = (report: any) => {
    const date = new Date(report.date);
    const formattedDate = date.toISOString().split('T')[0];

    setFormData({
      date: formattedDate,
      serviceType: report.serviceType,
      topic: report.topic,
      teacher: report.teacher,
      keyVerses: report.keyVerses,
      summary: report.summary,
      attendance: report.attendance.toString(),
      notes: report.notes || '',
    });
    setEditingId(report._id);
    setShowModal(true);
  };

  const handleViewDetails = (report: any) => {
    setSelectedReport(report);
    setShowDetailsModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch(`/api/biblestudy/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Report deleted successfully!', 'success');
        fetchReports();
      } else {
        showToast('Failed to delete report', 'error');
      }
    } catch (error) {
      console.error('Failed to delete report:', error);
      showToast('Failed to delete report', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      date: '',
      serviceType: 'Bible Study',
      topic: '',
      teacher: '',
      keyVerses: '',
      summary: '',
      attendance: '',
      notes: '',
    });
    setEditingId(null);
    setShowModal(false);
  };

  const handleExportCSV = () => {
    if (reports.length === 0) {
      showToast('No records available for export', 'error');
      return;
    }

    try {
      const exportData = reports.map((report) => ({
        Date: format(new Date(report.date), 'yyyy-MM-dd'),
        'Service Type': report.serviceType,
        Topic: report.topic,
        Teacher: report.teacher,
        Attendance: report.attendance,
        'Key Verses': report.keyVerses,
        Summary: report.summary,
        Notes: report.notes || '',
      }));

      exportToCSV(exportData, 'bible-study-reports');
      showToast('CSV file downloaded successfully', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to export CSV', 'error');
    }
  };

  // Prepare chart data
  const chartData = reports
    .map((report) => ({
      date: format(new Date(report.date), 'MMM dd'),
      fullDate: format(new Date(report.date), 'yyyy-MM-dd'),
      'Bible Study': report.serviceType === 'Bible Study' ? report.attendance : 0,
      'Mid-Week Service': report.serviceType === 'Mid-Week Service' ? report.attendance : 0,
    }))
    .reduce((acc: any[], curr) => {
      const existing = acc.find((item) => item.fullDate === curr.fullDate);
      if (existing) {
        existing['Bible Study'] += curr['Bible Study'];
        existing['Mid-Week Service'] += curr['Mid-Week Service'];
      } else {
        acc.push(curr);
      }
      return acc;
    }, [])
    .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime())
    .slice(-10); // Show last 10 records

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
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-navy">Bible Study & Mid-Week Reports</h1>
          <div className="flex gap-2">
            {reports.length > 0 && (
              <Button
                variant="gold"
                onClick={handleExportCSV}
                className="flex items-center gap-2"
              >
                <Download size={20} />
                Export CSV
              </Button>
            )}
            <Button
              variant="primary"
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2"
            >
              <Plus size={20} />
              Add New Report
            </Button>
          </div>
        </div>

        {/* Attendance Chart */}
        {reports.length > 0 && (
          <Card title="Attendance Trends">
            <AttendanceChart data={chartData} />
          </Card>
        )}

        {/* Reports Table */}
        <Card>
          {reports.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-4">No reports found</p>
              <Button variant="primary" onClick={() => setShowModal(true)}>
                Add First Report
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Service Type</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Topic</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Teacher</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Attendance</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr key={report._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar size={16} />
                          <span>{format(new Date(report.date), 'MMM dd, yyyy')}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            report.serviceType === 'Bible Study'
                              ? 'bg-navy text-white'
                              : 'bg-gold text-navy'
                          }`}
                        >
                          {report.serviceType}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-navy">{report.topic}</td>
                      <td className="py-3 px-4 text-gray-600">{report.teacher}</td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-navy">{report.attendance}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="secondary"
                            className="p-2"
                            onClick={() => handleViewDetails(report)}
                          >
                            <Eye size={16} />
                          </Button>
                          <Button
                            variant="secondary"
                            className="p-2"
                            onClick={() => handleEdit(report)}
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            variant="danger"
                            className="p-2"
                            onClick={() => handleDelete(report._id)}
                          >
                            <Trash2 size={16} />
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

        {/* Add/Edit Modal */}
        <Modal
          isOpen={showModal}
          onClose={resetForm}
          title={editingId ? 'Edit Report' : 'Add New Report'}
          size="xl"
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
                label="Service Type *"
                value={formData.serviceType}
                onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                options={serviceTypes}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Topic *"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                required
                placeholder="e.g., The Book of Romans"
              />
              <Input
                label="Teacher *"
                value={formData.teacher}
                onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                required
                placeholder="e.g., Pastor John Doe"
              />
            </div>

            <Input
              label="Key Verses *"
              value={formData.keyVerses}
              onChange={(e) => setFormData({ ...formData, keyVerses: e.target.value })}
              required
              placeholder="e.g., Romans 8:28"
            />

            <Textarea
              label="Summary *"
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              required
              rows={4}
              placeholder="Enter a summary of the lesson..."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Attendance *"
                type="number"
                min="0"
                value={formData.attendance}
                onChange={(e) => setFormData({ ...formData, attendance: e.target.value })}
                required
                placeholder="0"
              />
              <div></div>
            </div>

            <Textarea
              label="Notes (Optional)"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="Testimonies, lessons learned, remarks..."
            />

            <div className="flex gap-4 pt-4">
              <Button type="submit" variant="primary" className="flex-1">
                {editingId ? 'Update' : 'Create'} Report
              </Button>
              <Button type="button" variant="secondary" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </Modal>

        {/* View Details Modal */}
        <Modal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          title="Report Details"
          size="lg"
        >
          {selectedReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Date</p>
                  <p className="text-gray-900">
                    {format(new Date(selectedReport.date), 'MMMM dd, yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Service Type</p>
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      selectedReport.serviceType === 'Bible Study'
                        ? 'bg-navy text-white'
                        : 'bg-gold text-navy'
                    }`}
                  >
                    {selectedReport.serviceType}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700">Topic</p>
                <p className="text-gray-900 font-semibold">{selectedReport.topic}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700">Teacher</p>
                <p className="text-gray-900">{selectedReport.teacher}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700">Key Verses</p>
                <p className="text-gray-900 font-medium">{selectedReport.keyVerses}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700">Attendance</p>
                <p className="text-2xl font-bold text-navy">{selectedReport.attendance}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700">Summary</p>
                <p className="text-gray-900 whitespace-pre-wrap">{selectedReport.summary}</p>
              </div>

              {selectedReport.notes && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Notes</p>
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedReport.notes}</p>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
}

