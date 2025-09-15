"use client";

import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { FileWarningIcon, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  requestFormSchema as formSchema,
  RequestFormData,
} from "@/schemas/request.schema";
import { createRequestApi } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";

export default function RequestForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<"basic" | "travel" | "requests" | "review">(
    "basic"
  );
  const { user, isAuthenticated } = useAuth();

  const form = useForm<RequestFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      purpose: "",
      specialNotes: "",
      journeyDetails: [
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
          // departureDate: "",
          // departureTime: "",
        },
      ],
      guestUsers: [
        {
          firstName: "",
          lastName: "",
          age: "0",
          contactNumber: "",
        },
      ],
    },
  });

  const {
    fields: journeyFields,
    append: appendJourney,
    remove: removeJourney,
  } = useFieldArray({
    control: form.control,
    name: "journeyDetails",
  });

  const {
    fields: guestFields,
    append: appendGuest,
    remove: removeGuest,
  } = useFieldArray({
    control: form.control,
    name: "guestUsers",
  });

  const {
    fields: vehicleFields,
    append: appendVehicle,
    remove: removeVehicle,
  } = useFieldArray({
    control: form.control,
    name: "vehicleRequests",
  });

  const {
    fields: guesthouseFields,
    append: appendGuesthouse,
    remove: removeGuesthouse,
  } = useFieldArray({
    control: form.control,
    name: "guesthouseRequests",
  });

  const {
    fields: otherFields,
    append: appendOther,
    remove: removeOther,
  } = useFieldArray({
    control: form.control,
    name: "otherRequests",
  });

  const onSubmit = async (data: RequestFormData) => {
    setIsSubmitting(true);
    try {
      console.log("Form submit triggered"); // Debug log
      console.log("User:", user); // Debug log
      //console.log("Authenticated:", isAuthenticated);
      console.log("Submitting data:", data); // debug log
      await createRequestApi.createRequest(data);
      toast.success("Submitted successfully!");
      form.reset();
      setStep("basic");
    } catch (err) {
      toast.error("Failed to submit");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // <div className="grid grid-cols-2 grid-rows-1 gap-2">
    <Card className="p-4 shadow-md">
      <h3 className="mt-2 text-center md:text-xl font-bold text-sm ">
        Submit Your Official Visit Requests.
      </h3>
      <hr></hr>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, (errors) => {
           
            toast.warning("Please correct the highlighted fields", {
              position: "top-center",
              action: {
                label: "Correct",
                onClick: () => setStep("basic"),
              },
            });
          })}
        >
          <Tabs value={step}>
            {/* Step indicator */}
            <div className="flex justify-between mb-4 text-xs md:text-sm text-muted-foreground">
              <span
                className={step === "basic" ? "font-semibold text-primary" : ""}
              >
                Step 1: Journey
              </span>
              <span
                className={
                  step === "travel" ? "font-semibold text-primary" : ""
                }
              >
                Step 2: Details
              </span>
              <span
                className={
                  step === "requests" ? "font-semibold text-primary" : ""
                }
              >
                Step 3: Required
              </span>
              <span
                className={
                  step === "review" ? "font-semibold text-primary" : ""
                }
              >
                Step 4: Review
              </span>
            </div>

            {/* STEP 1: Basic */}
            <TabsContent value="basic" className="mt-0">
              <CardContent className="space-y-2 ">
                {/* <FormField
                  control={form.control}
                  name="guestCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input type="number" min={1} {...field} placeholder="Guest Count" />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">
                        How many guests are expected?
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}

                {/* <FormField
                  control={form.control}
                  name="contactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input {...field} placeholder="Contact Person Name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}

                {/* <FormField
                  control={form.control}
                  name="contactMobile"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input type="tel" {...field} placeholder="Contact Mobile Number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}

                {journeyFields.map((field, index) => {
                  const mode = form.watch(`journeyDetails.${index}.mode`);
                  return (
                    <Card key={field.id} className="p-2 ">
                      <CardContent className="grid gap-2 space-y-1">
                        <div className="flex justify-between items-center">
                          <h3 className="font-semibold">
                            Journey Detail {index + 1}
                          </h3>
                          <Button
                            variant="ghost"
                            size="icon"
                            type="button"
                            onClick={() => removeJourney(index)}
                            disabled={journeyFields.length === 1}
                            hidden={journeyFields.length === 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-7 gap-4">
                          {/* Mode Selector */}
                          <div className="w-30">
                            <Label className="p-1 m-0 w-30">
                              Mode of Travel
                            </Label>
                            <Select
                              onValueChange={(val) =>
                                form.setValue(
                                  `journeyDetails.${index}.mode`,
                                  val as any
                                )
                              }
                              defaultValue={field.mode}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select mode" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="BYROAD">
                                  🛣️ By Road
                                </SelectItem>
                                <SelectItem value="BYRAIL">
                                  🚂 By Rail
                                </SelectItem>
                                <SelectItem value="BYAIR">
                                  ✈️ By Air
                                  </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* From / To */}
                          <div>
                            <Label className="p-1">From Location</Label>
                            <FormField
                              control={form.control}
                              name={`journeyDetails.${index}.fromLocation`}
                              render={({ field, fieldState }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder="Enter origin"
                                      className={
                                        fieldState.error
                                          ? "border-red-500 focus:ring-red-500"
                                          : ""
                                      }
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div>
                            <Label className="p-1">To Location</Label>
                            <FormField
                              control={form.control}
                              name={`journeyDetails.${index}.toLocation`}
                              render={({ field, fieldState }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder="Enter destination"
                                      className={
                                        fieldState.error
                                          ? "border-red-500 focus:ring-red-500"
                                          : ""
                                      }
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          {/* Conditional Fields */}
                          {mode === "BYRAIL" && (
                            <div>
                              <Label className="p-1">Train Number</Label>
                              <FormField
                                control={form.control}
                                name={`journeyDetails.${index}.trainNumber`}
                                render={({ field, fieldState }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input
                                        {...field}
                                        value={field.value ?? ""}
                                        placeholder="e.g. 18234"
                                        className={
                                          fieldState.error
                                            ? "border-red-500 focus:ring-red-500"
                                            : ""
                                        }
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          )}
                          {mode === "BYAIR" && (
                            <div>
                              <Label className="p-1">Flight Number</Label>
                              <FormField
                                control={form.control}
                                name={`journeyDetails.${index}.flightNumber`}
                                render={({ field, fieldState }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input
                                        {...field}
                                        value={field.value ?? ""}
                                        placeholder="e.g. AI202"
                                        className={
                                          fieldState.error
                                            ? "border-red-500 focus:ring-red-500"
                                            : ""
                                        }
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          )}
                          {mode === "BYROAD" && (
                            <div>
                              <Label className="p-1">Vehicle Number</Label>
                              <FormField
                                control={form.control}
                                name={`journeyDetails.${index}.vehicleNumber`}
                                render={({ field, fieldState }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input
                                        {...field}
                                        value={field.value ?? ""}
                                        placeholder="e.g. MP04AB1234"
                                        className={
                                          fieldState.error
                                            ? "border-red-500 focus:ring-red-500"
                                            : ""
                                        }
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          )}

                          {/* Arrival & Departure */}

                          <div>
                            <Label className="p-1">Arrival Date</Label>
                            <FormField
                              control={form.control}
                              name={`journeyDetails.${index}.arrivalDate`}
                              render={({ field, fieldState }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      type="date"
                                      {...field}
                                      className={
                                        fieldState.error ? "border-red-500" : ""
                                      }
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div>
                            <Label className="p-1">Arrival Time</Label>
                            <FormField
                              control={form.control}
                              name={`journeyDetails.${index}.arrivalTime`}
                              render={({ field, fieldState }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      type="time"
                                      {...field}
                                      className={
                                        fieldState.error ? "border-red-500" : ""
                                      }
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div>
                            <Button
                              type="button"
                              className=" mx-auto w-auto h-auto mt-4 mb-4  "
                              variant="outline"
                              onClick={() =>
                                appendJourney({
                                  legOrder: journeyFields.length + 1,
                                  mode: "BYROAD",
                                  fromLocation: "",
                                  toLocation: "",
                                  arrivalDate: "",
                                  arrivalTime: "",
                                  // departureDate: "",
                                  // departureTime: "",
                                })
                              }
                            >
                              <Plus className="h-4 w-4" />
                              Add
                            </Button>
                          </div>
                          {/* <div>
                      <Label className='p-1'>Departure Date</Label>
                      <Input type="date" {...form.register(`journeyDetails.${index}.departureDate`)} />
                    </div>
                    <div>
                      <Label className='p-1'>Departure Time</Label>
                      <Input type="time" {...form.register(`journeyDetails.${index}.departureTime`)} />
                    </div> */}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="purpose"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea {...field} placeholder="Purpose of Visit" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="specialNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Write special note (if any)"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="button" onClick={() => setStep("travel")}>
                    Next
                  </Button>
                </div>
              </CardContent>
            </TabsContent>

            {/* STEP 2: Person Info */}
            <TabsContent value="travel">
              <CardContent className="grid gap-4">
                {/* <FormField
                  control={form.control}
                  name="modeOfArrival"
                  render={({ field }) => (
                    <FormItem>
                      <p className="text-xs text-muted-foreground">
                        Mode of arrival
                      </p>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Mode of Arrival" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="BYROAD">🛣️ By Road</SelectItem>
                          <SelectItem value="BYAIR">✈️ By Air</SelectItem>
                          <SelectItem value="BYRAIL">🚂 By Rail</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}
                {/* <FormField
                  control={form.control}
                  name="arrivalStation"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input {...field} placeholder="Arrival Station / Airport" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}

                {guestFields.map((field, index) => (
                  <Card key={field.id} className="p-4">
                    <CardContent className="grid gap-4">
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold">
                          Person Details {index + 1}
                        </h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          type="button"
                          onClick={() => removeGuest(index)}
                          disabled={guestFields.length === 1}
                          hidden={guestFields.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-5  gap-4">
                        <div>
                          <Label className="p-1">First Name</Label>
                          <FormField
                            control={form.control}
                            name={`guestUsers.${index}.firstName`}
                            render={({ field, fieldState }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    type="text"
                                    {...field}
                                    placeholder="First Name"
                                    className={
                                      fieldState.error
                                        ? "border-red-500 focus:ring-red-500"
                                        : ""
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div>
                          <Label className="p-1">Last Name</Label>
                          <FormField
                            control={form.control}
                            name={`guestUsers.${index}.lastName`}
                            render={({ field, fieldState }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    type="text"
                                    {...field}
                                    placeholder="Last Name"
                                    className={
                                      fieldState.error
                                        ? "border-red-500 focus:ring-red-500"
                                        : ""
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div>
                          <Label className="p-1">Age</Label>
                          <FormField
                            control={form.control}
                            name={`guestUsers.${index}.age`}
                            render={({ field, fieldState }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    type="number"
                                    {...field}
                                    // onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                                    placeholder="Age"
                                    className={
                                      fieldState.error
                                        ? "border-red-500 focus:ring-red-500"
                                        : ""
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div>
                          <Label className="p-1">
                            Contact Number (optional)
                          </Label>
                          <FormField
                            control={form.control}
                            name={`guestUsers.${index}.contactNumber`}
                            render={({ field, fieldState }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    type="tel"
                                    {...field}
                                    placeholder="Enter contact number"
                                    className={
                                      fieldState.error
                                        ? "border-red-500 focus:ring-red-500"
                                        : ""
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div>
                          <Button
                            type="button"
                            className=" mx-auto w-auto h-10 mt-4 mb-4"
                            variant="outline"
                            onClick={() =>
                              appendGuest({
                                firstName: "",
                                lastName: "",
                                age: "0",
                                contactNumber: "",
                              })
                            }
                          >
                            <Plus className="h-4 w-4 mr-2" /> Add Person
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep("basic")}
                  >
                    Back
                  </Button>
                  <Button type="button" onClick={() => setStep("requests")}>
                    Next
                  </Button>
                </div>
              </CardContent>
            </TabsContent>

            {/* STEP 3: Requests */}
            <TabsContent value="requests">
              <CardContent className="space-y-4">
                <Accordion type="single" collapsible>
                  {/* Vehicle */}
                  <AccordionItem value="vehicle">
                    <AccordionTrigger>Vehicle Requests</AccordionTrigger>
                    <AccordionContent>
                      {vehicleFields.length === 0 && (
                        <p className="text-xs text-muted-foreground mb-2">
                          No vehicles added yet.
                        </p>
                      )}
                      {vehicleFields.map((field, index) => (
                        <div
                          key={field.id}
                          className="flex gap-4 justify-evenly items-center mb-4 mt-4"
                        >
                          <FormField
                            control={form.control}
                            name={`vehicleRequests.${index}.pickupLocation`}
                            render={({ field, fieldState }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    type="text"
                                    {...field}
                                    placeholder="Type pickup location"
                                    className={
                                      fieldState.error
                                        ? "border-red-500 focus:ring-red-500"
                                        : ""
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`vehicleRequests.${index}.destination`}
                            render={({ field, fieldState }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    type="text"
                                    {...field}
                                    placeholder="Type destination location"
                                    className={
                                      fieldState.error
                                        ? "border-red-500 focus:ring-red-500"
                                        : ""
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`vehicleRequests.${index}.purpose`}
                            render={({ field, fieldState }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    type="text"
                                    {...field}
                                    placeholder="Write purpose"
                                    className={
                                      fieldState.error
                                        ? "border-red-500 focus:ring-red-500"
                                        : ""
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => removeVehicle(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          appendVehicle({
                            pickupLocation: "",
                            destination: "",
                            purpose: "",
                          })
                        }
                      >
                        <Plus className="w-4 h-4 mr-1" /> Add 
                      </Button>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Guesthouse */}
                  <AccordionItem value="guesthouse">
                    <AccordionTrigger>Accommodation Requests</AccordionTrigger>
                    <AccordionContent>
                      {guesthouseFields.length === 0 && (
                        <p className="text-xs text-muted-foreground mb-2">
                          No guesthouse requests yet.
                        </p>
                      )}
                      {guesthouseFields.map((field, index) => (
                        <div
                          key={field.id}
                          className="grid grid-cols-5 gap-4 m-4 p-4"
                        >
                          <FormField
                            control={form.control}
                            name={`guesthouseRequests.${index}.guestCount`}
                            render={({ field, fieldState }) => (
                              <FormItem>
                                <label>Number of Guests:</label>
                                <FormControl>
                                  <Input
                                    type="number"
                                    {...field}
                                    placeholder="Number of Guests"
                                    className={
                                      fieldState.error
                                        ? "border-red-500 focus:ring-red-500"
                                        : ""
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`guesthouseRequests.${index}.checkInDate`}
                            render={({ field, fieldState }) => (
                              <FormItem>
                                <label>Check-in Date:</label>
                                <FormControl>
                                  <Input
                                    type="date"
                                    {...field}
                                    className={
                                      fieldState.error
                                        ? "border-red-500 focus:ring-red-500"
                                        : ""
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`guesthouseRequests.${index}.checkoutDate`}
                            render={({ field, fieldState }) => (
                              <FormItem>
                                <label>Check-out Date:</label>
                                <FormControl>
                                  <Input
                                    type="date"
                                    {...field}
                                    className={
                                      fieldState.error
                                        ? "border-red-500 focus:ring-red-500"
                                        : ""
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`guesthouseRequests.${index}.purpose`}
                            render={({ field, fieldState }) => (
                              <FormItem>
                                <label>Purpose:</label>
                                <FormControl>
                                  <Input
                                    type="text"
                                    {...field}
                                    placeholder="Write purpose"
                                    className={
                                      fieldState.error
                                        ? "border-red-500 focus:ring-red-500"
                                        : ""
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="mt-7 w-10"
                            onClick={() => removeGuesthouse(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          appendGuesthouse({
                            checkInDate: "",
                            checkoutDate: "",
                            purpose: "",
                            guestCount: "1",
                          })
                        }
                      >
                        <Plus className="w-4 h-4 mr-1" /> Add
                      </Button>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Other */}
                  <AccordionItem value="other">
                    <AccordionTrigger>Other Requests</AccordionTrigger>
                    <AccordionContent>
                      {otherFields.length === 0 && (
                        <p className="text-xs text-muted-foreground mb-2">
                          No other requests yet.
                        </p>
                      )}
                      {otherFields.map((field, index) => (
                        <div
                          key={field.id}
                          className="flex gap-2 items-center m-4 p-2"
                        >
                          <Input
                            {...form.register(`otherRequests.${index}.purpose`)}
                            placeholder="Write your special request"
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            onClick={() => removeOther(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => appendOther({ purpose: "" })}
                      >
                        <Plus className="w-4 h-4 mr-1" /> Add 
                      </Button>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep("travel")}
                  >
                    Back
                  </Button>
                  <Button type="button" onClick={() => setStep("review")}>
                    Next
                  </Button>
                </div>
              </CardContent>
            </TabsContent>

            {/* STEP 4: Review */}
            <TabsContent value="review">
              <CardContent className="space-y-6">
                <h3 className="text-lg font-semibold">Review Your Request</h3>
                <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                    <p className="text-sm text-blue-800">Please review all details carefully before submitting.</p>
                  </div>

                {/* Basic */}
                <div className="border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Travling Info</h4>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-6 px-2 text-xs"
                      onClick={() => setStep("basic")}
                    >
                      Edit
                    </Button>
                  </div>
                  <div className="text-sm grid grid-cols-2 gap-2">
                    <span className="text-muted-foreground">
                      Purpose of Visit:
                    </span>
                    <span>{form.getValues("purpose") || "—"}</span>
                    <span className="text-muted-foreground">
                      Special Notes:
                    </span>
                    <span>{form.getValues("specialNotes") || "—"}</span>
                  </div>
                </div>

                {/* Journey Details */}
                <div className="border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Journey Details</h4>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-6 px-2 text-xs"
                      onClick={() => setStep("basic")}
                    >
                      Edit
                    </Button>
                  </div>
                  {form.getValues("journeyDetails")?.length ? (
                    <ul className="space-y-2 text-sm">
                      {form.getValues("journeyDetails").map((j, idx) => (
                        <li key={idx} className="border rounded p-2">
                          <div className="font-medium">Journey {idx + 1}</div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <span className="text-muted-foreground">Mode:</span>
                            <span>{j.mode}</span>
                            <span className="text-muted-foreground">From:</span>
                            <span>{j.fromLocation}</span>
                            <span className="text-muted-foreground">To:</span>
                            <span>{j.toLocation}</span>
                            <span className="text-muted-foreground">
                              Arrival:
                            </span>
                            <span>
                              {j.arrivalDate} {j.arrivalTime}
                            </span>
                            <span className="text-muted-foreground">
                              {/* Departure: */}
                            </span>
                            <span>
                              {/* {j.departureDate} {j.departureTime} */}
                            </span>
                            {j.mode === "BYRAIL" && (
                              <>
                                <span className="text-muted-foreground">
                                  Train:
                                </span>
                                <span>{j.trainNumber}</span>
                              </>
                            )}
                            {j.mode === "BYAIR" && (
                              <>
                                <span className="text-muted-foreground">
                                  Flight:
                                </span>
                                <span>{j.flightNumber}</span>
                              </>
                            )}
                            {j.mode === "BYROAD" && (
                              <>
                                <span className="text-muted-foreground">
                                  Vehicle:
                                </span>
                                <span>{j.vehicleNumber}</span>
                              </>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No journeys added
                    </p>
                  )}
                </div>
                {/* Guest Users */}
                <div className="border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Guest Users</h4>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-6 px-2 text-xs"
                      onClick={() => setStep("travel")}
                    >
                      Edit
                    </Button>
                  </div>
                  {form.getValues("guestUsers")?.length ? (
                    <ul className="space-y-2 text-sm">
                      {form.getValues("guestUsers").map((g, idx) => (
                        <li key={idx} className="border rounded p-2">
                          <div className="font-medium">
                            {g.firstName} {g.lastName}
                          </div>
                          <div className="text-xs grid grid-cols-2 gap-2">
                            <span className="text-muted-foreground">Age:</span>
                            <span>{g.age}</span>
                            <span className="text-muted-foreground">
                              Contact:
                            </span>
                            <span>{g.contactNumber || "—"}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No guests added
                    </p>
                  )}
                </div>

                {/* Vehicle */}

                <div className="border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Vehicle Requests</h4>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-6 px-2 text-xs"
                      onClick={() => setStep("requests")}
                    >
                      Edit
                    </Button>
                  </div>
                  {form.getValues("vehicleRequests")?.length ? (
                    <ul className="list-disc pl-5 text-sm">
                      {form.getValues("vehicleRequests")?.map((v, idx) => (
                        <li key={idx}>
                          {v.pickupLocation} → {v.destination} ({v.purpose})
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">None</p>
                  )}
                </div>
                {/* Guesthouse Requests */}
                <div className="border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Accommodation Requests</h4>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-6 px-2 text-xs"
                      onClick={() => setStep("requests")}
                    >
                      Edit
                    </Button>
                  </div>
                  {form.getValues("guesthouseRequests")?.length ? (
                    <ul className="list-disc pl-5 text-sm">
                      {form.getValues("guesthouseRequests")?.map((v, idx) => (
                        <li key={idx}>
                          <span className="text-muted-foreground">
                            Guest Count:
                          </span>
                          <span>{v.guestCount}</span>
                          <br></br>
                          <span className="text-muted-foreground">
                            Check In Date:
                          </span>
                          <span>{v.checkInDate}</span>
                          <br></br>
                          <span className="text-muted-foreground">
                            Check Out Date:
                          </span>
                          <span>{v.checkoutDate}</span>
                          <br></br>
                          <span className="text-muted-foreground">Purpos:</span>
                          <span>{v.purpose}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">None</p>
                  )}
                </div>
                {/* Other Requests */}
                <div className="border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Other Requests</h4>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-6 px-2 text-xs"
                      onClick={() => setStep("requests")}
                    >
                      Edit
                    </Button>
                  </div>
                  {form.getValues("otherRequests")?.length ? (
                    <ul className="list-disc pl-5 text-sm">
                      {form.getValues("otherRequests")?.map((o, idx) => (
                        <li key={idx}>
                          <span className="text-muted-foreground">
                            Other Request:
                          </span>
                          <span>{o.purpose}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">None</p>
                  )}
                </div>

                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep("requests")}
                  >
                    Back
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                        Submitting...
                      </>
                    ) : (
                      "Confirm & Submit"
                    )}
                  </Button>
                </div>
              </CardContent>
            </TabsContent>
          </Tabs>
        </form>
      </Form>
    </Card>
  );
}
