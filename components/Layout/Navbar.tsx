'use client';

import { useEffect, useState } from 'react';
import { User, Menu } from 'lucide-react';

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch('/api/auth/me', {
      credentials: 'include', // Important for cookies to work
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch user:', err);
      });
  }, []);

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 px-4 lg:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden text-navy hover:text-navy-dark p-2"
          >
            <Menu size={24} />
          </button>
          <h2 className="text-xl lg:text-2xl font-bold text-navy">Church Management</h2>
        </div>
        {user && (
          <div className="flex items-center gap-2 lg:gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">{user.role}</p>
            </div>
            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-navy flex items-center justify-center text-white">
              <User size={16} className="lg:w-5 lg:h-5" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


