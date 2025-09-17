import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  User, 
  ArrowRight,
  CheckCircle,
  Clock
} from 'lucide-react';

interface JourneyLeg {
  id: number;
  request_id: number;
  leg_order: number;
  mode: 'BYROAD' | 'BYAIR' | 'BYRAIL';
  from_location: string;
  to_location: string;
  departure_date?: string;
  departure_time?: string;
  arrival_date?: string;
  arrival_time?: string;
}

interface LegAssignment {
  id?: number;
  journey_leg_id: number;
  request_id: number;
  assigned_officer_id?: number;
  officer_location_id?: number;
  mode_of_travel: string;
  assignment_status: string;
  assigned_by: number;
  special_instructions?: string;
}

interface ProtocolOfficer {
  id: number;
  username: string;
  email: string;
  location?: string;
}

const legAssignmentSchema = z.object({
  officerId: z.number().min(1, 'Please select an officer'),
  specialInstructions: z.string().optional(),
});

type LegAssignmentForm = z.infer<typeof legAssignmentSchema>;

interface JourneyLegAssignmentProps {
  requestId: number;
  journeyLegs: JourneyLeg[];
  officers: ProtocolOfficer[];
  existingAssignments: LegAssignment[];
  onAssignmentComplete: () => void;
}

const JourneyLegAssignment: React.FC<JourneyLegAssignmentProps> = ({
  requestId,
  journeyLegs,
  officers,
  existingAssignments,
  onAssignmentComplete
}) => {
  const [selectedLeg, setSelectedLeg] = useState<JourneyLeg | null>(null);
  const [assignments, setAssignments] = useState<LegAssignment[]>(existingAssignments);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<LegAssignmentForm>({
    resolver: zodResolver(legAssignmentSchema),
  });

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'BYROAD': return '🚗';
      case 'BYAIR': return '✈️';
      case 'BYRAIL': return '🚂';
      default: return '🚶';
    }
  };

  const getAssignmentForLeg = (legId: number) => {
    return assignments.find(a => a.journey_leg_id === legId);
  };

  const getOfficerById = (officerId: number) => {
    return officers.find(o => o.id === officerId);
  };

  const handleLegAssignment = async (data: LegAssignmentForm) => {
    if (!selectedLeg) return;

    try {
      // Call API to assign officer to specific journey leg
      const payload = {
        journey_leg_id: selectedLeg.id,
        request_id: requestId,
        assigned_officer_id: data.officerId,
        mode_of_travel: selectedLeg.mode,
        special_instructions: data.specialInstructions,
      };

      // You'll need to add this endpoint to your API
      // const response = await protocolInchargeApi.assignOfficerToLeg(payload);
      
      // Update local state (replace with actual API response)
      const newAssignment: LegAssignment = {
        id: Math.random(), // Replace with actual ID from API
        journey_leg_id: selectedLeg.id,
        request_id: requestId,
        assigned_officer_id: data.officerId,
        mode_of_travel: selectedLeg.mode,
        assignment_status: 'assigned',
        assigned_by: 1, // Current user ID
        special_instructions: data.specialInstructions,
      };

      setAssignments(prev => [...prev.filter(a => a.journey_leg_id !== selectedLeg.id), newAssignment]);
      setSelectedLeg(null);
      reset();
      onAssignmentComplete();
      
    } catch (error) {
      console.error('Error assigning officer to leg:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Journey Leg Assignments
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Assign different protocol officers to specific journey legs based on their locations and expertise.
        </p>
      </div>

      <div className="space-y-4">
        {journeyLegs
          .sort((a, b) => a.leg_order - b.leg_order)
          .map((leg) => {
            const assignment = getAssignmentForLeg(leg.id);
            const assignedOfficer = assignment ? getOfficerById(assignment.assigned_officer_id!) : null;

            return (
              <Card key={leg.id} className={`transition-all ${
                selectedLeg?.id === leg.id ? 'ring-2 ring-blue-500 shadow-md' : 'hover:shadow-sm'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{getModeIcon(leg.mode)}</span>
                      <div>
                        <div className="flex items-center gap-2 font-medium text-gray-900">
                          <span>{leg.from_location}</span>
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                          <span>{leg.to_location}</span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          <span className="inline-flex items-center gap-1">
                            Mode: {leg.mode}
                          </span>
                          {leg.departure_date && (
                            <span className="ml-3">
                              📅 {leg.departure_date} {leg.departure_time}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">Leg {leg.leg_order}</Badge>
                      
                      {assignment && assignedOfficer ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <div className="text-sm">
                            <div className="font-medium text-green-700">
                              {assignedOfficer.username}
                            </div>
                            <div className="text-gray-600">
                              {assignedOfficer.email}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-orange-600">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm">Unassigned</span>
                        </div>
                      )}

                      <Button
                        size="sm"
                        variant={selectedLeg?.id === leg.id ? "secondary" : "outline"}
                        onClick={() => setSelectedLeg(selectedLeg?.id === leg.id ? null : leg)}
                      >
                        <User className="h-4 w-4 mr-1" />
                        {assignment ? 'Reassign' : 'Assign'}
                      </Button>
                    </div>
                  </div>

                  {/* Assignment instructions */}
                  {assignment?.special_instructions && (
                    <div className="mt-3 p-2 bg-blue-50 rounded border-l-2 border-blue-200">
                      <p className="text-sm text-blue-800">
                        <strong>Instructions:</strong> {assignment.special_instructions}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
      </div>

      {/* Assignment Form */}
      {selectedLeg && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" />
              Assign Officer to {selectedLeg.from_location} → {selectedLeg.to_location}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(handleLegAssignment)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Select Protocol Officer
                  </label>
                  <Select onValueChange={(value) => setValue('officerId', parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose officer for this leg" />
                    </SelectTrigger>
                    <SelectContent>
                      {officers
                        .filter(officer => 
                          // Filter officers based on location if needed
                          // You can add location-based filtering here
                          true
                        )
                        .map((officer) => (
                        <SelectItem key={officer.id} value={officer.id.toString()}>
                          <div>
                            <div className="font-medium">{officer.username}</div>
                            <div className="text-sm text-gray-500">{officer.email}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.officerId && (
                    <p className="text-sm text-red-600 mt-1">{errors.officerId.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Mode of Travel
                  </label>
                  <div className="p-2 bg-white border rounded-md text-sm text-gray-700">
                    {getModeIcon(selectedLeg.mode)} {selectedLeg.mode}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Special Instructions (Optional)
                </label>
                <Textarea
                  {...register('specialInstructions')}
                  placeholder="Any specific instructions for this leg of the journey..."
                  rows={3}
                  className="resize-none"
                />
              </div>

              <div className="flex gap-3">
                <Button type="submit" className="flex-1">
                  Assign Officer to This Leg
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setSelectedLeg(null);
                    reset();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Assignment Summary</h4>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Total Legs:</span>
            <span className="font-medium ml-2">{journeyLegs.length}</span>
          </div>
          <div>
            <span className="text-gray-600">Assigned:</span>
            <span className="font-medium ml-2 text-green-600">
              {assignments.filter(a => a.assigned_officer_id).length}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Pending:</span>
            <span className="font-medium ml-2 text-orange-600">
              {journeyLegs.length - assignments.filter(a => a.assigned_officer_id).length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JourneyLegAssignment;