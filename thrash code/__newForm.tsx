"use client";

import { useFieldArray, useForm } from "react-hook-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";

type JourneySegment = {
  legOrder: number;
  mode: "BYROAD" | "BYRAIL" | "BYAIR";
  fromLocation: string;
  toLocation: string;
  trainNumber?: string;
  flightNumber?: string;
  vehicleNumber?: string;
  arrivalDate: string;
  arrivalTime: string;
  departureDate: string;
  departureTime: string;
};

type Guest = {
  firstName: string;
  lastName: string;
  age: number;
  contactNumber?: string;
};

type FormValues = {
  purpose: string;
  specialNotes?: string;
  journeySegments: JourneySegment[];
  guests: Guest[];
};

export default function RequestForm() {
  const form = useForm<FormValues>({
    defaultValues: {
      purpose: "",
      specialNotes: "",
      journeySegments: [
        {
          legOrder: 1,
          mode: "BYRAIL",
          fromLocation: "",
          toLocation: "",
          trainNumber: "",
          flightNumber: "",
          vehicleNumber: "",
          arrivalDate: "",
          arrivalTime: "",
          departureDate: "",
          departureTime: "",
        },
      ],
      guests: [
        { firstName: "", lastName: "", age: 0, contactNumber: "" },
      ],
    },
  });

  const { control, register, handleSubmit, watch } = form;

  const {
    fields: journeyFields,
    append: addJourney,
    remove: removeJourney,
  } = useFieldArray({ control, name: "journeySegments" });

  const {
    fields: guestFields,
    append: addGuest,
    remove: removeGuest,
  } = useFieldArray({ control, name: "guests" });

  const onSubmit = (data: FormValues) => {
    console.log("Payload:", data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Tabs defaultValue="journey">
        <TabsList>
          <TabsTrigger value="journey">Journey Details</TabsTrigger>
          <TabsTrigger value="guests">Guest Information</TabsTrigger>
        </TabsList>

        {/* Journey Details */}
        <TabsContent value="journey" className="space-y-4">
          <div>
            <Label htmlFor="purpose">Purpose</Label>
            <Input id="purpose" {...register("purpose")} placeholder="Enter purpose of visit" />
          </div>

          <div>
            <Label htmlFor="specialNotes">Special Notes</Label>
            <Input id="specialNotes" {...register("specialNotes")} placeholder="Any special assistance required?" />
          </div>

          {journeyFields.map((field, index) => {
            const mode = watch(`journeySegments.${index}.mode`);
            return (
              <Card key={field.id} className="p-4">
                <CardContent className="grid gap-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">Leg {index + 1}</h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      onClick={() => removeJourney(index)}
                      disabled={journeyFields.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Mode Selector */}
                  <div>
                    <Label>Mode of Travel</Label>
                    <Select
                      onValueChange={(val) => form.setValue(`journeySegments.${index}.mode`, val as any)}
                      defaultValue={field.mode}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BYROAD">By Road</SelectItem>
                        <SelectItem value="BYRAIL">By Rail</SelectItem>
                        <SelectItem value="BYAIR">By Air</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* From / To */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>From Location</Label>
                      <Input {...register(`journeySegments.${index}.fromLocation`)} placeholder="Enter origin" />
                    </div>
                    <div>
                      <Label>To Location</Label>
                      <Input {...register(`journeySegments.${index}.toLocation`)} placeholder="Enter destination" />
                    </div>
                  </div>

                  {/* Conditional Fields */}
                  {mode === "BYRAIL" && (
                    <div>
                      <Label>Train Number</Label>
                      <Input {...register(`journeySegments.${index}.trainNumber`)} placeholder="e.g. 18234" />
                    </div>
                  )}
                  {mode === "BYAIR" && (
                    <div>
                      <Label>Flight Number</Label>
                      <Input {...register(`journeySegments.${index}.flightNumber`)} placeholder="e.g. AI202" />
                    </div>
                  )}
                  {mode === "BYROAD" && (
                    <div>
                      <Label>Vehicle Number</Label>
                      <Input {...register(`journeySegments.${index}.vehicleNumber`)} placeholder="e.g. MP04AB1234" />
                    </div>
                  )}

                  {/* Arrival & Departure */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Arrival Date</Label>
                      <Input type="date" {...register(`journeySegments.${index}.arrivalDate`)} />
                    </div>
                    <div>
                      <Label>Arrival Time</Label>
                      <Input type="time" {...register(`journeySegments.${index}.arrivalTime`)} />
                    </div>
                    <div>
                      <Label>Departure Date</Label>
                      <Input type="date" {...register(`journeySegments.${index}.departureDate`)} />
                    </div>
                    <div>
                      <Label>Departure Time</Label>
                      <Input type="time" {...register(`journeySegments.${index}.departureTime`)} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          <Button
            type="button"
            variant="outline"
            onClick={() =>
              addJourney({
                legOrder: journeyFields.length + 1,
                mode: "BYROAD",
                fromLocation: "",
                toLocation: "",
                arrivalDate: "",
                arrivalTime: "",
                departureDate: "",
                departureTime: "",
              })
            }
          >
            <Plus className="h-4 w-4 mr-2" /> Add Another Segment
          </Button>
        </TabsContent>

        {/* Guests */}
        <TabsContent value="guests" className="space-y-4">
          {guestFields.map((field, index) => (
            <Card key={field.id} className="p-4">
              <CardContent className="grid gap-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Guest {index + 1}</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    onClick={() => removeGuest(index)}
                    disabled={guestFields.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>First Name</Label>
                    <Input {...register(`guests.${index}.firstName`)} placeholder="First Name" />
                  </div>
                  <div>
                    <Label>Last Name</Label>
                    <Input {...register(`guests.${index}.lastName`)} placeholder="Last Name" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Age</Label>
                    <Input type="number" {...register(`guests.${index}.age`)} placeholder="Age" />
                  </div>
                  <div>
                    <Label>Contact Number (optional)</Label>
                    <Input {...register(`guests.${index}.contactNumber`)} placeholder="+91-XXXXXXXXXX" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={() => addGuest({ firstName: "", lastName: "", age: 0, contactNumber: "" })}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Another Guest
          </Button>
        </TabsContent>
      </Tabs>

      <Button type="submit" className="w-full">Submit Request</Button>
    </form>
  );
}



