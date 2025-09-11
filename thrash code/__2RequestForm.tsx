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
import { CheckCircle2, ChevronRight, Loader2, Plus, Trash2, Users, Car, Home, FileText } from "lucide-react";
import { toast } from "sonner";
import {
  requestFormSchema as formSchema,
  RequestFormData,
} from "@/schemas/request.schema";
import { createRequestApi } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";

export default function RequestForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<"basic" | "travel" | "requests" | "review">("basic");
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

  const steps = [
    { id: "basic", label: "Journey", icon: "🚂" },
    { id: "travel", label: "Travelers", icon: "👥" },
    { id: "requests", label: "Services", icon: "📋" },
    { id: "review", label: "Review", icon: "✓" },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === step);

  return (
    <Card className="w-full max-w-6xl mx-auto shadow-sm">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-center mb-6">Official Visit Request</h2>
        
        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-8 px-4">
          {steps.map((s, index) => (
            <div key={s.id} className="flex items-center">
              <div className={`flex items-center ${index <= currentStepIndex ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 
                  ${index < currentStepIndex ? 'bg-blue-600 text-white border-blue-600' : 
                    index === currentStepIndex ? 'bg-white text-blue-600 border-blue-600' : 
                    'bg-white text-gray-400 border-gray-300'}`}>
                  {index < currentStepIndex ? <CheckCircle2 className="w-5 h-5" /> : s.icon}
                </div>
                <span className={`ml-2 text-sm font-medium hidden sm:inline ${index <= currentStepIndex ? 'text-gray-900' : 'text-gray-500'}`}>
                  {s.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <ChevronRight className={`mx-4 w-4 h-4 ${index < currentStepIndex ? 'text-blue-600' : 'text-gray-300'}`} />
              )}
            </div>
          ))}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
            toast.warning("Please correct the highlighted fields");
            setStep("basic");
          })}>
            <Tabs value={step}>
              {/* STEP 1: Journey Details */}
              <TabsContent value="basic" className="mt-0">
                <div className="space-y-4">
                  {journeyFields.map((field, index) => {
                    const mode = form.watch(`journeyDetails.${index}.mode`);
                    return (
                      <div key={field.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="text-sm font-medium text-gray-700">Journey {index + 1}</h4>
                          {journeyFields.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              type="button"
                              onClick={() => removeJourney(index)}
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <Select
                            onValueChange={(val) => form.setValue(`journeyDetails.${index}.mode`, val as any)}
                            defaultValue={field.mode}
                          >
                            <SelectTrigger className="h-9">
                              <SelectValue placeholder="Mode" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="BYRAIL">🚂 Rail</SelectItem>
                              <SelectItem value="BYAIR">✈️ Air</SelectItem>
                              <SelectItem value="BYROAD">🚗 Road</SelectItem>
                            </SelectContent>
                          </Select>

                          <FormField
                            control={form.control}
                            name={`journeyDetails.${index}.fromLocation`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input {...field} placeholder="From" className="h-9" />
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`journeyDetails.${index}.toLocation`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input {...field} placeholder="To" className="h-9" />
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />

                          {mode === "BYRAIL" && (
                            <FormField
                              control={form.control}
                              name={`journeyDetails.${index}.trainNumber`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input {...field} value={field.value ?? ""} placeholder="Train #" className="h-9" />
                                  </FormControl>
                                  <FormMessage className="text-xs" />
                                </FormItem>
                              )}
                            />
                          )}

                          {mode === "BYAIR" && (
                            <FormField
                              control={form.control}
                              name={`journeyDetails.${index}.flightNumber`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input {...field} value={field.value ?? ""} placeholder="Flight #" className="h-9" />
                                  </FormControl>
                                  <FormMessage className="text-xs" />
                                </FormItem>
                              )}
                            />
                          )}

                          {mode === "BYROAD" && (
                            <FormField
                              control={form.control}
                              name={`journeyDetails.${index}.vehicleNumber`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input {...field} value={field.value ?? ""} placeholder="Vehicle #" className="h-9" />
                                  </FormControl>
                                  <FormMessage className="text-xs" />
                                </FormItem>
                              )}
                            />
                          )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                          <FormField
                            control={form.control}
                            name={`journeyDetails.${index}.arrivalDate`}
                            render={({ field }) => (
                              <FormItem className="col-span-1">
                                <FormControl>
                                  <Input type="date" {...field} className="h-9" />
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`journeyDetails.${index}.arrivalTime`}
                            render={({ field }) => (
                              <FormItem className="col-span-1">
                                <FormControl>
                                  <Input type="time" {...field} className="h-9" />
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    );
                  })}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendJourney({
                      legOrder: journeyFields.length + 1,
                      mode: "BYRAIL",
                      fromLocation: "",
                      toLocation: "",
                      arrivalDate: "",
                      arrivalTime: "",
                    })}
                    className="w-full border-dashed"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Journey Leg
                  </Button>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                    <FormField
                      control={form.control}
                      name="purpose"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea {...field} placeholder="Purpose of Visit" className="min-h-[80px] resize-none" />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="specialNotes"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea {...field} placeholder="Special Notes (Optional)" className="min-h-[80px] resize-none" />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button type="button" onClick={() => setStep("travel")} size="sm">
                      Continue <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* STEP 2: Travelers */}
              <TabsContent value="travel" className="mt-0">
                <div className="space-y-4">
                  {guestFields.map((field, index) => (
                    <div key={field.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-sm font-medium text-gray-700">Traveler {index + 1}</h4>
                        {guestFields.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            type="button"
                            onClick={() => removeGuest(index)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <FormField
                          control={form.control}
                          name={`guestUsers.${index}.firstName`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input {...field} placeholder="First Name" className="h-9" />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`guestUsers.${index}.lastName`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input {...field} placeholder="Last Name" className="h-9" />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`guestUsers.${index}.age`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input type="number" {...field} placeholder="Age" className="h-9" />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`guestUsers.${index}.contactNumber`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input {...field} placeholder="Contact (Optional)" className="h-9" />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendGuest({
                      firstName: "",
                      lastName: "",
                      age: "0",
                      contactNumber: "",
                    })}
                    className="w-full border-dashed"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Traveler
                  </Button>

                  <div className="flex justify-between pt-4">
                    <Button type="button" variant="outline" onClick={() => setStep("basic")} size="sm">
                      Back
                    </Button>
                    <Button type="button" onClick={() => setStep("requests")} size="sm">
                      Continue <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* STEP 3: Additional Services */}
              <TabsContent value="requests" className="mt-0">
                <div className="space-y-4">
                  <Accordion type="single" collapsible className="w-full">
                    {/* Vehicle Requests */}
                    <AccordionItem value="vehicle" className="border rounded-lg">
                      <AccordionTrigger className="px-4 hover:no-underline">
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4" />
                          <span className="text-sm font-medium">Vehicle Requests</span>
                          {vehicleFields.length > 0 && (
                            <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                              {vehicleFields.length}
                            </span>
                          )}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        {vehicleFields.map((field, index) => (
                          <div key={field.id} className="flex gap-2 mb-2">
                            <FormField
                              control={form.control}
                              name={`vehicleRequests.${index}.pickupLocation`}
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormControl>
                                    <Input {...field} placeholder="Pickup" className="h-9" />
                                  </FormControl>
                                  <FormMessage className="text-xs" />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`vehicleRequests.${index}.destination`}
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormControl>
                                    <Input {...field} placeholder="Destination" className="h-9" />
                                  </FormControl>
                                  <FormMessage className="text-xs" />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`vehicleRequests.${index}.purpose`}
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormControl>
                                    <Input {...field} placeholder="Purpose" className="h-9" />
                                  </FormControl>
                                  <FormMessage className="text-xs" />
                                </FormItem>
                              )}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeVehicle(index)}
                              className="h-9 w-9 p-0"
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => appendVehicle({ pickupLocation: "", destination: "", purpose: "" })}
                          className="w-full mt-2 border-dashed"
                        >
                          <Plus className="h-4 w-4 mr-2" /> Add Vehicle Request
                        </Button>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Guesthouse Requests */}
                    <AccordionItem value="guesthouse" className="border rounded-lg">
                      <AccordionTrigger className="px-4 hover:no-underline">
                        <div className="flex items-center gap-2">
                          <Home className="h-4 w-4" />
                          <span className="text-sm font-medium">Guesthouse Requests</span>
                          {guesthouseFields.length > 0 && (
                            <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                              {guesthouseFields.length}
                            </span>
                          )}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        {guesthouseFields.map((field, index) => (
                          <div key={field.id} className="bg-gray-50 rounded p-3 mb-2">
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                              <FormField
                                control={form.control}
                                name={`guesthouseRequests.${index}.guestCount`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input type="number" {...field} placeholder="Guests" className="h-9" />
                                    </FormControl>
                                    <FormMessage className="text-xs" />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`guesthouseRequests.${index}.checkInDate`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input type="date" {...field} className="h-9" />
                                    </FormControl>
                                    <FormMessage className="text-xs" />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`guesthouseRequests.${index}.checkoutDate`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input type="date" {...field} className="h-9" />
                                    </FormControl>
                                    <FormMessage className="text-xs" />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`guesthouseRequests.${index}.purpose`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input {...field} placeholder="Purpose" className="h-9" />
                                    </FormControl>
                                    <FormMessage className="text-xs" />
                                  </FormItem>
                                )}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeGuesthouse(index)}
                                className="h-9 w-9 p-0"
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => appendGuesthouse({
                            checkInDate: "",
                            checkoutDate: "",
                            purpose: "",
                            guestCount: "1",
                          })}
                          className="w-full mt-2 border-dashed"
                        >
                          <Plus className="h-4 w-4 mr-2" /> Add Guesthouse Request
                        </Button>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Other Requests */}
                    <AccordionItem value="other" className="border rounded-lg">
                      <AccordionTrigger className="px-4 hover:no-underline">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm font-medium">Other Requests</span>
                          {otherFields.length > 0 && (
                            <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                              {otherFields.length}
                            </span>
                          )}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        {otherFields.map((field, index) => (
                          <div key={field.id} className="flex gap-2 mb-2">
                            <Input
                              {...form.register(`otherRequests.${index}.purpose`)}
                              placeholder="Describe your request"
                              className="h-9"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeOther(index)}
                              className="h-9 w-9 p-0"
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => appendOther({ purpose: "" })}
                          className="w-full mt-2 border-dashed"
                        >
                          <Plus className="h-4 w-4 mr-2" /> Add Other Request
                        </Button>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  <div className="flex justify-between pt-4">
                    <Button type="button" variant="outline" onClick={() => setStep("travel")} size="sm">
                      Back
                    </Button>
                    <Button type="button" onClick={() => setStep("review")} size="sm">
                      Continue <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* STEP 4: Review */}
              <TabsContent value="review" className="mt-0">
                <div className="space-y-4">
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                    <p className="text-sm text-blue-800">Please review all details carefully before submitting.</p>
                  </div>

                  {/* Journey Summary */}
                  <div className="bg-white border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-sm font-semibold flex items-center gap-2">
                        <span className="text-blue-600">Journey Details</span>
                      </h4>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setStep("basic")} className="text-xs">
                        Edit
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {form.getValues("journeyDetails")?.map((j, idx) => (
                        <div key={idx} className="text-sm bg-gray-50 rounded p-2">
                          <span className="font-medium">{j.mode}</span>: {j.fromLocation} → {j.toLocation} 
                          <span className="text-gray-600 ml-2">({j.arrivalDate} {j.arrivalTime})</span>
                        </div>
                      ))}
                      <div className="text-sm mt-2">
                        <span className="font-medium">Purpose:</span> {form.getValues("purpose") || "—"}
                      </div>
                    </div>
                  </div>

                  {/* Travelers Summary */}
                  <div className="bg-white border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-sm font-semibold flex items-center gap-2">
                        <span className="text-blue-600">Travelers ({form.getValues("guestUsers")?.length || 0})</span>
                      </h4>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setStep("travel")} className="text-xs">
                        Edit
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {form.getValues("guestUsers")?.map((g, idx) => (
                        <div key={idx} className="text-sm bg-gray-50 rounded p-2">
                          {g.firstName} {g.lastName} (Age: {g.age})
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Services Summary */}
                  <div className="bg-white border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-sm font-semibold flex items-center gap-2">
                        <span className="text-blue-600">Additional Services</span>
                      </h4>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setStep("requests")} className="text-xs">
                        Edit
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="text-sm">
                        <span className="font-medium flex items-center gap-1">
                          <Car className="h-3 w-3" /> Vehicles:
                        </span>
                        <span className="text-gray-600 ml-4">{vehicleFields.length || 0} requested</span>
                      </div>
                    </div>
                  </div>
                </div>
          
                  </TabsContent>
                </Tabs>
              </form>
            </Form>
            </div>
          </Card>
          
        );
      }
    