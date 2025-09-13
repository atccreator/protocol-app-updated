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
import RequestForm from '@/components/RequestForm';
import RequestStatusCard from '@/components/RequestStatusCard';

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

  // Check if user is a requestee
  const isRequestee = user?.user_type === 'requestee';

  // If user is a requestee, show the request form
  if (isRequestee) {
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
        <RequestStatusCard/>
      </div>
    );
  }

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





/////////////////////////////////////////////////////////////////////////////////////////////////////
// // app/(protected)/dashboard/page.tsx
// 'use client';

// import { useRBAC } from '@/contexts/auth-context';
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Users, FileText, CheckCircle, Clock } from 'lucide-react';

// export default function DashboardPage() {
//   const { user, isAdmin, isProtocolOfficer, isProtocolIncharge } = useRBAC();

//   const stats = [
//     {
//       title: 'Total Requests',
//       value: '124',
//       description: 'All time requests',
//       icon: FileText,
//       color: 'bg-blue-500',
//     },
//     {
//       title: 'Pending',
//       value: '23',
//       description: 'Awaiting approval',
//       icon: Clock,
//       color: 'bg-yellow-500',
//     },
//     {
//       title: 'Approved',
//       value: '89',
//       description: 'Successfully processed',
//       icon: CheckCircle,
//       color: 'bg-green-500',
//     },
//     {
//       title: 'Active Users',
//       value: '56',
//       description: 'System users',
//       icon: Users,
//       color: 'bg-purple-500',
//     },
//   ];

//   const getRoleColor = (role: string) => {
//     switch (role) {
//       case 'admin':
//         return 'bg-red-100 text-red-800';
//       case 'protocol_incharge':
//         return 'bg-blue-100 text-blue-800';
//       case 'protocol_officer':
//         return 'bg-green-100 text-green-800';
//       default:
//         return 'bg-gray-100 text-gray-800';
//     }
//   };

//   return (
//     <div className="space-y-6">
//       {/* Welcome Section */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">
//             Welcome back, {user?.username}!
//           </h1>
//           <p className="text-gray-600 mt-2">
//             Here's what's happening with your protocols today.
//           </p>
//         </div>
//         <Badge className={getRoleColor(user?.user_type || '')}>
//           {user?.user_type.replace('_', ' ').toUpperCase()}
//         </Badge>
//       </div>

//       {/* Stats Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         {stats.map((stat) => {
//           const Icon = stat.icon;
//           return (
//             <Card key={stat.title}>
//               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                 <CardTitle className="text-sm font-medium">
//                   {stat.title}
//                 </CardTitle>
//                 <div className={`p-2 rounded-full ${stat.color}`}>
//                   <Icon className="h-4 w-4 text-white" />
//                 </div>
//               </CardHeader>
//               <CardContent>
//                 <div className="text-2xl font-bold">{stat.value}</div>
//                 <p className="text-xs text-muted-foreground">
//                   {stat.description}
//                 </p>
//               </CardContent>
//             </Card>
//           );
//         })}
//       </div>

//       {/* Role-based Content */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Quick Actions */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Quick Actions</CardTitle>
//             <CardDescription>
//               Common tasks for your role
//             </CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             {isAdmin && (
//               <div className="p-4 bg-red-50 rounded-lg">
//                 <h3 className="font-semibold text-red-900">Admin Actions</h3>
//                 <p className="text-sm text-red-700">
//                   Manage users, system settings, and view all data
//                 </p>
//               </div>
//             )}
//             {isProtocolIncharge && (
//               <div className="p-4 bg-blue-50 rounded-lg">
//                 <h3 className="font-semibold text-blue-900">Protocol In-charge</h3>
//                 <p className="text-sm text-blue-700">
//                   Approve requests and manage protocol workflows
//                 </p>
//               </div>
//             )}
//             {isProtocolOfficer && (
//               <div className="p-4 bg-green-50 rounded-lg">
//                 <h3 className="font-semibold text-green-900">Protocol Officer</h3>
//                 <p className="text-sm text-green-700">
//                   Handle protocol requests and process applications
//                 </p>
//               </div>
//             )}
//             <div className="p-4 bg-gray-50 rounded-lg">
//               <h3 className="font-semibold text-gray-900">General</h3>
//               <p className="text-sm text-gray-700">
//                 View profile, update settings, and track your requests
//               </p>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Recent Activity */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Recent Activity</CardTitle>
//             <CardDescription>
//               Latest updates and notifications
//             </CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
//               <div className="w-2 h-2 bg-green-500 rounded-full" />
//               <div className="flex-1">
//                 <p className="text-sm font-medium">Request #123 approved</p>
//                 <p className="text-xs text-gray-600">2 hours ago</p>
//               </div>
//             </div>
//             <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
//               <div className="w-2 h-2 bg-blue-500 rounded-full" />
//               <div className="flex-1">
//                 <p className="text-sm font-medium">New user registered</p>
//                 <p className="text-xs text-gray-600">4 hours ago</p>
//               </div>
//             </div>
//             <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
//               <div className="w-2 h-2 bg-yellow-500 rounded-full" />
//               <div className="flex-1">
//                 <p className="text-sm font-medium">Request #122 pending review</p>
//                 <p className="text-xs text-gray-600">6 hours ago</p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }





