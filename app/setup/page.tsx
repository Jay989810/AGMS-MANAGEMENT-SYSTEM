'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import Footer from '@/components/Layout/Footer';

export default function SetupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [setupNeeded, setSetupNeeded] = useState(false);

  useEffect(() => {
    // Check if setup is needed
    fetch('/api/setup', {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        setSetupNeeded(data.setupNeeded);
        if (!data.setupNeeded) {
          setError('Setup is not needed. Users already exist. Redirecting to login...');
          setTimeout(() => router.push('/login'), 2000);
        }
      })
      .catch((err) => {
        console.error('Setup check error:', err);
        setError('Failed to check setup status. You can try to create an admin account.');
        setSetupNeeded(true);
      })
      .finally(() => {
        setChecking(false);
      });
  }, [router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Setup failed');
        setLoading(false);
        return;
      }

      setSuccess('Super admin created successfully! Redirecting to login...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-navy to-navy-dark">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white">Checking setup status...</p>
        </div>
        <Footer darkMode />
      </div>
    );
  }

  if (!setupNeeded) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-navy to-navy-dark">
        <Card className="max-w-md mb-8">
          <div className="text-center">
            <p className="text-gray-600">Setup is not needed. Redirecting to login...</p>
          </div>
        </Card>
        <Footer darkMode />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-navy to-navy-dark p-4">
      <Card className="w-full max-w-md mb-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-navy mb-2">Initial Setup</h1>
          <p className="text-gray-600">Create your first admin account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Full Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="John Doe"
          />

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="admin@amazinggrace.com"
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Minimum 6 characters"
            minLength={6}
          />

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          <Button type="submit" variant="primary" className="w-full" disabled={loading}>
            {loading ? 'Creating Admin...' : 'Create Super Admin'}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            ⚠️ This route should be removed or protected after setup for security.
          </p>
        </form>
      </Card>
      <Footer darkMode />
    </div>
  );
}

