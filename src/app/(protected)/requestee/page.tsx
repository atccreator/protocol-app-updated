'use client';

import { useRBAC } from '@/contexts/auth-context';
import { Badge } from '@/components/ui/badge';
import RequestForm from '@/components/RequestForm';

export default function DashboardPage() {
  const { user, isAdmin, isProtocolOfficer, isProtocolIncharge, isRequestee } = useRBAC();

  // If user is a requestee, show the request form
    return (
      <div className="space-y-2">
        {/* Welcome Section for Requestee */}
        
        <div className="flex items-center justify-between bg-blue-50 border-l-4 border-blue-400 p-3 rounded w-full">
            <h1 className="text-2xl font-bold text-gray-900">
              🧑‍💼 Welcome, <span className='text-blue-500'>{user?.username}!</span>
            </h1>
            {/* <p className=" text-gray-400">
              Submit Your Official Visit Requests.
            </p> */}
          <Badge className="bg-indigo-100 text-indigo-800">
            {/* {user?.user_type.replace('_', ' ').toUpperCase()} */}
            {(user?.user_type ?? "USER").replace("_", " ").toUpperCase()}
          </Badge>          
        </div>

        {/* Request Form */}
        <RequestForm />
      </div>
    );
  }