//////////////////////////////////////////////////////////////////////////////////////////////////////////
// 'use client'

// import React, { useState } from 'react'
// import { useForm, useFieldArray } from 'react-hook-form'
// import { zodResolver } from '@hookform/resolvers/zod'
// import * as z from 'zod'
// import { Button } from '@/components/ui/button'
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from '@/components/ui/form'
// import { Input } from '@/components/ui/input'
// import { Textarea } from '@/components/ui/textarea'
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select'
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { Plus, Trash2, Calendar, Clock, MapPin, Users, Loader2, Send } from 'lucide-react'
// import { toast } from "sonner"

// // Enhanced Zod schema with better validation
// const formSchema = z.object({
//   requesteeId: z.number().min(1, 'Requestee ID is required'),
//   guestCount: z.number().min(1, 'Guest count must be at least 1'),
//   purpose: z.string().optional(),
//   fromLocation: z.string().min(1, 'From location is required'),
//   toLocation: z.string().min(1, 'To location is required'),
//   modeOfArrival: z.enum(['BYROAD', 'BYAIR', 'BYRAIL']),
//   arrivalDate: z.string().min(1, 'Arrival date is required'),
//   arrivalTime: z.string().min(1, 'Arrival time is required'),
//   departureDate: z.string().min(1, 'Departure date is required'),
//   departureTime: z.string().min(1, 'Departure time is required'),
//   specialNotes: z.string().optional(),
//   vehicleRequests: z.array(z.object({
//     vehicleType: z.string().min(1, 'Vehicle type is required'),
//     vehicleNumber: z.string().min(1, 'Vehicle number is required'),
//     driverName: z.string().min(1, 'Driver name is required'),
//     driverContactNo: z.string().min(1, 'Driver contact is required'),
//     pickupLocation: z.string().min(1, 'Pickup location is required'),
//     destination: z.string().min(1, 'Destination is required'),
//     purpose: z.string().min(1, 'Purpose is required'),
//   })),
//   guesthouseRequests: z.array(z.object({
//     guesthouseLocation: z.string().min(1, 'Guesthouse location is required'),
//     checkInDate: z.string().min(1, 'Check-in date is required'),
//     checkoutDate: z.string().min(1, 'Check-out date is required'),
//     purpose: z.string().min(1, 'Purpose is required'),
//     guestCount: z.number().min(1, 'Guest count is required'),
//   })),
//   otherRequests: z.array(z.object({
//     purpose: z.string().min(1, 'Purpose is required'),
//   })),
// }).refine((data) => {
//   // Ensure departure is after arrival
//   return new Date(data.departureDate) >= new Date(data.arrivalDate);
// }, {
//   message: "Departure date must be after or equal to arrival date",
//   path: ["departureDate"],
// });

// type FormData = z.infer<typeof formSchema>

// export default function RequestForm() {
//   const [isSubmitting, setIsSubmitting] = useState(false)
  
//   const form = useForm<FormData>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       requesteeId: 101,
//       guestCount: 1,
//       purpose: '',
//       fromLocation: '',
//       toLocation: '',
//       modeOfArrival: 'BYROAD',
//       arrivalDate: '',
//       arrivalTime: '',
//       departureDate: '',
//       departureTime: '',
//       specialNotes: '',
//       vehicleRequests: [],
//       guesthouseRequests: [],
//       otherRequests: [],
//     },
//   })

