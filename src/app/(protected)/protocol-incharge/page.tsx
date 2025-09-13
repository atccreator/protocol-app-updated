'use client';

import { useRBAC } from '@/contexts/auth-context';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, FileText, CheckCircle, Clock } from 'lucide-react';

const sampleRequests = [
  {
    id: 22,
    code: "MOV-2025-001",
    title: "Court Visit at bhopal",
    status: "approved" as const,
    dateTime: "Today 2:00 PM",
    location: "High Court",
    officer: "Mr. Kumar",
  },
  {
    id: 23,
    code: "MOV-2025-002",
    title: "Airport Pickup",
    status: "pending" as const,
    dateTime: "Tomorrow 8:00 AM",
    location: "Airport",
  },
]

export default function DashboardPage() {
  const { user, isAdmin, isProtocolOfficer, isProtocolIncharge } = useRBAC();

  // Default dashboard for other user types
  const stats = [
    {
      title: 'Total Requests',
      value: '124',
      description: 'All time requests',
      icon: FileText,
      color: 'bg-blue-500',
    },
    {
      title: 'Pending',
      value: '23',
      description: 'Awaiting approval',
      icon: Clock,
      color: 'bg-yellow-500',
    },
    {
      title: 'Approved',
      value: '89',
      description: 'Successfully processed',
      icon: CheckCircle,
      color: 'bg-green-500',
    },
    {
      title: 'Active Users',
      value: '56',
      description: 'System users',
      icon: Users,
      color: 'bg-purple-500',
    },
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'protocol_incharge':
        return 'bg-blue-100 text-blue-800';
      case 'protocol_officer':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here's what's happening with your protocols today.
          </p>
        </div>
        <Badge className={getRoleColor(user?.user_type || '')}>
          {/* {user?.user_type.replace('_', ' ').toUpperCase()} */}
          {(user?.user_type ?? "USER").replace("_", " ").toUpperCase()}
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${stat.color}`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Role-based Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks for your role
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isAdmin && (
              <div className="p-4 bg-red-50 rounded-lg">
                <h3 className="font-semibold text-red-900">Admin Actions</h3>
                <p className="text-sm text-red-700">
                  Manage users, system settings, and view all data
                </p>
              </div>
            )}
            {isProtocolIncharge && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900">Protocol In-charge</h3>
                <p className="text-sm text-blue-700">
                  Approve requests and manage protocol workflows
                </p>
              </div>
            )}
            {isProtocolOfficer && (
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-900">Protocol Officer</h3>
                <p className="text-sm text-green-700">
                  Handle protocol requests and process applications
                </p>
              </div>
            )}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900">General</h3>
              <p className="text-sm text-gray-700">
                View profile, update settings, and track your requests
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates and notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <div className="flex-1">
                <p className="text-sm font-medium">Request #123 approved</p>
                <p className="text-xs text-gray-600">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <div className="flex-1">
                <p className="text-sm font-medium">New user registered</p>
                <p className="text-xs text-gray-600">4 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-yellow-500 rounded-full" />
              <div className="flex-1">
                <p className="text-sm font-medium">Request #122 pending review</p>
                <p className="text-xs text-gray-600">6 hours ago</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
