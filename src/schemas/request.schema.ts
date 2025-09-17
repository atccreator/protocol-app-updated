import { z } from 'zod';


const guestUserSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    age: z.string().regex(/^\d+$/, "Age must be positiv number"), 
    contactNumber: z.string().regex(/^[0-9]{10}$/, "Contact number must be 10 digits").optional(),
  })

const jurneyDetailsSchema =  z.object({
    legOrder: z.number().min(1, 'Please provide atleast one journey Detail').positive(),
    mode: z.enum(['BYROAD', 'BYRAIL', 'BYAIR']),
    fromLocation: z.string().min(1, 'From location is required'),
    toLocation: z.string().min(1, 'To location is required'),
    trainNumber: z.string().optional(),
    flightNumber: z.string().optional(),
    vehicleNumber: z.string().optional(),
    arrivalDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD"),
    arrivalTime: z.string().regex(/^\d{2}:\d{2}$/, "Must be HH:mm").optional(),
    //departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD").optional(),
    //departureTime: z.string().regex(/^\d{2}:\d{2}$/, "Must be HH:mm").optional(),
  }).superRefine((data, ctx) => {
  if (data.mode === "BYRAIL" && !data.trainNumber) {
    ctx.addIssue({
      code: "custom",
      path: ["trainNumber"],
      message: "Train number is required for BYRAIL journeys",
    });
  }
  if (data.mode === "BYAIR" && !data.flightNumber) {
    ctx.addIssue({
      code: "custom",
      path: ["flightNumber"],
      message: "Flight number is required for BYAIR journeys",
    });
  }
  if (data.mode === "BYROAD" && !data.vehicleNumber) {
    ctx.addIssue({
      code: "custom",
      path: ["vehicleNumber"],
      message: "Vehicle number is required for BYROAD journeys",
    })
  }
  // if (!data.departureDate){
  //   return ;  // If no departure date, skip this check
  // } else if (new Date(data.departureDate) < new Date(data.arrivalDate)) {
  //   ctx.addIssue({
  //     code: "custom",
  //     path: ["departureDate"],
  //     message: "Departure date must be after or equal to arrival date",
  //   });
  // }
}); 

export const requestFormSchema = z.object({

  purpose: z.string().optional(),
  specialNotes: z.string().optional(),

  journeyDetails: z.array(jurneyDetailsSchema).min(1, "At least one journey details is required"),
  guestUsers: z.array(guestUserSchema).min(1, "At least one guest is required"),
  
  //vehicle information
  vehicleRequests: z.array(z.object({
      pickupLocation: z.string().min(1, 'Pickup location is required'),
      destination: z.string().min(1, 'Destination is required'),
      purpose: z.string().min(1, 'Purpose is required'),
      requestLocation: z.string().min(1, 'Please select a journey location for this request'),
    })
  ).optional(),

  //guest house information
  guesthouseRequests: z.array(z.object({
    checkInDate: z.string().min(1, 'Check-in date is required').regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD"),
    checkoutDate: z.string().min(1, 'Check-out date is required').regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD"),
    purpose: z.string().min(1, 'Purpose is required'),
    guestCount: z.string().regex(/^\d+$/, "Guest count required & must be positiv number"),
    requestLocation: z.string().min(1, 'Please select a journey location for this request'),
    })
  ).optional(),

  otherRequests: z
      .array(z.object({ 
        purpose: z.string().min(1, 'Purpose is required'),
        requestLocation: z.string().min(1, 'Please select a journey location for this request'),
      })
    ).optional(),
})


export type RequestFormData = z.infer<typeof requestFormSchema>