//   const {
//     fields: vehicleFields,
//     append: appendVehicle,
//     remove: removeVehicle,
//   } = useFieldArray({
//     control: form.control,
//     name: 'vehicleRequests',
//   })

//   const {
//     fields: guesthouseFields,
//     append: appendGuesthouse,
//     remove: removeGuesthouse,
//   } = useFieldArray({
//     control: form.control,
//     name: 'guesthouseRequests',
//   })

//   const {
//     fields: otherFields,
//     append: appendOther,
//     remove: removeOther,
//   } = useFieldArray({
//     control: form.control,
//     name: 'otherRequests',
//   })

//   const onSubmit = async (data: FormData) => {
//     setIsSubmitting(true)
    
//     try {
//       console.log('Submitting data:', data) // Debug log
      
//       // Validate the backend URL
//       const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
//       const endpoint = `${backendUrl}/api/v1/create-request`
      
//       console.log('Posting to:', endpoint) // Debug log
      
//       const response = await fetch(endpoint, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Accept': 'application/json',
//         },
//         body: JSON.stringify(data),
//       })

//       console.log('Response status:', response.status) // Debug log
//       console.log('Response headers:', response.headers) // Debug log

//       if (!response.ok) {
//         const errorData = await response.text()
//         console.error('Error response:', errorData) // Debug log
//         throw new Error(`HTTP error! status: ${response.status}`)
//       }

//       const responseData = await response.json()
//       console.log('Success response:', responseData) // Debug log
      
//       toast.success('Request submitted successfully!')
//       form.reset()
      
//     } catch (error) {
//       console.error('Submission error:', error) // Debug log
//       toast.error(`Failed to submit request: ${error instanceof Error ? error.message : 'Unknown error'}`)
//     } finally {
//       setIsSubmitting(false)
//     }
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8 px-4">
//       <div className="max-w-5xl mx-auto">
//         <div className="text-center mb-12">
//           <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4">
//             <Send className="w-8 h-8 text-white" />
//           </div>
//           <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
//             Official Visit Request
//           </h1>
//           <p className="text-xl text-gray-600 max-w-2xl mx-auto">
//             Submit your comprehensive request for official visit arrangements
//           </p>
//         </div>

//         <Form {...form}>
//           <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
//             {/* Basic Information */}
//             <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-lg overflow-hidden">
//               <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
//                 <CardTitle className="flex items-center gap-3 text-xl">
//                   <Users className="w-6 h-6" />
//                   Basic Information
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="p-8 space-y-6">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <FormField
//                     control={form.control}
//                     name="requesteeId"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel className="text-sm font-semibold text-gray-700">Requestee ID</FormLabel>
//                         <FormControl>
//                           <Input
//                             type="number"
//                             {...field}
//                             onChange={(e) => field.onChange(Number(e.target.value) || '')}
//                             className="h-12 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
//                           />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />

//                   <FormField
//                     control={form.control}
//                     name="guestCount"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel className="text-sm font-semibold text-gray-700">Guest Count</FormLabel>
//                         <FormControl>
//                           <Input
//                             type="number"
//                             min="1"
//                             {...field}
//                             onChange={(e) => field.onChange(Number(e.target.value) || '')}
//                             className="h-12 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
//                           />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                 </div>

//                 <FormField
//                   control={form.control}
//                   name="purpose"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel className="text-sm font-semibold text-gray-700">Purpose of Visit</FormLabel>
//                       <FormControl>
//                         <Textarea
//                           {...field}
//                           className="min-h-[120px] border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-none"
//                           placeholder="Please provide detailed information about the purpose of your visit..."
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//               </CardContent>
//             </Card>

//             {/* Travel Information */}
//             <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-lg overflow-hidden">
//               <CardHeader className="bg-gradient-to-r from-emerald-600 to-green-600 text-white">
//                 <CardTitle className="flex items-center gap-3 text-xl">
//                   <MapPin className="w-6 h-6" />
//                   Travel Information
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="p-8 space-y-6">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <FormField
//                     control={form.control}
//                     name="fromLocation"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel className="text-sm font-semibold text-gray-700">From Location</FormLabel>
//                         <FormControl>
//                           <Input 
//                             {...field} 
//                             className="h-12 border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200" 
//                             placeholder="Enter departure location"
//                           />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />

