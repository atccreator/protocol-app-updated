export interface GuestUser {
  first_name: string;
  last_name: string;
  age: number;
  contact_number: string;
}

export interface JourneyDetail {
  id: number;
  leg_order: number;
  mode: 'BYAIR' | 'BYRAIL' | 'BYROAD';
  from_location: string;
  to_location: string;
  train_number: string;
  flight_number: string;
  vehicle_number: string;
  arrival_date: string;
  arrival_time: string;
  departure_date?: string;
  departure_time?: string;
}

export interface VehicleRequest {
  vehicle_type: string | null;
  vehicle_number: string | null;
  driver_name: string | null;
  driver_contact_no: string | null;
  pickup_location: string;
  destination: string;
  purpose: string;
}

export interface GuesthouseRequest {
  guesthouse_location: string | null;
  check_in_date: string;
  checkout_date: string;
  guest_count: number;
  purpose: string;
}

export interface OtherRequest {
  purpose: string;
}

export interface ProtocolAssignment {
  assignment_id: number;
  assigned_officer_id: number;
  completion_status: 'pending' | 'assigned' | 'completed' | 'rejected';
  priority: 'high' | 'medium' | 'low';
  assigned_at: string;
  completed_at: string | null;
  officer_remarks: string;
  forward_to_hcp: boolean;
}

export interface Request {
  id: number;
  movementNumber: string | null;
  requesteeId: string;
  purpose: string;
  reqStatus: 'pending' | 'approved' | 'rejected' | 'completed';
  specialNotes: string;
  createdAt: string;
  requestee_id: string;
  guestUsers: GuestUser[];
  journeyDetails: JourneyDetail[];
  vehicleRequests: VehicleRequest[];
  guesthouseRequests: GuesthouseRequest[];
  otherRequests: OtherRequest[];
  protocolAssignments: ProtocolAssignment[];
}

export interface RequestDashboardProps {
  data?: Request[];
}