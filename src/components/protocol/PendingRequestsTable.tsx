"use client";

import { useEffect, useMemo, useState } from "react";
import { protocolInchargeApi, usersApi } from "@/lib/api";
import type { Request } from "@/types/requestStatusCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Car, Home, FileText, UserPlus, RefreshCw, PlusCircle } from "lucide-react";
import { Textarea } from "../ui/textarea";
import { z } from "zod";

type RequestRow = Request & { requestee?: { id: number; username: string; user_type?: string } };

// Simple data table using basic shadcn primitives
export default function PendingRequestsTable() {
  const [rows, setRows] = useState<RequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [assignOpen, setAssignOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [selected, setSelected] = useState<Request | null>(null);

  // Assign officer form state
  const [officerId, setOfficerId] = useState<string>("");
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");
  const [remarks, setRemarks] = useState("");

  const [officers, setOfficers] = useState<Array<{ id: number; username: string }>>([]);
  const [officerSearch, setOfficerSearch] = useState("");
  const [officerLoading, setOfficerLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Service forms state
  const [vehicle, setVehicle] = useState({ vehicle_type: "", vehicle_number: "", driver_name: "", driver_contact_no: "" });
  const [guesthouse, setGuesthouse] = useState({ guesthouse_location: "" });
  const [other, setOther] = useState({ purpose: "" });

  // Client-side Zod schemas for service forms
  const vehicleSchema = z.object({
    vehicle_type: z.string().min(1, "Car model is required"),
    vehicle_number: z.string().min(1, "Vehicle number is required"),
    driver_name: z.string().min(1, "Driver name is required"),
    driver_contact_no: z
      .string()
      .min(7, "Contact no. seems short")
      .regex(/^[0-9+\-()\s]+$/i, "Invalid contact number"),
  });
  const guesthouseSchema = z.object({
    guesthouse_location: z.string().min(1, "Accommodation address is required"),
  });
  const otherSchema = z.object({ purpose: z.string().min(1, "Purpose is required") });

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

  useEffect(() => {
    fetchRows(1);
  }, []);

  useEffect(() => {
    if (!assignOpen) return;
    let active = true;
    const t = setTimeout(async () => {
      try {
        setOfficerLoading(true);
        const res = await usersApi.listProtocolOfficers(officerSearch);
        const data = (res as any)?.data?.data ?? [];
        if (active) setOfficers(data);
      } catch (e) {
        if (active) setOfficers([]);
      } finally {
        if (active) setOfficerLoading(false);
      }
    }, 300);
    return () => { active = false; clearTimeout(t); };
  }, [assignOpen, officerSearch]);

  const onOpenAssign = (r: Request) => {
    setSelected(r);
    setOfficerId("");
    setPriority("medium");
    setRemarks("");
    setFormErrors({});
    setAssignOpen(true);
  };

  const onOpenServices = (r: Request) => {
    setSelected(r);
    setVehicle({ vehicle_type: "", vehicle_number: "", driver_name: "", driver_contact_no: "" });
    setGuesthouse({ guesthouse_location: "" });
    setOther({ purpose: "" });
    setFormErrors({});
    setServicesOpen(true);
  };

  const submitAssign = async () => {
    if (!selected) return;
    if (!officerId) {
      toast.warning("Please enter officer ID");
      return;
    }
    try {
      await protocolInchargeApi.assignOfficer({
        requestId: selected.id,
        officerId: Number(officerId),
        priority,
        remarks: remarks || undefined,
        officerLocationId: officerLocationId || undefined,
      });
      toast.success("Officer assigned successfully");
      setAssignOpen(false);
      fetchRows();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? err?.message ?? "Failed to assign officer");
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
        vehicle_type: vehicle.vehicle_type || undefined,
        vehicle_number: vehicle.vehicle_number || undefined,
        driver_name: vehicle.driver_name || undefined,
        driver_contact_no: vehicle.driver_contact_no || undefined,
      });
      toast.success("Vehicle request added");
      fetchRows();
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
        guesthouse_location: guesthouse.guesthouse_location || undefined,
      });
      toast.success("Guesthouse address added");
      fetchRows();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? err?.message ?? "Failed to add guesthouse request");
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
      await protocolInchargeApi.addOtherRequest(selected.id, { purpose: other.purpose });
      toast.success("Other request added");
      fetchRows();
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
        <DialogContent className="sm:max-w-md bg-gray-50">
          <DialogHeader>
            <DialogTitle>Assign Protocol Officer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Search Officer</Label>
              <Input placeholder="Type to search…" value={officerSearch} onChange={(e)=>setOfficerSearch(e.target.value)} />
            </div>
            <div>
              <Select value={officerId} onValueChange={(v)=>setOfficerId(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={officerLoading ? 'Loading…' : 'Choose officer'} />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto bg-gradient-to-b from-white to-gray-50">
                  {officers.length === 0 ? (
                    <div className="px-3 py-2 text-gray-500 text-sm">{officerLoading ? 'Loading…' : 'No officers found'}</div>
                  ) : (
                    officers.map((o) => (
                      <SelectItem key={o.id} value={String(o.id)}>{o.username}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v)=>setPriority(v as any)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent className="bg-gradient-to-b from-white to-gray-50">
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="remarks">Remarks</Label>
              <Input id="remarks" placeholder="Optional remarks" value={remarks} onChange={(e)=>setRemarks(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={()=>setAssignOpen(false)}>Cancel</Button>
              <Button onClick={submitAssign} className="text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" disabled={!officerId}>Assign</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Services Modal */}
      <Dialog open={servicesOpen} onOpenChange={setServicesOpen}>
        <DialogContent className="sm:max-w-lg bg-gray-50">
          <DialogHeader>
            <DialogTitle>Add Services</DialogTitle>
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
    </div>
  );
}
