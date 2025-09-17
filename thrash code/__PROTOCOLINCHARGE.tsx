import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, 
  Calendar, 
  User, 
  Car, 
  Building, 
  FileText, 
  Clock, 
  ArrowRight,
  Users,
  Phone,
  Mail
} from 'lucide-react';
import { protocolInchargeApi, usersApi } from '@/lib/api';

// Types based on your ER diagram
interface JourneyLeg {
  id: number;
  request_id: number;
  leg_order: number;
  mode: 'BYROAD' | 'BYAIR' | 'BYRAIL';
  from_location: string;
  to_location: string;
  train_number?: string;
  flight_number?: string;
  vehicle_number?: string;
  arrival_date?: string;
  arrival_time?: string;
  departure_date?: string;
  departure_time?: string;
}

interface ServiceRequest {
  vehicle_requests?: Array<{
    id: number;
    vehicle_type?: string;
    vehicle_number?: string;
    driver_name?: string;
    driver_contact_no?: string;
    service_status: string;
  }>;
  guesthouse_requests?: Array<{
    id: number;
    guesthouse_location?: string;
    check_in_date?: string;
    checkout_date?: string;
    guest_count?: number;
    service_status: string;
  }>;
  other_requests?: Array<{
    id: number;
    purpose: string;
    service_status: string;
  }>;
}

interface ProtocolRequest {
  id: number;
  movement_number: string;
  requestee_id: number;
  purpose: string;
  req_status: string;
  created_at: string;
  special_notes?: string;
  journey_details: JourneyLeg[];
  guest_users: Array<{
    id: number;
    first_name: string;
    last_name: string;
    age: number;
    contact_number: string;
  }>;
  service_requests: ServiceRequest;
  protocol_assignments?: Array<{
    id: number;
    assigned_officer_id: number;
    assigned_by_incharge_id: number;
    officer_location_id: number;
    priority: 'high' | 'medium' | 'low';
    officer_remarks?: string;
    completion_status: string;
  }>;
}

interface ProtocolOfficer {
  id: number;
  username: string;
  email: string;
  user_type: string;
  // Add location info if available in your user table
}

// Validation schemas
const assignOfficerSchema = z.object({
  officerId: z.number().min(1, 'Please select an officer'),
  priority: z.enum(['high', 'medium', 'low']),
  remarks: z.string().optional(),
  officerLocationId: z.number().optional(),
});

const serviceRequestSchema = z.object({
  vehicleType: z.string().optional(),
  vehicleNumber: z.string().optional(),
  driverName: z.string().optional(),
  driverContact: z.string().optional(),
  guesthouseLocation: z.string().optional(),
  otherPurpose: z.string().optional(),
});

type AssignOfficerForm = z.infer<typeof assignOfficerSchema>;
type ServiceRequestForm = z.infer<typeof serviceRequestSchema>;

