'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useRBAC } from '@/contexts/auth-context';
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  User,
  ChevronLeft,
  ChevronRight,
  ListCheckIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
}

const sidebarItems: SidebarItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['admin', 'protocol_officer', 'protocol_incharge' /*, 'requestee'*/],
  },
  {
    label: 'Admin Panel',
    href: '/admin',
    icon: Settings,
    roles: ['admin'],
  },
  {
    label: 'Protocol Officer',
    href: '/protocol-officer',
    icon: FileText,
    roles: ['admin', 'protocol_officer'],
  },
  {
    label: 'Protocol In-charge',
    href: '/protocol-incharge',
    icon: Users,
    roles: ['admin', 'protocol_incharge'],
  },
  // {
  //   label: 'Profile',
  //   href: '/profile',
  //   icon: User,
  // },
  {
    label: 'Create Requests',
    href: '/requestee',
    icon: FileText,
    roles: ['requestee'],
  },
  {
    label: 'Request Status',
    href: '/request-status',
    icon: ListCheckIcon,
    roles: ['requestee'],
  }
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, hasRole } = useRBAC();

  const filteredItems = sidebarItems.filter((item) => {
    if (!item.roles) return true;
    return item.roles.some((role) => hasRole(role as any));
  });

  return (
    <div
      className={cn(
        'bg-white border-r border-gray-200 transition-all duration-300 flex flex-col',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        {!collapsed && (
          <h1 className="text-lg font-bold text-gray-800">Menu</h1>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="p-2"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  'flex items-center px-3 py-2 rounded-lg transition-colors',
                  'hover:bg-gray-100',
                  isActive && 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && (
                  <span className="ml-3 text-sm font-medium">{item.label}</span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User info */}
      {!collapsed && user && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.username}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.user_type?.replace('_', ' ') ?? ''}
                {/* {user.user_type.replace('_', ' ') ?? ''} */}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}