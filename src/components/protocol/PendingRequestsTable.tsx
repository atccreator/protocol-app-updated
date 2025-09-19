"use client";

import { useEffect, useState } from "react";
import { protocolInchargeApi, usersApi } from "@/lib/api";
import type { Request } from "@/types/requestStatusCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  Car, 
  Home, 
  FileText, 
  UserPlus, 
  RefreshCw, 
  PlusCircle, 
  MapPin, 
  Clock, 
  Users, 
  ChevronRight,
  Eye,
  Settings
} from "lucide-react";
import { Textarea } from "../ui/textarea";
import { z } from "zod";

type RequestRow = Request & { 
  requestee?: { id: number; username: string; user_type?: string } 
};

interface Officer {
  id: number;
  username: string;
  email: string;
  location?: string;
  location_id?: number;
}

interface Location {
  id: number;
  name: string;
  city?: string;
  state?: string;
}

interface JourneyLeg {
  id: number;
  legOrder: number;
  mode: string;
  fromLocation: string;
  toLocation: string;
  arrivalDate?: Date;
  departureDate?: Date;
}

interface JourneyLegAssignment {
  journeyLegId: number;
  officerId: number;
  priority: 'high' | 'medium' | 'low';
  remarks?: string;
  officerLocationId?: number;
}