//                   <FormField
//                     control={form.control}
//                     name="toLocation"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel className="text-sm font-semibold text-gray-700">To Location</FormLabel>
//                         <FormControl>
//                           <Input 
//                             {...field} 
//                             className="h-12 border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200" 
//                             placeholder="Enter destination location"
//                           />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                 </div>

//                 <FormField
//                   control={form.control}
//                   name="modeOfArrival"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel className="text-sm font-semibold text-gray-700">Mode of Arrival</FormLabel>
//                       <Select onValueChange={field.onChange} value={field.value}>
//                         <FormControl>
//                           <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200">
//                             <SelectValue placeholder="Select mode of arrival" />
//                           </SelectTrigger>
//                         </FormControl>
//                         <SelectContent>
//                           <SelectItem value="BYROAD">🚗 By Road</SelectItem>
//                           <SelectItem value="BYAIR">✈️ By Air</SelectItem>
//                           <SelectItem value="BYRAIL">🚂 By Rail</SelectItem>
//                         </SelectContent>
//                       </Select>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />

//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//                   <FormField
//                     control={form.control}
//                     name="arrivalDate"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel className="flex items-center gap-2 text-sm font-semibold text-gray-700">
//                           <Calendar className="w-4 h-4" />
//                           Arrival Date
//                         </FormLabel>
//                         <FormControl>
//                           <Input 
//                             type="date" 
//                             {...field} 
//                             className="h-12 border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200" 
//                           />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />

//                   <FormField
//                     control={form.control}
//                     name="arrivalTime"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel className="flex items-center gap-2 text-sm font-semibold text-gray-700">
//                           <Clock className="w-4 h-4" />
//                           Arrival Time
//                         </FormLabel>
//                         <FormControl>
//                           <Input 
//                             type="time" 
//                             {...field} 
//                             className="h-12 border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200" 
//                           />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />

//                   <FormField
//                     control={form.control}
//                     name="departureDate"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel className="flex items-center gap-2 text-sm font-semibold text-gray-700">
//                           <Calendar className="w-4 h-4" />
//                           Departure Date
//                         </FormLabel>
//                         <FormControl>
//                           <Input 
//                             type="date" 
//                             {...field} 
//                             className="h-12 border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200" 
//                           />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />

//                   <FormField
//                     control={form.control}
//                     name="departureTime"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel className="flex items-center gap-2 text-sm font-semibold text-gray-700">
//                           <Clock className="w-4 h-4" />
//                           Departure Time
//                         </FormLabel>
//                         <FormControl>
//                           <Input 
//                             type="time" 
//                             {...field} 
//                             className="h-12 border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200" 
//                           />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                 </div>

//                 <FormField
//                   control={form.control}
//                   name="specialNotes"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel className="text-sm font-semibold text-gray-700">Special Notes</FormLabel>
//                       <FormControl>
//                         <Textarea
//                           {...field}
//                           className="min-h-[120px] border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200 resize-none"
//                           placeholder="Any special requirements, dietary restrictions, accessibility needs, etc..."
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//               </CardContent>
//             </Card>

