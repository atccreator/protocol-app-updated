" use client";

import React, { JSX, useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Calendar,
  Clock,
  User,
  MapPin,
  Car,
  Home,
  FileText,
  ChevronRight,
  Plane,
  Train,
  Phone,
  Hash,
  AlertCircle,
  Users,
  Briefcase,
  CheckCircle,
  XCircle,
  Timer,
  LucideIcon
} from 'lucide-react';
import { 
  Request, 
  GuestUser,
  JourneyDetail,
  VehicleRequest,
  GuesthouseRequest,
  OtherRequest,
  ProtocolAssignment
} from '@/types/requestStatusCard';

// Type Definitions
interface RequestDashboardProps {
  data?: Request[];
}

interface StatusConfig {
  variant: "default" | "secondary" | "destructive" | "outline";
  icon: LucideIcon;
  className: string;
}

interface RequestCardProps {
  request: Request;
  onCardClick: (request: Request) => void;
}

interface RequestModalProps {
  request: Request | null;
  isOpen: boolean;
  onClose: () => void;
}

const RequestStatusCard: React.FC<RequestDashboardProps> = ({ data = [] }) => {
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const getStatusBadge = (status: string): JSX.Element => {
    const statusConfig: Record<string, StatusConfig> = {
      pending: { variant: 'outline', icon: Timer, className: 'border-yellow-500 text-yellow-700' },
      approved: { variant: 'outline', icon: CheckCircle, className: 'border-green-500 text-green-700' },
      rejected: { variant: 'outline', icon: XCircle, className: 'border-red-500 text-red-700' },
      completed: { variant: 'outline', icon: CheckCircle, className: 'border-blue-500 text-blue-700' },
      assigned: { variant: 'outline', icon: User, className: 'border-purple-500 text-purple-700' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className={`${config.className} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string | undefined): JSX.Element => {
    const priorityConfig: Record<string, string> = {
      high: 'bg-red-100 text-red-700 border-red-300',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      low: 'bg-green-100 text-green-700 border-green-300'
    };
    
    return (
      <Badge variant="outline" className={priorityConfig[priority || ''] || priorityConfig.medium}>
        {priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : 'Normal'}
      </Badge>
    );
  };

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string | null | undefined): string => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const handleCardClick = (request: Request): void => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const RequestCard: React.FC<RequestCardProps> = ({ request, onCardClick }) => {
    const latestAssignment = request.protocolAssignments?.[0];
    const firstJourney = request.journeyDetails?.sort((a, b) => a.leg_order - b.leg_order)[0];
    
    return (
      <Card 
        className="hover:shadow-lg transition-all duration-200 cursor-pointer border-gray-200 hover:border-gray-300"
        onClick={() => onCardClick(request)}
      >
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Hash className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-600">
                  Request #{request.id}
                </span>
                {request.movementNumber && (
                  <Badge variant="secondary" className="text-xs">
                    MV: {request.movementNumber}
                  </Badge>
                )}
              </div>
              <CardTitle className="text-lg line-clamp-1">
                {request.purpose || 'No purpose specified'}
              </CardTitle>
            </div>
            <div className="flex flex-wrap gap-2">
              {getStatusBadge(request.reqStatus)}
              {latestAssignment && getPriorityBadge(latestAssignment.priority)}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Users className="w-4 h-4" />
              <span>{request.guestUsers?.length || 0} Guest(s)</span>
            </div>
            
            {firstJourney && (
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(firstJourney.arrival_date)}</span>
              </div>
            )}
            
            {request.vehicleRequests?.length > 0 && (
              <div className="flex items-center gap-2 text-gray-600">
                <Car className="w-4 h-4" />
                <span>{request.vehicleRequests.length} Vehicle(s)</span>
              </div>
            )}
            
            {request.guesthouseRequests?.length > 0 && (
              <div className="flex items-center gap-2 text-gray-600">
                <Home className="w-4 h-4" />
                <span>Accommodation</span>
              </div>
            )}
          </div>
          
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Created: {formatDate(request.createdAt)}
            </span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  };

  const RequestModal: React.FC<RequestModalProps> = ({ request, isOpen, onClose }) => {
    if (!request) return null;

    const getModeIcon = (mode: string): LucideIcon => {
      switch(mode) {
        case 'BYAIR': return Plane;
        case 'BYRAIL': return Train;
        case 'BYROAD': return Car;
        default: return MapPin;
      }
    };

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
              <div>
                <DialogTitle className="text-xl">
                  Request #{request.id}
                </DialogTitle>
                <DialogDescription className="mt-1">
                  {request.purpose}
                </DialogDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                {getStatusBadge(request.reqStatus)}
                {request.protocolAssignments?.[0] && 
                  getPriorityBadge(request.protocolAssignments[0].priority)}
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Guest Information */}
            {request.guestUsers?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Guest Information
                </h3>
                <div className="space-y-2">
                  {request.guestUsers.map((guest: GuestUser, idx: number) => (
                    <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Name: </span>
                          <span className="font-medium">
                            {guest.first_name} {guest.last_name}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Age: </span>
                          <span className="font-medium">{guest.age}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-gray-600" />
                          <span className="font-medium">{guest.contact_number}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Journey Details */}
            {request.journeyDetails?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Journey Details
                </h3>
                <div className="space-y-3">
                  {request.journeyDetails
                    .sort((a, b) => a.leg_order - b.leg_order)
                    .map((journey: JourneyDetail, idx: number) => {
                      const Icon = getModeIcon(journey.mode);
                      return (
                        <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-start gap-3">
                            <div className="mt-1">
                              <Icon className="w-5 h-5 text-gray-600" />
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  Leg {journey.leg_order}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  {journey.mode.replace('BY', '')}
                                </span>
                              </div>
                              <div className="text-sm">
                                <span className="font-medium">{journey.from_location}</span>
                                <span className="mx-2">→</span>
                                <span className="font-medium">{journey.to_location}</span>
                              </div>
                              <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                                {journey.train_number && (
                                  <span>Train: {journey.train_number}</span>
                                )}
                                {journey.flight_number && (
                                  <span>Flight: {journey.flight_number}</span>
                                )}
                                {journey.vehicle_number && (
                                  <span>Vehicle: {journey.vehicle_number}</span>
                                )}
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {formatDate(journey.arrival_date)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatTime(journey.arrival_time)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Vehicle Requests */}
            {request.vehicleRequests?.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Car className="w-4 h-4" />
                    Vehicle Requests
                  </h3>
                  <div className="space-y-2">
                    {request.vehicleRequests.map((vehicle: VehicleRequest, idx: number) => (
                      <div key={idx} className="bg-gray-50 p-3 rounded-lg text-sm">
                        <div className="font-medium mb-1">{vehicle.purpose}</div>
                        <div className="text-gray-600">
                          {vehicle.pickup_location} → {vehicle.destination}
                        </div>
                        {vehicle.vehicle_type && (
                          <Badge variant="secondary" className="mt-2 text-xs">
                            {vehicle.vehicle_type}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Guesthouse Requests */}
            {request.guesthouseRequests?.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Home className="w-4 h-4" />
                    Accommodation Requests
                  </h3>
                  <div className="space-y-2">
                    {request.guesthouseRequests.map((gh: GuesthouseRequest, idx: number) => (
                      <div key={idx} className="bg-gray-50 p-3 rounded-lg text-sm">
                        <div className="font-medium mb-1">{gh.purpose}</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-600">
                          <div>Check-in: {formatDate(gh.check_in_date)}</div>
                          <div>Check-out: {formatDate(gh.checkout_date)}</div>
                          <div>Guests: {gh.guest_count}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Other Requests */}
            {request.otherRequests?.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Other Requests
                  </h3>
                  <div className="space-y-2">
                    {request.otherRequests.map((other: OtherRequest, idx: number) => (
                      <div key={idx} className="bg-gray-50 p-3 rounded-lg text-sm">
                        {other.purpose}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Special Notes */}
            {request.specialNotes && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Special Notes
                  </h3>
                  <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-sm">
                    {request.specialNotes}
                  </div>
                </div>
              </>
            )}

            {/* Protocol Assignment */}
            {request.protocolAssignments?.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Protocol Assignment
                  </h3>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    {request.protocolAssignments.map((assignment: ProtocolAssignment, idx: number) => (
                      <div key={idx} className="space-y-2 text-sm">
                        <div className="flex flex-wrap gap-2">
                          {getStatusBadge(assignment.completion_status)}
                          {getPriorityBadge(assignment.priority)}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-600">
                          <div>Officer ID: {assignment.assigned_officer_id}</div>
                          <div>Assigned: {formatDate(assignment.assigned_at)}</div>
                        </div>
                        {assignment.officer_remarks && (
                          <div className="mt-2 pt-2 border-t">
                            <span className="text-gray-600">Remarks: </span>
                            {assignment.officer_remarks}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Request Dashboard</h1>
        <p className="text-gray-600 mt-1">Manage and track all your requests</p>
      </div>
      
      {data.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center gap-3">
            <FileText className="w-12 h-12 text-gray-400" />
            <div>
              <h3 className="font-semibold text-gray-900">No requests found</h3>
              <p className="text-sm text-gray-600 mt-1">
                Your requests will appear here once created
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {data.map((request) => (
            <RequestCard 
              key={request.id} 
              request={request} 
              onCardClick={handleCardClick}
            />
          ))}
        </div>
      )}
      
      <RequestModal 
        request={selectedRequest} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default RequestStatusCard;





// import { Card } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Calendar, MapPin, User, Hourglass, Circle } from "lucide-react";

// type RequestStatus = "approved" | "pending" | "rejected";

// interface RequestItem {
//   id: number;
//   code: string;
//   title: string;
//   status: RequestStatus;
//   dateTime: string;
//   location: string;
//   officer?: string;
// }

// const statusStyles: Record<RequestStatus, string> = {
//   approved: "bg-green-100 text-green-700 border-green-200",
//   pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
//   rejected: "bg-red-100 text-red-700 border-red-200",
// };

// const statusDot: Record<RequestStatus, string> = {
//   approved: "text-green-500",
//   pending: "text-yellow-500",
//   rejected: "text-red-500",
// };

// export function RecentRequests({ requests }: { requests: RequestItem[] }) {
//   return (
//     <div className="space-y-3">
//       <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
//         <h4 className="text-base font-semibold text-gray-800 flex items-center gap-2">
//           🚨 Recent Requests
//         </h4>
//       </div>

//       {requests.map((req) => (
//         <Card
//           key={req.id}
//           className="rounded-xl border shadow-sm hover:shadow-md transition p-3"
//         >
//           <div className="flex items-center justify-between">
//             <div className="text-sm text-gray-800">
//               <span className="font-semibold">{req.code}</span> – {req.title}
//             </div>
//             <Badge
//               className={`${
//                 statusStyles[req.status]
//               } flex items-center gap-1 text-xs`}
//               variant="outline"
//             >
//               <Circle className={`h-2 w-2 ${statusDot[req.status]}`} />
//               {req.status}
//             </Badge>
//           </div>

//           <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-600">
//             <span className="flex items-center gap-1">
//               <Calendar className="h-3.5 w-3.5 text-gray-500" /> {req.dateTime}
//             </span>
//             <span className="flex items-center gap-1">
//               <MapPin className="h-3.5 w-3.5 text-gray-500" /> {req.location}
//             </span>
//             {req.officer ? (
//               <span className="flex items-center gap-1">
//                 <User className="h-3.5 w-3.5 text-gray-500" /> {req.officer}
//               </span>
//             ) : (
//               <span className="flex items-center gap-1">
//                 <Hourglass className="h-3.5 w-3.5 text-gray-500" /> Awaiting
//               </span>
//             )}
//           </div>
//         </Card>
//       ))}
//     </div>
//   );
// }