// Enhanced Protocol In-charge Dashboard
export default function PendingRequestsTable() {
  const [rows, setRows] = useState<RequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Modal states
  const [assignOpen, setAssignOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selected, setSelected] = useState<RequestRow | null>(null);

  // Officer assignment states
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [officerSearch, setOfficerSearch] = useState("");
  const [officerLoading, setOfficerLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  
  // Legacy single assignment states (kept for backward compatibility)
  const [officerId, setOfficerId] = useState<string>("");
  const [officerLocationId, setOfficerLocationId] = useState<string>("");
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");
  const [remarks, setRemarks] = useState("");
  const [finalDestination, setFinalDestination] = useState<string>("");

  // Multi-leg assignment states
  const [journeyLegs, setJourneyLegs] = useState<JourneyLeg[]>([]);
  const [journeyAssignments, setJourneyAssignments] = useState<JourneyLegAssignment[]>([]);
  const [assignmentMode, setAssignmentMode] = useState<'single' | 'multiple'>('multiple');

  // Service forms state
  const [vehicle, setVehicle] = useState({ 
    vehicle_type: "", 
    vehicle_number: "", 
    driver_name: "", 
    driver_contact_no: ""
  });
  const [guesthouse, setGuesthouse] = useState({ 
    guesthouse_location: ""
  });
  const [other, setOther] = useState({ 
    purpose: ""
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Assignment validation schema
  const assignmentSchema = z.object({
    officerId: z.number().min(1, "Please select an officer"),
    priority: z.enum(["high", "medium", "low"]),
    remarks: z.string().optional(),
    officerLocationId: z.number().min(1, "Please select a location").optional(),
  }).refine((data) => {
    // High priority assignments require remarks
    if (data.priority === "high" && (!data.remarks || data.remarks.trim().length === 0)) {
      return false;
    }
    return true;
  }, {
    message: "High priority assignments must include remarks explaining the urgency",
    path: ["remarks"]
  });

  // Enhanced validation schemas
  const vehicleSchema = z.object({
    vehicle_type: z.string().min(1, "Vehicle type is required"),
    vehicle_number: z.string().min(1, "Vehicle number is required"),
    driver_name: z.string().min(1, "Driver name is required"),
    driver_contact_no: z.string().min(7, "Contact number required").regex(/^[0-9+\-()\s]+$/i, "Invalid format"),
  });

  const guesthouseSchema = z.object({
    guesthouse_location: z.string().min(1, "Accommodation address is required"),
  });

  const otherSchema = z.object({ 
    purpose: z.string().min(1, "Purpose is required"),
  });

  // Helper functions
  const getFinalDestination = (request: RequestRow) => {
    const legs = request.journeyDetails?.slice().sort((a, b) => a.leg_order - b.leg_order) ?? [];
    return legs.length ? legs[legs.length - 1].to_location : "";
  };

  const getJourneyLocations = (request: RequestRow) => {
    const legs = request.journeyDetails?.slice().sort((a, b) => a.leg_order - b.leg_order) ?? [];
    const locations = new Set<string>();
    
    legs.forEach((leg) => {
      if (leg.from_location?.trim()) locations.add(leg.from_location.trim());
      if (leg.to_location?.trim()) locations.add(leg.to_location.trim());
    });
    
    return Array.from(locations).filter(Boolean);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case "BYROAD": return "🚗";
      case "BYRAIL": return "🚂";
      case "BYAIR": return "✈️";
      default: return "🚶";
    }
  };

  // Helper functions for journey assignments
  const updateJourneyAssignment = (journeyLegId: number, field: keyof JourneyLegAssignment, value: any) => {
    setJourneyAssignments(prev => prev.map(assignment => 
      assignment.journeyLegId === journeyLegId 
        ? { ...assignment, [field]: value }
        : assignment
    ));
  };

  const getAssignmentForLeg = (journeyLegId: number) => {
    return journeyAssignments.find(assignment => assignment.journeyLegId === journeyLegId);
  };

  // API calls
  const fetchRows = async (nextPage = page) => {
    setLoading(true);
    try {
      const res = await protocolInchargeApi.getPendingRequests(nextPage, limit);
      const raw = (res as any)?.data;
      const list: RequestRow[] = (raw?.data ?? raw ?? []);
      setRows(Array.isArray(list) ? list : []);
      const meta = raw?.meta;
      if (meta) {
        setTotal(meta.total ?? 0);
        setTotalPages(meta.totalPages ?? 1);
      } else {
        setTotal(Array.isArray(list) ? list.length : 0);
        setTotalPages(1);
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to load pending requests");
    } finally {
      setLoading(false);
    }
  };

  const fetchOfficerLocations = async (destination: string) => {
    try {
      setLocationLoading(true);
      const res = await usersApi.listLocations(destination);
      const payload = res?.data ?? {};
      const locations = payload.data ?? (Array.isArray(payload) ? payload : []);
      const mapped: Location[] = (locations ?? []).map((l: any) => ({
        id: Number(l.id),
        name: l.name ?? `Location #${l.id}`,
        city: l.city,
        state: l.state,
      }));
      setLocations(mapped);
      if (mapped[0]?.id) {
        setOfficerLocationId(String(mapped[0].id));
      }
    } catch (e) {
      console.error('Error fetching officer locations', e);
      setLocations([]);
      setOfficerLocationId("");
    } finally {
      setLocationLoading(false);
    }
  };

  const fetchAllLocationsForJourney = async (journeyLegs: any[]) => {
    try {
      setLocationLoading(true);
      // get all unique destinations from the journey 
      const destinations = [...new Set(journeyLegs.map(leg => leg.to_location))];

      // Fetch locations for each destination and merge results
      const locationPromises = destinations.map(dest => usersApi.listLocations(dest).catch(() => ({data:{data: []}})));

      const locationResponses = await Promise.all(locationPromises);
      const allLocations = locationResponses.flatMap(res => {
        const payload = res?.data ?? {};
        return payload.data ?? (Array.isArray(payload) ? payload : []);
      });

      // Remove duplicates based on location ID
      const uniqueLocations = allLocations.filter((location, index, self) =>
        index === self.findIndex((l) => l.id === location.id)
      );

      const mapped: Location[] = (uniqueLocations).map((l: any) => ({
        id: Number(l.id),
        name: l.name ?? `Location #${l.id}`,
        city: l.city,
        state: l.state,
      }));

      setLocations(mapped);
      if (mapped[0]?.id) {
        setOfficerLocationId(String(mapped[0].id));
      }

    } catch (e) {
      console.error('Error fetching officer locations for journey', e);
      setLocations([]);
      setOfficerLocationId("");
    } finally{
      setLocationLoading(false);
    }
  };

  // Load officers when modal opens or search/location changes -- fetch ALL officers, not filtered by destination
  useEffect(() => {
    if (!assignOpen) return;
    let active = true;
    const t = setTimeout(async () => {
      try {
        setOfficerLoading(true);
        // For multiple assignment mode, fetch all officers without destination filter
        // filter them per-leg in the UI
        const res = await usersApi.listProtocolOfficers(
          officerSearch || undefined,
          assignmentMode === 'single' ? (finalDestination || undefined) : undefined
        );
        const payload = res?.data ?? {};
        const rows = payload.officers ?? payload.data ?? (Array.isArray(payload) ? payload : []);
        if (active) setOfficers(Array.isArray(rows) ? rows : []);
      } catch (e) {
        if (active) setOfficers([]);
      } finally {
        if (active) setOfficerLoading(false);
      }
    }, 300);
    return () => { active = false; clearTimeout(t); };
  }, [assignOpen, officerSearch, assignmentMode]);

  useEffect(() => {
    fetchRows(1);
  }, []);

  // Event handlers
  const onOpenAssign = (r: RequestRow) => {
    setSelected(r);
    setOfficerId("");
    setPriority("medium");
    setRemarks("");
    setFormErrors({});
    
    // Get journey legs for this request - now using actual IDs from backend
    const legs = r.journeyDetails?.slice().sort((a, b) => a.leg_order - b.leg_order) ?? [];
    setJourneyLegs(legs.map((leg, index) => ({
      id: leg.id || index+1, // Fallback to index-based ID if leg.id is undefined
      legOrder: leg.leg_order,
      mode: leg.mode,
      fromLocation: leg.from_location,
      toLocation: leg.to_location,
      arrivalDate: leg.arrival_date ? new Date(leg.arrival_date) : undefined,
      departureDate: leg.departure_date ? new Date(leg.departure_date) : undefined,
    })));

    // Initialize journey assignments with default values
    setJourneyAssignments(legs.map((leg, index) => ({
      journeyLegId: leg.id || index+1, // Fallback to index-based ID if leg.id is undefined
      officerId: 0,
      priority: 'medium' as const,
      remarks: '',
      officerLocationId: undefined,
    })));

    // Set assignment mode based on journey legs count
    setAssignmentMode(legs.length > 1 ? 'multiple' : 'single');
    
    const dest = getFinalDestination(r);
    setFinalDestination(dest);
    
    if (legs.length > 1) {
      fetchAllLocationsForJourney(legs);
    } else {
      fetchOfficerLocations(dest);
    }
    setAssignOpen(true);

  };

  const onOpenServices = (r: RequestRow) => {
    setSelected(r);
    
    setVehicle({ 
      vehicle_type: "", vehicle_number: "", driver_name: "", driver_contact_no: ""
    });
    setGuesthouse({ 
      guesthouse_location: ""
    });
    setOther({ purpose: "" });
    setFormErrors({});
    setServicesOpen(true);
  };

  const onOpenDetails = (r: RequestRow) => {
    setSelected(r);
    setDetailsOpen(true);
  };

  const submitAssign = async () => {
    if (!selected) return;
    
    try {
      if (assignmentMode === 'multiple') {
        // Validate all assignments
        const validAssignments = journeyAssignments.filter(assignment => assignment.officerId > 0);
        
        if (validAssignments.length === 0) {
          toast.error("Please assign at least one officer");
          return;
        }

        // Validate high priority assignments have remarks
        const invalidHighPriorityAssignments = validAssignments.filter(
          assignment => assignment.priority === 'high' && (!assignment.remarks || assignment.remarks.trim().length === 0)
        );

        if (invalidHighPriorityAssignments.length > 0) {
          toast.error("High priority assignments must include remarks explaining the urgency");
          return;
        }

        const response = await protocolInchargeApi.assignMultipleOfficers({
          requestId: selected.id,
          assignments: validAssignments
        });

        // Handle partial success
        const result = response.data?.data;
        if (result?.unavailableLocations && result.unavailableLocations.length > 0) {
          const unavailableMsg = result.unavailableLocations
            .map((loc: any) => `${loc.location}: ${loc.reason}`)
            .join(', ');
          toast.warning(`Partially assigned. Issues: ${unavailableMsg}`);
        } else {
          toast.success("All officers assigned successfully");
        }
        
        setAssignOpen(false);
        fetchRows();
      } else {
        // Legacy single assignment mode
        const validationData = {
          officerId: officerId ? Number(officerId) : 0,
          priority,
          remarks: remarks || undefined,
          officerLocationId: officerLocationId ? Number(officerLocationId) : undefined,
        };

        const parsed = assignmentSchema.safeParse(validationData);
        if (!parsed.success) {
          const fe: Record<string, string> = {};
          parsed.error.issues.forEach((i) => {
            const k = i.path[0] as string;
            if (!fe[k]) fe[k] = i.message;
          });
          setFormErrors(fe);
          toast.error("Please fix validation errors");
          return;
        }

        await protocolInchargeApi.assignOfficer({
          requestId: selected.id,
          officerId: Number(officerId),
          priority,
          remarks: remarks || undefined,
          officerLocationId: officerLocationId ? Number(officerLocationId) : undefined,
        });
        
        toast.success("Officer assigned successfully");
        setAssignOpen(false);
        fetchRows();
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message ?? err?.message ?? "Failed to assign officer";
      toast.error(errorMessage);
      console.error("Assignment error:", err);
    }
  };

  const submitVehicle = async () => {
    if (!selected) return;
    try {
      const parsed = vehicleSchema.safeParse(vehicle);
      if (!parsed.success) {
        const fe: Record<string, string> = {};
        parsed.error.issues.forEach((i) => {
          const k = i.path[0] as string;
          if (!fe[k]) fe[k] = i.message;
        });
        setFormErrors(fe);
        toast.error("Please fix validation errors");
        return;
      }
      await protocolInchargeApi.addVehicleRequest(selected.id, {
        vehicle_type: vehicle.vehicle_type,
        vehicle_number: vehicle.vehicle_number,
        driver_name: vehicle.driver_name,
        driver_contact_no: vehicle.driver_contact_no,
      });
      toast.success("Vehicle request added");
      fetchRows();
      setServicesOpen(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? err?.message ?? "Failed to add vehicle request");
    }
  };

  const submitGuesthouse = async () => {
    if (!selected) return;
    try {
      const parsed = guesthouseSchema.safeParse(guesthouse);
      if (!parsed.success) {
        const fe: Record<string, string> = {};
        parsed.error.issues.forEach((i) => {
          const k = i.path[0] as string;
          if (!fe[k]) fe[k] = i.message;
        });
        setFormErrors(fe);
        toast.error("Please fix validation errors");
        return;
      }
      await protocolInchargeApi.addGuesthouseRequest(selected.id, {
        guesthouse_location: guesthouse.guesthouse_location,
      });
      toast.success("Accommodation request added");
      fetchRows();
      setServicesOpen(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? err?.message ?? "Failed to add accommodation request");
    }
  };

  const submitOther = async () => {
    if (!selected) return;
    try {
      const parsed = otherSchema.safeParse(other);
      if (!parsed.success) {
        const fe: Record<string, string> = {};
        parsed.error.issues.forEach((i) => {
          const k = i.path[0] as string;
          if (!fe[k]) fe[k] = i.message;
        });
        setFormErrors(fe);
        toast.error("Please fix validation errors");
        return;
      }
      await protocolInchargeApi.addOtherRequest(selected.id, { 
        purpose: other.purpose,
      });
      toast.success("Other request added");
      fetchRows();
      setServicesOpen(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? err?.message ?? "Failed to add other request");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Pending Requests</h2>
        <Button variant="outline" size="sm" onClick={() => fetchRows(page)}>
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </div>

      <Card className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left font-medium">ID</th>
              <th className="px-4 py-3 text-left font-medium">Requestee</th>
              <th className="px-4 py-3 text-left font-medium">Purpose</th>
              <th className="px-4 py-3 text-left font-medium">Guests</th>
              <th className="px-4 py-3 text-left font-medium">Journey</th>
              <th className="px-4 py-3 text-left font-medium">Created</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-4 py-6 text-center text-gray-500" colSpan={8}>Loading…</td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-center text-gray-500" colSpan={8}>No pending requests</td>
              </tr>
            ) : (
              rows.map((r) => {
                const legs = r.journeyDetails?.slice().sort((a,b)=>a.leg_order-b.leg_order) ?? [];
                const journeyText = legs.length
                  ? [legs[0].from_location, ...legs.map(l => l.to_location)].join(' → ')
                  : null;
                return (
                  <tr key={r.id} className="border-t">
                    <td className="px-4 py-3">REQ-{r.id}</td>
                    <td className="px-4 py-3">{(r as any).requestee?.username ?? '-'}</td>
                    <td className="px-4 py-3 max-w-[280px] truncate" title={r.purpose}>{r.purpose}</td>
                    <td className="px-4 py-3">{r.guestUsers?.length ?? 0}</td>
                    <td className="px-4 py-3">
                      {journeyText ? (
                        <span className="text-gray-600">{journeyText}</span>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3"><Badge variant="outline" className="border-yellow-500 text-yellow-700">Pending</Badge></td>
                    <td className="px-4 py-3 space-x-2 whitespace-nowrap">
                      <Button size="sm" onClick={() => onOpenDetails(r)} variant="outline" className="mr-2">
                        <Eye className="h-4 w-4 mr-1" /> Details
                      </Button>
                      <Button size="sm" onClick={() => onOpenAssign(r)} className="text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                        <UserPlus className="h-4 w-4 mr-1 " /> Assign Officer
                      </Button>
                      <Button size="sm" onClick={() => onOpenServices(r)} className="text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">
                       <PlusCircle className="h-4 w-4 mr-1 " /> Services
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        <div className="flex items-center justify-between p-3 text-sm text-gray-600">
          <div>
            Page {page} of {totalPages} {total ? `(total ${total})` : ''}
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || loading}
              onClick={() => {
                const p = Math.max(1, page - 1);
                setPage(p);
                fetchRows(p);
              }}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || loading}
              onClick={() => {
                const p = Math.min(totalPages, page + 1);
                setPage(p);
                fetchRows(p);
              }}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>

      {/* Assign Officer Modal */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="sm:max-w-4xl bg-gray-50 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assign Protocol Officers</DialogTitle>
            <DialogDescription>
              Assign protocol officers to each journey destination for comprehensive coverage.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Request Information */}
            <div className="bg-blue-50 p-3 rounded-md">
              <div className="text-sm">
                <strong>Request:</strong> REQ-{selected?.id}
              </div>
              <div className="text-sm mt-1">
                <strong>Journey:</strong> {journeyLegs.length} leg(s)
              </div>
              <div className="text-xs text-gray-600 mt-1">
                Officers will be assigned based on each destination location
              </div>
            </div>

            {/* Assignment Mode Toggle */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant={assignmentMode === 'multiple' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAssignmentMode('multiple')}
                disabled={journeyLegs.length <= 1}
              >
                Multi-Location Assignment
              </Button>
              <Button
                type="button"
                variant={assignmentMode === 'single' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAssignmentMode('single')}
              >
                Single Assignment
              </Button>
            </div>

            {assignmentMode === 'multiple' ? (
              /* Multi-leg Assignment Interface */
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Journey Legs Assignment</h3>
                {journeyLegs.map((leg, index) => {
                  const assignment = getAssignmentForLeg(leg.id);
                  // Filter officers specifically for this leg's destination
                  const legOfficers = officers.filter(officer => {
                    // If officer has no location_id, show them for all legs
                    if (!officer.location_id) return true;

                    // Find locations that match this leg's destination
                    return locations.some(location => {
                      // Check if officer's location matches any location that covers this destination
                      const officerAtThisLocation = location.id === officer.location_id;
                      const locationCoversDestination =
                        location.name.toLowerCase().includes(leg.toLocation.toLowerCase()) ||
                        location.city?.toLowerCase().includes(leg.toLocation.toLowerCase()) ||
                        leg.toLocation.toLowerCase().includes(location.name.toLowerCase()) ||
                        (location.city && leg.toLocation.toLowerCase().includes(location.city.toLowerCase()))
                      
                        return officerAtThisLocation && locationCoversDestination;
                      });
                  });

                  return (
                    <div key={leg.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg">{getModeIcon(leg.mode)}</span>
                        <div>
                          <h4 className="font-medium text-sm">
                            Leg {leg.legOrder}: {leg.fromLocation} → {leg.toLocation}
                          </h4>
                          <p className="text-xs text-gray-500">Mode: {leg.mode}</p>
                           {/* Debug info - remove this after testing
                          <p className="text-xs text-blue-500">
                            Available officers: {legOfficers.length} for {leg.toLocation}
                          </p> */}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* Officer Selection */}
                        <div>
                          <Label className="text-xs">Protocol Officer</Label>
                          <Select 
                            value={assignment?.officerId ? String(assignment.officerId) : "0"} 
                            onValueChange={(v) => updateJourneyAssignment(leg.id, 'officerId', Number(v))}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select officer" />
                            </SelectTrigger>
                            <SelectContent className="max-h-40 overflow-y-auto">
                              <SelectItem value="0">No officer assigned</SelectItem>
                              {legOfficers.length === 0 ? (
                                <div className="px-3 py-2 text-gray-500 text-xs">
                                  No officers available for {leg.toLocation}
                                </div>
                              ) : (
                                legOfficers.map((officer) => (
                                  <SelectItem key={officer.id} value={String(officer.id)}>
                                    <div className="flex flex-col">
                                      <span className="font-medium text-xs">{officer.username}</span>
                                      {(officer as any).location && (
                                        <span className="text-xs text-gray-500">
                                          {(officer as any).location.name}
                                        </span>
                                      )}
                                    </div>
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Priority */}
                        <div>
                          <Label className="text-xs">Priority</Label>
                          <Select 
                            value={assignment?.priority || 'medium'} 
                            onValueChange={(v) => updateJourneyAssignment(leg.id, 'priority', v)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Priority" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="low">Low</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Remarks */}
                        <div>
                          <Label className="text-xs">
                            Remarks {assignment?.priority === 'high' && <span className="text-red-500">*</span>}
                          </Label>
                          <Input 
                            placeholder={assignment?.priority === 'high' ? 'Required for high priority' : 'Optional remarks'}
                            value={assignment?.remarks || ''}
                            onChange={(e) => updateJourneyAssignment(leg.id, 'remarks', e.target.value)}
                            className="text-xs"
                          />
                        </div>
                      </div>

                      {legOfficers.length === 0 && (
                        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                          ⚠️ No officers available for {leg.toLocation}. Assignment will be skipped.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Legacy Single Assignment Interface */
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Single Officer Assignment</h3>
                <div className="space-y-3">
                  {/* Location Selection */}
                  {locations.length > 0 && (
                    <div>
                      <Label>Officer Location</Label>
                      <Select value={officerLocationId} onValueChange={(v)=>setOfficerLocationId(v)}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={locationLoading ? 'Loading locations...' : 'Select location'} />
                        </SelectTrigger>
                        <SelectContent className="max-h-60 overflow-y-auto bg-gradient-to-b from-white to-gray-50">
                          {locations.map((location) => (
                            <SelectItem key={location.id} value={String(location.id)}>
                              {location.name} {location.city && `(${location.city})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <Label>Search Officer</Label>
                    <Input placeholder="Type to search…" value={officerSearch} onChange={(e)=>setOfficerSearch(e.target.value)} />
                    {formErrors.officerId && <p className="text-xs text-red-600 mt-1">{formErrors.officerId}</p>}
                  </div>
                  <div>
                    <Select value={officerId} onValueChange={(v)=>{setOfficerId(v); setFormErrors((fe)=>({...fe, officerId: ''}))}}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={officerLoading ? 'Loading…' : 'Choose officer'} />
                      </SelectTrigger>
                      <SelectContent className="max-h-60 overflow-y-auto bg-gradient-to-b from-white to-gray-50">
                        {officers.length === 0 ? (
                          <div className="px-3 py-2 text-gray-500 text-sm">
                            {officerLoading ? 'Loading…' : finalDestination ? `No officers found for ${finalDestination}` : 'No officers found'}
                          </div>
                        ) : (
                          officers.map((o) => (
                            <SelectItem key={o.id} value={String(o.id)}>
                              <div className="flex flex-col">
                                <span className="font-medium">{o.username}</span>
                                {(o as any).location && (
                                  <span className="text-xs text-gray-500">
                                    {(o as any).location.name} - {(o as any).location.city}
                                  </span>
                                )}
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <Select value={priority} onValueChange={(v)=>{setPriority(v as any); setFormErrors((fe)=>({...fe, priority: ''}))}}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent className="bg-gradient-to-b from-white to-gray-50">
                        <SelectItem value="high">High (Urgent)</SelectItem>
                        <SelectItem value="medium">Medium (Normal)</SelectItem>
                        <SelectItem value="low">Low (When convenient)</SelectItem>
                      </SelectContent>
                    </Select>
                    {formErrors.priority && <p className="text-xs text-red-600 mt-1">{formErrors.priority}</p>}
                  </div>
                  <div>
                    <Label htmlFor="remarks">
                      Remarks {priority === 'high' && <span className="text-red-500">*</span>}
                    </Label>
                    <Input 
                      id="remarks" 
                      placeholder={priority === 'high' ? 'Required for high priority assignments' : 'Optional remarks'} 
                      value={remarks} 
                      onChange={(e)=>{setRemarks(e.target.value); setFormErrors((fe)=>({...fe, remarks: ''}))}} 
                    />
                    {formErrors.remarks && <p className="text-xs text-red-600 mt-1">{formErrors.remarks}</p>}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={()=>setAssignOpen(false)}>Cancel</Button>
              <Button 
                onClick={submitAssign} 
                className="text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" 
                disabled={
                  assignmentMode === 'multiple' 
                    ? journeyAssignments.filter(a => a.officerId > 0).length === 0
                    : !officerId || (priority === 'high' && !remarks?.trim())
                }
              >
                {assignmentMode === 'multiple' ? 'Assign Officers' : 'Assign Officer'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Services Modal */}
      <Dialog open={servicesOpen} onOpenChange={setServicesOpen}>
        <DialogContent className="sm:max-w-lg bg-gray-50">
          <DialogHeader>
            <DialogTitle>Add Services</DialogTitle>
            <DialogDescription>
              Add vehicle, accommodation, or other service requests for this protocol request.
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="vehicle">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="vehicle"><Car className="h-4 w-4 mr-1" /> Vehicle</TabsTrigger>
              <TabsTrigger value="guesthouse"><Home className="h-4 w-4 mr-1" /> Guesthouse</TabsTrigger>
              <TabsTrigger value="other"><FileText className="h-4 w-4 mr-1" /> Other</TabsTrigger>
            </TabsList>

            <TabsContent value="vehicle" className="space-y-3 pt-3">
              <div>
                <Label>Vehicle Number</Label>
                <Input value={vehicle.vehicle_number} onChange={(e)=>{ setVehicle({...vehicle, vehicle_number: e.target.value}); setFormErrors((fe)=>({ ...fe, vehicle_number: '' })); }} />
                {formErrors.vehicle_number ? <p className="text-xs text-red-600 mt-1">{formErrors.vehicle_number}</p> : null}
              </div>
              <div>
                <Label>Car Model</Label>
                <Input value={vehicle.vehicle_type} onChange={(e)=>{ setVehicle({...vehicle, vehicle_type: e.target.value}); setFormErrors((fe)=>({ ...fe, vehicle_type: '' })); }} />
                {formErrors.vehicle_type ? <p className="text-xs text-red-600 mt-1">{formErrors.vehicle_type}</p> : null}
              </div>
              <div>
                <Label>Driver Name</Label>
                <Input value={vehicle.driver_name} onChange={(e)=>{ setVehicle({...vehicle, driver_name: e.target.value}); setFormErrors((fe)=>({ ...fe, driver_name: '' })); }} />
                {formErrors.driver_name ? <p className="text-xs text-red-600 mt-1">{formErrors.driver_name}</p> : null}
              </div>
              <div>
                <Label>Driver Contact No</Label>
                <Input value={vehicle.driver_contact_no} onChange={(e)=>{ setVehicle({...vehicle, driver_contact_no: e.target.value}); setFormErrors((fe)=>({ ...fe, driver_contact_no: '' })); }} />
                {formErrors.driver_contact_no ? <p className="text-xs text-red-600 mt-1">{formErrors.driver_contact_no}</p> : null}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={()=>setServicesOpen(false)}>Close</Button>
                <Button onClick={submitVehicle} className="text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Add Vehicle</Button>
              </div>
            </TabsContent>

            <TabsContent value="guesthouse" className="space-y-3 pt-3">
              <div>
                <Label>Accommodation Address</Label>
                <Textarea className="p-2" value={guesthouse.guesthouse_location} onChange={(e)=>{ setGuesthouse({...guesthouse, guesthouse_location: e.target.value}); setFormErrors((fe)=>({ ...fe, guesthouse_location: '' })); }} />
                {formErrors.guesthouse_location ? <p className="text-xs text-red-600 mt-1">{formErrors.guesthouse_location}</p> : null}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={()=>setServicesOpen(false)}>Close</Button>
                <Button onClick={submitGuesthouse} className="text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Add Guesthouse</Button>
              </div>
            </TabsContent>

            <TabsContent value="other" className="space-y-3 pt-3">
              <div>
                <Label>Purpose</Label>
                <Textarea className="p-2" value={other.purpose} onChange={(e)=>{ setOther({ purpose: e.target.value }); setFormErrors((fe)=>({ ...fe, purpose: '' })); }} />
                {formErrors.purpose ? <p className="text-xs text-red-600 mt-1">{formErrors.purpose}</p> : null}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={()=>setServicesOpen(false)}>Close</Button>
                <Button onClick={submitOther} className="text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Add Other</Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Request Details Modal */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-2xl bg-gray-50 max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Request Details - REQ-{selected?.id}</DialogTitle>
            <DialogDescription>
              View comprehensive details about this protocol request including journey, guests, and services.
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Requestee</Label>
                  <p className="text-sm text-gray-900 mt-1">{(selected as any).requestee?.username ?? 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Created</Label>
                  <p className="text-sm text-gray-900 mt-1">{new Date(selected.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Status</Label>
                  <div className="mt-1">
                    <Badge variant="outline" className="border-yellow-500 text-yellow-700">Pending</Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Guest Count</Label>
                  <p className="text-sm text-gray-900 mt-1">{selected.guestUsers?.length ?? 0}</p>
                </div>
              </div>

              {/* Purpose */}
              <div>
                <Label className="text-sm font-medium text-gray-700">Purpose</Label>
                <p className="text-sm text-gray-900 mt-1 p-3 bg-white rounded-md border">{selected.purpose}</p>
              </div>

              {/* Journey Details */}
              {selected.journeyDetails && selected.journeyDetails.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-gray-700 flex items-center mb-3">
                    <MapPin className="h-4 w-4 mr-1" />
                    Journey Details
                  </Label>
                  <div className="space-y-2">
                    {selected.journeyDetails
                      .slice()
                      .sort((a, b) => a.leg_order - b.leg_order)
                      .map((leg, index) => (
                        <div key={index} className="flex items-center p-3 bg-white rounded-md border">
                          <div className="flex-1">
                            <div className="flex items-center text-sm">
                              <span className="font-medium text-gray-900">{leg.from_location}</span>
                              <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
                              <span className="font-medium text-gray-900">{leg.to_location}</span>
                              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {getModeIcon(leg.mode)} {leg.mode}
                              </span>
                            </div>
                            <div className="flex items-center mt-1 text-xs text-gray-500">
                              <Clock className="h-3 w-3 mr-1" />
                              {new Date(leg.arrival_date).toLocaleDateString()} at {leg.arrival_time}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Guest Users */}
              {selected.guestUsers && selected.guestUsers.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-gray-700 flex items-center mb-3">
                    <Users className="h-4 w-4 mr-1" />
                    Guest Users ({selected.guestUsers.length})
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selected.guestUsers.map((guest, index) => (
                      <div key={index} className="p-3 bg-white rounded-md border">
                        <div className="text-sm font-medium text-gray-900">{guest.first_name} {guest.last_name}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Age: {guest.age} • Contact: {guest.contact_number}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Service Requests */}
              <div>
                <Label className="text-sm font-medium text-gray-700 flex items-center mb-3">
                  <Settings className="h-4 w-4 mr-1" />
                  Service Requests
                </Label>
                
                {/* Vehicle Requests */}
                {selected.vehicleRequests && selected.vehicleRequests.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-900 flex items-center mb-2">
                      <Car className="h-4 w-4 mr-1" />
                      Vehicle Requests ({selected.vehicleRequests.length})
                    </div>
                    <div className="space-y-2">
                      {selected.vehicleRequests.map((vehicle, index) => (
                        <div key={index} className="p-3 bg-white rounded-md border border-blue-200">
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="font-medium text-gray-700">Vehicle Type:</span>
                              <span className="ml-1 text-gray-900">{vehicle.vehicle_type || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Vehicle Number:</span>
                              <span className="ml-1 text-gray-900">{vehicle.vehicle_number || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Driver Name:</span>
                              <span className="ml-1 text-gray-900">{vehicle.driver_name || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Driver Contact:</span>
                              <span className="ml-1 text-gray-900">{vehicle.driver_contact_no || 'N/A'}</span>
                            </div>
                            {vehicle.pickup_location && (
                              <div className="col-span-2">
                                <span className="font-medium text-gray-700">Route:</span>
                                <span className="ml-1 text-gray-900">{vehicle.pickup_location} → {vehicle.destination}</span>
                              </div>
                            )}
                            {vehicle.purpose && (
                              <div className="col-span-2">
                                <span className="font-medium text-gray-700">Purpose:</span>
                                <span className="ml-1 text-gray-900">{vehicle.purpose}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Guesthouse Requests */}
                {selected.guesthouseRequests && selected.guesthouseRequests.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-900 flex items-center mb-2">
                      <Home className="h-4 w-4 mr-1" />
                      Accommodation Requests ({selected.guesthouseRequests.length})
                    </div>
                    <div className="space-y-2">
                      {selected.guesthouseRequests.map((guesthouse, index) => (
                        <div key={index} className="p-3 bg-white rounded-md border border-green-200">
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="col-span-2">
                              <span className="font-medium text-gray-700">Location:</span>
                              <span className="ml-1 text-gray-900">{guesthouse.guesthouse_location || 'N/A'}</span>
                            </div>
                            {guesthouse.check_in_date && (
                              <div>
                                <span className="font-medium text-gray-700">Check-in:</span>
                                <span className="ml-1 text-gray-900">{new Date(guesthouse.check_in_date).toLocaleDateString()}</span>
                              </div>
                            )}
                            {guesthouse.checkout_date && (
                              <div>
                                <span className="font-medium text-gray-700">Check-out:</span>
                                <span className="ml-1 text-gray-900">{new Date(guesthouse.checkout_date).toLocaleDateString()}</span>
                              </div>
                            )}
                            {guesthouse.guest_count && (
                              <div>
                                <span className="font-medium text-gray-700">Guest Count:</span>
                                <span className="ml-1 text-gray-900">{guesthouse.guest_count}</span>
                              </div>
                            )}
                            {guesthouse.purpose && (
                              <div className="col-span-2">
                                <span className="font-medium text-gray-700">Purpose:</span>
                                <span className="ml-1 text-gray-900">{guesthouse.purpose}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Other Requests */}
                {selected.otherRequests && selected.otherRequests.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-900 flex items-center mb-2">
                      <FileText className="h-4 w-4 mr-1" />
                      Other Requests ({selected.otherRequests.length})
                    </div>
                    <div className="space-y-2">
                      {selected.otherRequests.map((other, index) => (
                        <div key={index} className="p-3 bg-white rounded-md border border-purple-200">
                          <div className="text-xs">
                            <span className="font-medium text-gray-700">Purpose:</span>
                            <span className="ml-1 text-gray-900">{other.purpose}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Service Requests */}
                {(!selected.vehicleRequests || selected.vehicleRequests.length === 0) &&
                 (!selected.guesthouseRequests || selected.guesthouseRequests.length === 0) &&
                 (!selected.otherRequests || selected.otherRequests.length === 0) && (
                  <div className="p-4 bg-gray-50 rounded-md border border-gray-200 text-center">
                    <div className="text-sm text-gray-500">No service requests have been added yet</div>
                    <div className="text-xs text-gray-400 mt-1">Use the "Services" button to add vehicle, accommodation, or other requests</div>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <Button variant="secondary" onClick={() => setDetailsOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