//             {/* Vehicle Requests */}
//             <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-lg overflow-hidden">
//               <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
//                 <CardTitle className="flex items-center justify-between text-xl">
//                   <span className="flex items-center gap-3">
//                     🚗 Vehicle Requests
//                   </span>
//                   <Button
//                     type="button"
//                     variant="secondary"
//                     size="sm"
//                     onClick={() =>
//                       appendVehicle({
//                         vehicleType: '',
//                         vehicleNumber: '',
//                         driverName: '',
//                         driverContactNo: '',
//                         pickupLocation: '',
//                         destination: '',
//                         purpose: '',
//                       })
//                     }
//                     className="bg-white text-purple-600 hover:bg-purple-50 border-0 shadow-md hover:shadow-lg transition-all duration-200"
//                   >
//                     <Plus className="w-4 h-4 mr-1" />
//                     Add Vehicle
//                   </Button>
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="p-8">
//                 {vehicleFields.length === 0 ? (
//                   <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
//                     <div className="text-4xl mb-4">🚗</div>
//                     <p className="text-gray-500 text-lg">No vehicle requests added yet.</p>
//                     <p className="text-gray-400 text-sm">Click "Add Vehicle" to get started</p>
//                   </div>
//                 ) : (
//                   <div className="space-y-6">
//                     {vehicleFields.map((field, index) => (
//                       <div key={field.id} className="border-2 border-gray-200 rounded-xl p-6 bg-gradient-to-br from-purple-50 to-pink-50">
//                         <div className="flex justify-between items-center mb-6">
//                           <h4 className="font-bold text-lg text-purple-700">🚗 Vehicle #{index + 1}</h4>
//                           <Button
//                             type="button"
//                             variant="destructive"
//                             size="sm"
//                             onClick={() => removeVehicle(index)}
//                             className="shadow-md hover:shadow-lg transition-all duration-200"
//                           >
//                             <Trash2 className="w-4 h-4" />
//                           </Button>
//                         </div>
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                           <FormField
//                             control={form.control}
//                             name={`vehicleRequests.${index}.vehicleType`}
//                             render={({ field }) => (
//                               <FormItem>
//                                 <FormLabel className="text-sm font-semibold text-gray-700">Vehicle Type</FormLabel>
//                                 <FormControl>
//                                   <Select onValueChange={field.onChange} value={field.value}>
//                                     <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200">
//                                       <SelectValue placeholder="Select vehicle type" />
//                                     </SelectTrigger>
//                                     <SelectContent>
//                                       <SelectItem value="SUV">🚙 SUV</SelectItem>
//                                       <SelectItem value="Sedan">🚗 Sedan</SelectItem>
//                                       <SelectItem value="Hatchback">🚘 Hatchback</SelectItem>
//                                       <SelectItem value="Bus">🚌 Bus</SelectItem>
//                                       <SelectItem value="Van">🚐 Van</SelectItem>
//                                     </SelectContent>
//                                   </Select>
//                                 </FormControl>
//                                 <FormMessage />
//                               </FormItem>
//                             )}
//                           />

//                           <FormField
//                             control={form.control}
//                             name={`vehicleRequests.${index}.vehicleNumber`}
//                             render={({ field }) => (
//                               <FormItem>
//                                 <FormLabel className="text-sm font-semibold text-gray-700">Vehicle Number</FormLabel>
//                                 <FormControl>
//                                   <Input 
//                                     {...field} 
//                                     placeholder="e.g., DL01AB1234" 
//                                     className="h-12 border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
//                                   />
//                                 </FormControl>
//                                 <FormMessage />
//                               </FormItem>
//                             )}
//                           />

//                           <FormField
//                             control={form.control}
//                             name={`vehicleRequests.${index}.driverName`}
//                             render={({ field }) => (
//                               <FormItem>
//                                 <FormLabel className="text-sm font-semibold text-gray-700">Driver Name</FormLabel>
//                                 <FormControl>
//                                   <Input 
//                                     {...field} 
//                                     placeholder="Enter driver name"
//                                     className="h-12 border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
//                                   />
//                                 </FormControl>
//                                 <FormMessage />
//                               </FormItem>
//                             )}
//                           />

//                           <FormField
//                             control={form.control}
//                             name={`vehicleRequests.${index}.driverContactNo`}
//                             render={({ field }) => (
//                               <FormItem>
//                                 <FormLabel className="text-sm font-semibold text-gray-700">Driver Contact</FormLabel>
//                                 <FormControl>
//                                   <Input 
//                                     {...field} 
//                                     placeholder="+91-9876543210" 
//                                     className="h-12 border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
//                                   />
//                                 </FormControl>
//                                 <FormMessage />
//                               </FormItem>
//                             )}
//                           />

//                           <FormField
//                             control={form.control}
//                             name={`vehicleRequests.${index}.pickupLocation`}
//                             render={({ field }) => (
//                               <FormItem>
//                                 <FormLabel className="text-sm font-semibold text-gray-700">Pickup Location</FormLabel>
//                                 <FormControl>
//                                   <Input 
//                                     {...field} 
//                                     placeholder="Enter pickup location"
//                                     className="h-12 border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
//                                   />
//                                 </FormControl>
//                                 <FormMessage />
//                               </FormItem>
//                             )}
//                           />

