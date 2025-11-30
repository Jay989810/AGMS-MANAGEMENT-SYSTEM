'use client';

import DashboardLayout from '@/components/Layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { WifiOff, RefreshCw } from 'lucide-react';

export default function OfflinePage() {
  const handleRetry = () => {
    if (navigator.onLine) {
      window.location.reload();
    } else {
      alert('You are still offline. Please check your internet connection.');
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-md mx-auto mt-20">
        <Card>
          <div className="text-center py-12">
            <WifiOff size={64} className="mx-auto text-gray-400 mb-4" />
            <h1 className="text-2xl font-bold text-navy mb-2">You&apos;re Offline</h1>
            <p className="text-gray-600 mb-6">
              It looks like you&apos;ve lost your internet connection. Some features may be limited.
            </p>
            <div className="space-y-3">
              <Button
                variant="primary"
                onClick={handleRetry}
                className="flex items-center justify-center gap-2"
              >
                <RefreshCw size={20} />
                Try Again
              </Button>
              <p className="text-sm text-gray-500 mt-4">
                Previously viewed pages may still be available offline.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

