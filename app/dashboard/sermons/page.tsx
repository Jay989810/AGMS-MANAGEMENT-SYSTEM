'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Plus, Edit, Trash2, ExternalLink, Calendar } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function SermonsPage() {
  const [sermons, setSermons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSermons();
  }, []);

  const fetchSermons = async () => {
    try {
      const res = await fetch('/api/sermons', {
        credentials: 'include',
      });
      const data = await res.json();
      setSermons(data.sermons || []);
    } catch (error) {
      console.error('Failed to fetch sermons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this sermon?')) return;

    try {
      const res = await fetch(`/api/sermons/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchSermons();
      } else {
        alert('Failed to delete sermon');
      }
    } catch (error) {
      console.error('Failed to delete sermon:', error);
      alert('Failed to delete sermon');
    }
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-2xl lg:text-3xl font-bold text-navy">Sermon Records</h1>
          <Link href="/dashboard/sermons/new" className="w-full sm:w-auto">
            <Button variant="primary" className="flex items-center justify-center gap-2 w-full sm:w-auto">
              <Plus size={20} />
              Add Sermon
            </Button>
          </Link>
        </div>

        <Card>
          {sermons.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No sermons found</p>
              <Link href="/dashboard/sermons/new">
                <Button variant="primary">Add First Sermon</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-700 text-sm">Date</th>
                    <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-700 text-sm">Title</th>
                    <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-700 text-sm hidden md:table-cell">Preacher</th>
                    <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-700 text-sm hidden lg:table-cell">Bible Text</th>
                    <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-700 text-sm hidden lg:table-cell">Summary</th>
                    <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-700 text-sm hidden md:table-cell">Media</th>
                    <th className="text-right py-3 px-2 sm:px-4 font-semibold text-gray-700 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sermons.map((sermon) => (
                    <tr key={sermon._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-2 sm:px-4">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2 text-gray-600 text-sm">
                            <Calendar size={14} className="hidden sm:inline" />
                            <span>{format(new Date(sermon.date), 'MMM dd, yyyy')}</span>
                          </div>
                          <div className="md:hidden mt-1 text-xs text-gray-500">
                            {sermon.preacher}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2 sm:px-4 font-medium text-navy text-sm">
                        <div className="flex flex-col">
                          <span>{sermon.title}</span>
                          <span className="text-xs text-gray-500 lg:hidden mt-1">{sermon.bibleText}</span>
                          <span className="text-xs text-gray-500 lg:hidden">{sermon.summary.substring(0, 50)}...</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-gray-600 text-sm hidden md:table-cell">{sermon.preacher}</td>
                      <td className="py-3 px-2 sm:px-4 text-gray-600 font-medium text-sm hidden lg:table-cell">{sermon.bibleText}</td>
                      <td className="py-3 px-2 sm:px-4 text-gray-600 text-sm hidden lg:table-cell">
                        <div className="max-w-xs truncate" title={sermon.summary}>
                          {sermon.summary}
                        </div>
                      </td>
                      <td className="py-3 px-2 sm:px-4 hidden md:table-cell">
                        {sermon.mediaLink ? (
                          <a
                            href={sermon.mediaLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gold hover:text-gold-dark flex items-center gap-1 text-sm"
                          >
                            <ExternalLink size={14} />
                            <span>View</span>
                          </a>
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </td>
                      <td className="py-3 px-2 sm:px-4">
                        <div className="flex items-center justify-end gap-1 sm:gap-2">
                          <Link href={`/dashboard/sermons/${sermon._id}/edit`}>
                            <Button variant="secondary" className="p-1.5 sm:p-2">
                              <Edit size={14} className="sm:w-4 sm:h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="danger"
                            className="p-1.5 sm:p-2"
                            onClick={() => handleDelete(sermon._id)}
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
      </div>
    </DashboardLayout>
  );
}