//                           <FormField
//                             control={form.control}
//                             name={`vehicleRequests.${index}.destination`}
//                             render={({ field }) => (
//                               <FormItem>
//                                 <FormLabel className="text-sm font-semibold text-gray-700">Destination</FormLabel>
//                                 <FormControl>
//                                   <Input 
//                                     {...field} 
//                                     placeholder="Enter destination"
//                                     className="h-12 border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
//                                   />
//                                 </FormControl>
//                                 <FormMessage />
//                               </FormItem>
//                             )}
//                           />
//                         </div>

//                         <FormField
//                           control={form.control}
//                           name={`vehicleRequests.${index}.purpose`}
//                           render={({ field }) => (
//                             <FormItem className="mt-4">
//                               <FormLabel className="text-sm font-semibold text-gray-700">Purpose</FormLabel>
//                               <FormControl>
//                                 <Input 
//                                   {...field} 
//                                   placeholder="Enter purpose for this vehicle"
//                                   className="h-12 border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
//                                 />
//                               </FormControl>
//                               <FormMessage />
//                             </FormItem>
//                           )}
//                         />
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </CardContent>
//             </Card>

//             {/* Guesthouse Requests */}
//             <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-lg overflow-hidden">
//               <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
//                 <CardTitle className="flex items-center justify-between text-xl">
//                   <span className="flex items-center gap-3">
//                     🏨 Guesthouse Requests
//                   </span>
//                   <Button
//                     type="button"
//                     variant="secondary"
//                     size="sm"
//                     onClick={() =>
//                       appendGuesthouse({
//                         guesthouseLocation: '',
//                         checkInDate: '',
//                         checkoutDate: '',
//                         purpose: '',
//                         guestCount: 1,
//                       })
//                     }
//                     className="bg-white text-orange-600 hover:bg-orange-50 border-0 shadow-md hover:shadow-lg transition-all duration-200"
//                   >
//                     <Plus className="w-4 h-4 mr-1" />
//                     Add Guesthouse
//                   </Button>
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="p-8">
//                 {guesthouseFields.length === 0 ? (
//                   <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
//                     <div className="text-4xl mb-4">🏨</div>
//                     <p className="text-gray-500 text-lg">No guesthouse requests added yet.</p>
//                     <p className="text-gray-400 text-sm">Click "Add Guesthouse" to get started</p>
//                   </div>
//                 ) : (
//                   <div className="space-y-6">
//                     {guesthouseFields.map((field, index) => (
//                       <div key={field.id} className="border-2 border-gray-200 rounded-xl p-6 bg-gradient-to-br from-orange-50 to-red-50">
//                         <div className="flex justify-between items-center mb-6">
//                           <h4 className="font-bold text-lg text-orange-700">🏨 Guesthouse #{index + 1}</h4>
//                           <Button
//                             type="button"
//                             variant="destructive"
//                             size="sm"
//                             onClick={() => removeGuesthouse(index)}
//                             className="shadow-md hover:shadow-lg transition-all duration-200"
//                           >
//                             <Trash2 className="w-4 h-4" />
//                           </Button>
//                         </div>
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                           <FormField
//                             control={form.control}
//                             name={`guesthouseRequests.${index}.guesthouseLocation`}
//                             render={({ field }) => (
//                               <FormItem>
//                                 <FormLabel className="text-sm font-semibold text-gray-700">Guesthouse Location</FormLabel>
//                                 <FormControl>
//                                   <Input 
//                                     {...field} 
//                                     placeholder="Enter guesthouse location"
//                                     className="h-12 border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
//                                   />
//                                 </FormControl>
//                                 <FormMessage />
//                               </FormItem>
//                             )}
//                           />

//                           <FormField
//                             control={form.control}
//                             name={`guesthouseRequests.${index}.guestCount`}
//                             render={({ field }) => (
//                               <FormItem>
//                                 <FormLabel className="text-sm font-semibold text-gray-700">Guest Count</FormLabel>
//                                 <FormControl>
//                                   <Input
//                                     type="number"
//                                     min="1"
//                                     {...field}
//                                     onChange={(e) => field.onChange(Number(e.target.value) || 1)}
//                                     className="h-12 border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
//                                   />
//                                 </FormControl>
//                                 <FormMessage />
//                               </FormItem>
//                             )}
//                           />

