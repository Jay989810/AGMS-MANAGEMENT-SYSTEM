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
  LogOut 
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
];

export default function Sidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  return (
    <div className="w-64 bg-navy text-white min-h-screen flex flex-col">
      <div className="p-6 border-b border-navy-light">
        <h1 className="text-xl font-bold">AGCMS</h1>
        <p className="text-sm text-gray-300 mt-1">Amazing Grace Church</p>
      </div>
      
      <nav className="flex-1 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          const isFinance = item.href === '/dashboard/finance';
          
          return (
            <Link
              key={item.href}
              href={item.href}
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
  );
}