const ProtocolInchargeDashboard: React.FC = () => {
  const [requests, setRequests] = useState<ProtocolRequest[]>([]);
  const [officers, setOfficers] = useState<ProtocolOfficer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ProtocolRequest | null>(null);
  const [activeTab, setActiveTab] = useState('pending');

  // Location-based assignment state
  const [locations, setLocations] = useState<Array<{id: number, name: string}>>([]);
  const [officerLocationId, setOfficerLocationId] = useState<number | undefined>(undefined);
  const [officerSearch, setOfficerSearch] = useState('');
  const [officerLoading, setOfficerLoading] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);

  // Forms
  const assignForm = useForm<AssignOfficerForm>({
    resolver: zodResolver(assignOfficerSchema),
  });

  const serviceForm = useForm<ServiceRequestForm>({
    resolver: zodResolver(serviceRequestSchema),
  });

  // Fetch data
  useEffect(() => {
    fetchRequests();
    fetchOfficers();
  }, []);

  // Helper to get final destination from journey legs
  const getFinalDestination = (request: ProtocolRequest): string => {
    if (!request.journey_details || !Array.isArray(request.journey_details)) {
      return '';
    }
    const sortedLegs = request.journey_details
      .slice()
      .sort((a, b) => a.leg_order - b.leg_order);
    return sortedLegs.length > 0 ? sortedLegs[sortedLegs.length - 1].to_location : '';
  };

  // Fetch officer locations based on destination
  const fetchOfficerLocations = async (destination: string) => {
    try {
      const response = await usersApi.listOfficerLocations(undefined, destination);
      console.log('Locations Response:', response.data);
      
      const data = response.data;
      let locationsArray = [];
      
      if (Array.isArray(data)) {
        locationsArray = data;
      } else if (data.locations && Array.isArray(data.locations)) {
        locationsArray = data.locations;
      } else if (data.data && Array.isArray(data.data)) {
        locationsArray = data.data;
      }
      
      setLocations(locationsArray);
      
      // Auto-select first location if available
      if (locationsArray.length > 0) {
        setOfficerLocationId(locationsArray[0].id);
      }
    } catch (error) {
      console.error('Error fetching officer locations:', error);
      setLocations([]);
    }
  };

  // Fetch officers with search and location filtering
  const fetchOfficersWithFilters = async () => {
    try {
      setOfficerLoading(true);
      const response = await usersApi.listProtocolOfficers(officerSearch || undefined, officerLocationId);
      console.log('Filtered Officers Response:', response.data);
      
      const data = response.data;
      let officersArray = [];
      
      if (Array.isArray(data)) {
        officersArray = data;
      } else if (data.officers && Array.isArray(data.officers)) {
        officersArray = data.officers;
      } else if (data.data && Array.isArray(data.data)) {
        officersArray = data.data;
      } else if (data.users && Array.isArray(data.users)) {
        officersArray = data.users;
      }
      
      setOfficers(officersArray);
    } catch (error) {
      console.error('Error fetching filtered officers:', error);
      setOfficers([]);
    } finally {
      setOfficerLoading(false);
    }
  };

  // Effect to fetch officers when dialog opens or filters change
  useEffect(() => {
    if (assignDialogOpen) {
      fetchOfficersWithFilters();
    }
  }, [assignDialogOpen, officerSearch, officerLocationId]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await protocolInchargeApi.getPendingRequests();
      console.log('API Response:', response.data); // Debug log
      
      // Handle different possible response structures
      const data = response.data;
      let requestsArray = [];
      
      if (Array.isArray(data)) {
        requestsArray = data;
      } else if (data.requests && Array.isArray(data.requests)) {
        requestsArray = data.requests;
      } else if (data.data && Array.isArray(data.data)) {
        requestsArray = data.data;
      } else if (data.result && Array.isArray(data.result)) {
        requestsArray = data.result;
      }
      
      setRequests(requestsArray);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setRequests([]); // Set empty array on error
      toast.error('Failed to load requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchOfficers = async () => {
    try {
      const response = await usersApi.listProtocolOfficers();
      console.log('Officers Response:', response.data); // Debug log
      
      // Handle different possible response structures
      const data = response.data;
      let officersArray = [];
      
      if (Array.isArray(data)) {
        officersArray = data;
      } else if (data.officers && Array.isArray(data.officers)) {
        officersArray = data.officers;
      } else if (data.data && Array.isArray(data.data)) {
        officersArray = data.data;
      } else if (data.users && Array.isArray(data.users)) {
        officersArray = data.users;
      }
      
      setOfficers(officersArray);
    } catch (error) {
      console.error('Error fetching officers:', error);
      setOfficers([]); // Set empty array on error
    }
  };

  // Handle assignment
  const handleAssignOfficer = async (data: AssignOfficerForm) => {
    if (!selectedRequest) return;

    try {
      await protocolInchargeApi.assignOfficer({
        requestId: selectedRequest.id,
        officerId: data.officerId,
        priority: data.priority,
        remarks: data.remarks,
        officerLocationId: data.officerLocationId ?? officerLocationId,
      });
      
      toast.success('Officer assigned successfully!');
      fetchRequests(); // Refresh data
      assignForm.reset();
      setSelectedRequest(null);
      setAssignDialogOpen(false);
      setOfficerSearch('');
      setOfficerLocationId(undefined);
    } catch (error) {
      console.error('Error assigning officer:', error);
      toast.error('Failed to assign officer. Please try again.');
    }
  };

  // Handle service requests
  const handleAddService = async (data: ServiceRequestForm, serviceType: 'vehicle' | 'guesthouse' | 'other') => {
    if (!selectedRequest) return;

    try {
      switch (serviceType) {
        case 'vehicle':
          await protocolInchargeApi.addVehicleRequest(selectedRequest.id, {
            vehicle_type: data.vehicleType,
            vehicle_number: data.vehicleNumber,
            driver_name: data.driverName,
            driver_contact_no: data.driverContact,
          });
          toast.success('Vehicle request added successfully!');
          break;
        case 'guesthouse':
          await protocolInchargeApi.addGuesthouseRequest(selectedRequest.id, {
            guesthouse_location: data.guesthouseLocation,
          });
          toast.success('Guesthouse request added successfully!');
          break;
        case 'other':
          await protocolInchargeApi.addOtherRequest(selectedRequest.id, {
            purpose: data.otherPurpose || '',
          });
          toast.success('Other request added successfully!');
          break;
      }
      
      fetchRequests();
      serviceForm.reset();
    } catch (error) {
      console.error('Error adding service:', error);
      toast.error(`Failed to add ${serviceType} request. Please try again.`);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'BYROAD': return '🚗';
      case 'BYAIR': return '✈️';
      case 'BYRAIL': return '🚂';
      default: return '🚶';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Protocol Management Dashboard</h1>
        <p className="text-gray-600">Manage protocol requests, assign officers, and handle services</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">Pending Requests ({requests.length})</TabsTrigger>
          <TabsTrigger value="assigned">Assigned Requests</TabsTrigger>
          <TabsTrigger value="completed">Completed Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-6">
          {requests.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Requests</h3>
              <p className="text-gray-500">There are currently no pending protocol requests.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {requests.map((request) => (
              <Card key={request.id} className="shadow-sm border-l-4 border-l-blue-500">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-900">
                        Request #{request.movement_number}
                      </CardTitle>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(request.created_at).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {request.guest_users?.length || 0} Guest(s)
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-orange-50 text-orange-700">
                      {request.req_status}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Purpose */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-1">Purpose</h4>
                    <p className="text-gray-700">{request.purpose}</p>
                    {request.special_notes && (
                      <p className="text-sm text-gray-600 mt-1">
                        <strong>Special Notes:</strong> {request.special_notes}
                      </p>
                    )}
                  </div>

                  {/* Journey Details */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Journey Details
                    </h4>
                    <div className="space-y-3">
                      {(request.journey_details || [])
                        .sort((a, b) => a.leg_order - b.leg_order)
                        .map((leg, index) => (
                        <div key={leg.id} className="flex items-center gap-3 p-3 bg-white border rounded-lg">
                          <span className="text-2xl">{getModeIcon(leg.mode)}</span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 font-medium text-gray-900">
                              <span>{leg.from_location}</span>
                              <ArrowRight className="h-4 w-4 text-gray-400" />
                              <span>{leg.to_location}</span>
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              Mode: {leg.mode}
                              {leg.departure_date && (
                                <span className="ml-3">
                                  Departure: {leg.departure_date} {leg.departure_time}
                                </span>
                              )}
                            </div>
                          </div>
                          <Badge variant="secondary">Leg {leg.leg_order}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Guest Information */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Guest Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {(request.guest_users || []).map((guest) => (
                        <div key={guest.id} className="p-3 bg-gray-50 rounded-lg">
                          <div className="font-medium text-gray-900">
                            {guest.first_name} {guest.last_name}
                          </div>
                          <div className="text-sm text-gray-600">
                            Age: {guest.age} | 📞 {guest.contact_number}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Service Requests */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Service Requests</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Vehicle Requests */}
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center gap-2 font-medium text-gray-900 mb-2">
                          <Car className="h-4 w-4" />
                          Vehicles ({request.service_requests?.vehicle_requests?.length || 0})
                        </div>
                        {(request.service_requests?.vehicle_requests || []).map((vehicle) => (
                          <div key={vehicle.id} className="text-sm text-gray-600 mb-1">
                            {vehicle.vehicle_type} - {vehicle.service_status}
                          </div>
                        ))}
                      </div>

                      {/* Guesthouse Requests */}
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center gap-2 font-medium text-gray-900 mb-2">
                          <Building className="h-4 w-4" />
                          Guesthouses ({request.service_requests?.guesthouse_requests?.length || 0})
                        </div>
                        {(request.service_requests?.guesthouse_requests || []).map((gh) => (
                          <div key={gh.id} className="text-sm text-gray-600 mb-1">
                            {gh.guesthouse_location} - {gh.service_status}
                          </div>
                        ))}
                      </div>

                      {/* Other Requests */}
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center gap-2 font-medium text-gray-900 mb-2">
                          <FileText className="h-4 w-4" />
                          Others ({request.service_requests?.other_requests?.length || 0})
                        </div>
                        {(request.service_requests?.other_requests || []).map((other) => (
                          <div key={other.id} className="text-sm text-gray-600 mb-1">
                            {other.purpose} - {other.service_status}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t">
                    <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          onClick={() => {
                            setSelectedRequest(request);
                            const destination = getFinalDestination(request);
                            fetchOfficerLocations(destination);
                            setAssignDialogOpen(true);
                          }}
                          className="flex-1"
                        >
                          <User className="h-4 w-4 mr-2" />
                          Assign Officer
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Assign Protocol Officer</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={assignForm.handleSubmit(handleAssignOfficer)} className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">Destination</label>
                            <Input 
                              value={selectedRequest ? getFinalDestination(selectedRequest) : ''} 
                              readOnly 
                              className="bg-gray-50"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-1">Officer Location</label>
                            <Select 
                              value={officerLocationId ? String(officerLocationId) : undefined}
                              onValueChange={(value) => setOfficerLocationId(parseInt(value))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Choose officer location" />
                              </SelectTrigger>
                              <SelectContent>
                                {locations.map((location) => (
                                  <SelectItem key={location.id} value={String(location.id)}>
                                    {location.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-1">Search Officer</label>
                            <Input 
                              value={officerSearch}
                              onChange={(e) => setOfficerSearch(e.target.value)}
                              placeholder="Type to search officers..."
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-1">Select Officer</label>
                            <Select 
                              onValueChange={(value) => assignForm.setValue('officerId', parseInt(value))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder={officerLoading ? "Loading..." : "Choose an officer"} />
                              </SelectTrigger>
                              <SelectContent>
                                {officerLoading ? (
                                  <div className="px-3 py-2 text-sm text-gray-500">Loading officers...</div>
                                ) : officers.length === 0 ? (
                                  <div className="px-3 py-2 text-sm text-gray-500">No officers found</div>
                                ) : (
                                  officers.map((officer) => (
                                    <SelectItem key={officer.id} value={officer.id.toString()}>
                                      {officer.username} ({officer.email})
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-1">Priority</label>
                            <Select 
                              onValueChange={(value) => assignForm.setValue('priority', value as 'high' | 'medium' | 'low')}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-1">Remarks (Optional)</label>
                            <Textarea 
                              {...assignForm.register('remarks')}
                              placeholder="Any special instructions..."
                              rows={3}
                            />
                          </div>

                          <Button type="submit" className="w-full">
                            Assign Officer
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline"
                          onClick={() => setSelectedRequest(request)}
                          className="flex-1"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Manage Services
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Manage Service Requests</DialogTitle>
                        </DialogHeader>
                        
                        <Tabs defaultValue="vehicle" className="w-full">
                          <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="vehicle">Vehicle</TabsTrigger>
                            <TabsTrigger value="guesthouse">Guesthouse</TabsTrigger>
                            <TabsTrigger value="other">Other</TabsTrigger>
                          </TabsList>

                          <TabsContent value="vehicle" className="space-y-4">
                            <form onSubmit={serviceForm.handleSubmit((data) => handleAddService(data, 'vehicle'))} className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium mb-1">Vehicle Type</label>
                                  <Input {...serviceForm.register('vehicleType')} placeholder="Car, Bus, SUV..." />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-1">Vehicle Number</label>
                                  <Input {...serviceForm.register('vehicleNumber')} placeholder="HR-26-1234" />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-1">Driver Name</label>
                                  <Input {...serviceForm.register('driverName')} placeholder="Driver's name" />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-1">Driver Contact</label>
                                  <Input {...serviceForm.register('driverContact')} placeholder="Phone number" />
                                </div>
                              </div>
                              <Button type="submit" className="w-full">Add Vehicle Request</Button>
                            </form>
                          </TabsContent>

                          <TabsContent value="guesthouse" className="space-y-4">
                            <form onSubmit={serviceForm.handleSubmit((data) => handleAddService(data, 'guesthouse'))} className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium mb-1">Guesthouse Location</label>
                                <Input {...serviceForm.register('guesthouseLocation')} placeholder="Location name" />
                              </div>
                              <Button type="submit" className="w-full">Add Guesthouse Request</Button>
                            </form>
                          </TabsContent>

                          <TabsContent value="other" className="space-y-4">
                            <form onSubmit={serviceForm.handleSubmit((data) => handleAddService(data, 'other'))} className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium mb-1">Purpose</label>
                                <Textarea {...serviceForm.register('otherPurpose')} placeholder="Describe the service needed..." />
                              </div>
                              <Button type="submit" className="w-full">Add Other Request</Button>
                            </form>
                          </TabsContent>
                        </Tabs>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          )}
        </TabsContent>

        <TabsContent value="assigned">
          <div className="text-center py-12">
            <p className="text-gray-500">Assigned requests will be displayed here</p>
          </div>
        </TabsContent>

        <TabsContent value="completed">
          <div className="text-center py-12">
            <p className="text-gray-500">Completed requests will be displayed here</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProtocolInchargeDashboard;