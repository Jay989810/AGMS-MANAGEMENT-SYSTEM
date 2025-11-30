'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Gift, 
  Mail, 
  Building2,
  BookOpen,
  DollarSign,
  GraduationCap,
  LogOut,
  X,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/members', label: 'Members', icon: Users },
  { href: '/attendance', label: 'Attendance', icon: Calendar },
  { href: '/departments', label: 'Departments', icon: Building2 },
  { href: '/birthdays', label: 'Birthdays', icon: Gift },
  { href: '/messaging', label: 'Messaging', icon: Mail },
  { href: '/dashboard/sermons', label: 'Sermons', icon: BookOpen },
  { href: '/dashboard/finance', label: 'Finance', icon: DollarSign, emoji: '💰' },
  { href: '/dashboard/biblestudy', label: 'Bible Study', icon: GraduationCap, emoji: '📚' },
  { href: '/audit-logs', label: 'Audit Logs', icon: Activity },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    window.location.href = '/login';
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-navy text-white min-h-screen flex flex-col transform transition-transform duration-300 ease-in-out',
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        <div className="p-4 lg:p-6 border-b border-navy-light flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">AGCMS</h1>
            <p className="text-sm text-gray-300 mt-1">Amazing Grace Church</p>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-gray-300 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 p-4 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            const isFinance = item.href === '/dashboard/finance';
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  // Close sidebar on mobile when link is clicked
                  if (window.innerWidth < 1024) {
                    onClose();
                  }
                }}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors',
                  isActive
                    ? 'bg-gold text-navy font-semibold'
                    : isFinance
                    ? 'text-gray-300 hover:bg-gold/20 hover:text-gold'
                    : 'text-gray-300 hover:bg-navy-light hover:text-white'
                )}
              >
                {item.emoji ? (
                  <span className="text-xl">{item.emoji}</span>
                ) : (
                  <Icon size={20} />
                )}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-navy-light">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-navy-light hover:text-white w-full transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}