//                           <FormField
//                             control={form.control}
//                             name={`guesthouseRequests.${index}.checkInDate`}
//                             render={({ field }) => (
//                               <FormItem>
//                                 <FormLabel className="text-sm font-semibold text-gray-700">Check-in Date</FormLabel>
//                                 <FormControl>
//                                   <Input 
//                                     type="date" 
//                                     {...field} 
//                                     className="h-12 border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
//                                   />
//                                 </FormControl>
//                                 <FormMessage />
//                               </FormItem>
//                             )}
//                           />

//                           <FormField
//                             control={form.control}
//                             name={`guesthouseRequests.${index}.checkoutDate`}
//                             render={({ field }) => (
//                               <FormItem>
//                                 <FormLabel className="text-sm font-semibold text-gray-700">Check-out Date</FormLabel>
//                                 <FormControl>
//                                   <Input 
//                                     type="date" 
//                                     {...field} 
//                                     className="h-12 border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
//                                   />
//                                 </FormControl>
//                                 <FormMessage />
//                               </FormItem>
//                             )}
//                           />
//                         </div>

//                         <FormField
//                           control={form.control}
//                           name={`guesthouseRequests.${index}.purpose`}
//                           render={({ field }) => (
//                             <FormItem className="mt-4">
//                               <FormLabel className="text-sm font-semibold text-gray-700">Purpose</FormLabel>
//                               <FormControl>
//                                 <Input 
//                                   {...field} 
//                                   placeholder="Enter purpose for this accommodation"
//                                   className="h-12 border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
//                                 />
//                               </FormControl>
//                               <FormMessage />
//                             </FormItem>
//                           )}
//                         />
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </CardContent>
//             </Card>

//             {/* Other Requests */}
//             <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-lg overflow-hidden">
//               <CardHeader className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white">
//                 <CardTitle className="flex items-center justify-between text-xl">
//                   <span className="flex items-center gap-3">
//                     📋 Other Requests
//                   </span>
//                   <Button
//                     type="button"
//                     variant="secondary"
//                     size="sm"
//                     onClick={() => appendOther({ purpose: '' })}
//                     className="bg-white text-teal-600 hover:bg-teal-50 border-0 shadow-md hover:shadow-lg transition-all duration-200"
//                   >
//                     <Plus className="w-4 h-4 mr-1" />
//                     Add Other
//                   </Button>
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="p-8">
//                 {otherFields.length === 0 ? (
//                   <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
//                     <div className="text-4xl mb-4">📋</div>
//                     <p className="text-gray-500 text-lg">No other requests added yet.</p>
//                     <p className="text-gray-400 text-sm">Click "Add Other" to include additional requirements</p>
//                   </div>
//                 ) : (
//                   <div className="space-y-4">
//                     {otherFields.map((field, index) => (
//                       <div key={field.id} className="flex gap-4 items-end p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg border-2 border-gray-200">
//                         <FormField
//                           control={form.control}
//                           name={`otherRequests.${index}.purpose`}
//                           render={({ field }) => (
//                             <FormItem className="flex-1">
//                               <FormLabel className="text-sm font-semibold text-gray-700">Purpose</FormLabel>
//                               <FormControl>
//                                 <Input 
//                                   {...field} 
//                                   placeholder="Enter additional request details"
//                                   className="h-12 border-2 border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
//                                 />
//                               </FormControl>
//                               <FormMessage />
//                             </FormItem>
//                           )}
//                         />
//                         <Button
//                           type="button"
//                           variant="destructive"
//                           size="sm"
//                           onClick={() => removeOther(index)}
//                           className="shadow-md hover:shadow-lg transition-all duration-200"
//                         >
//                           <Trash2 className="w-4 h-4" />
//                         </Button>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </CardContent>
//             </Card>

//             {/* Submit Button */}
//             <div className="flex justify-center pt-8">
//               <Button
//                 type="submit"
//                 size="lg"
//                 disabled={isSubmitting}
//                 className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-16 py-4 text-lg font-bold shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-3xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
//               >
//                 {isSubmitting ? (
//                   <>
//                     <Loader2 className="w-6 h-6 mr-3 animate-spin" />
//                     Submitting Request...
//                   </>
//                 ) : (
//                   <>
//                     <Send className="w-6 h-6 mr-3" />
//                     Submit Request
//                   </>
//                 )}
//               </Button>
//             </div>
//           </form>
//         </Form>
//       </div>
//     </div>
//   )
// }