import { z } from "zod";

export type Result<T> = { data: T } | { error: string };

const indianPhonePattern = /^\d{10}$/;

export const personalInfoSchema = z.object({
  email: z.string().email(),
  first_name: z.string().min(1, { message: "First name is required" }),
  last_name: z.string().min(1, { message: "Last name is required" }),
  phone_no: z
    .string()
    .min(1, { message: "Phone number is required" })
    .regex(indianPhonePattern, {
      message: "Phone number must be 10 digits",
    }),
});

export const professionalInfoSchema = z.object({
  business_name: z.string().min(1, { message: "Business name is required" }),
  bio: z.string().nullable(),
  logo: z.string().nullable(),
  address: z.string().min(1, { message: "Address is required" }),
  upi_id: z.string().min(1, { message: "UPI ID is required" }),
  area: z.string(),
  no_of_artists: z.number().default(1),
  booking_month_limit: z.number().min(1, { message: "Booking month limit must be at least 1" }).max(3, { message: "Booking month limit must be less than 3" }),
  location: z.string().nullable(),
  is_work_from_home: z.boolean().default(false),
  is_available_at_client_home: z.boolean().default(false),
});

export const combinedSchema = z.object({
  personal: personalInfoSchema,
  professional: professionalInfoSchema.nullable(),
});

export type CombinedInfo = z.infer<typeof combinedSchema>;
export type PersonalInfo = z.infer<typeof personalInfoSchema>;
export type ProfessionalInfo = z.infer<typeof professionalInfoSchema>;

export const serviceSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, { message: "Service name is required" }),
  description: z.string().nullable(),
  price: z.number().min(1, { message: "Price is required" }),
  duration: z.number().min(1, { message: "Duration is required" }),
  add_on: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string().min(1, { message: "Add-on name is required" }),
      price: z.number().min(1, { message: "Add-on price must be at least 1" }),
      is_deleted: z.boolean().optional(),
    })
  ),
});

export const addOnSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, { message: "Add-on name is required" }),
  price: z.number().min(1, { message: "Price is required" }),
});

export type Service = z.infer<typeof serviceSchema>;
export type AddOn = z.infer<typeof addOnSchema>;

export const albumSchema = z.object({
  id: z.string(),
  name: z.string().min(1, { message: "Album name is required" }),
});

export type Album = z.infer<typeof albumSchema>;

export const albumWithImageCountSchema = albumSchema.extend({
  image_count: z.number().min(0, { message: "Image count must be at least 0" }),
  cover_image: z.string().nullable(),
  artist_id: z.string(),
});

export type AlbumWithImageCount = z.infer<typeof albumWithImageCountSchema>;

export const imageSchema = z.object({
  id: z.string(),
  url: z.string().min(1, { message: "Image URL is required" }),
  artist_id: z.string(),
});

export type Image = z.infer<typeof imageSchema>;


export const availabilitySchema = z.object({
  id: z.string().optional(),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Invalid time format" }),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Invalid time format" }),
  dayOfWeek: z.number().min(0, { message: "Day of week is required" }).max(6, { message: "Day of week must be between 0 and 6" }),
})

export type Availability = z.infer<typeof availabilitySchema>;

export const DBAvailability = z.object({
  id: z.string(),
  start_time: z.number(),
  end_time: z.number(),
  day: z.number(),
})

export type DBAvailability = z.infer<typeof DBAvailability>;

export const blockedDateSchema = z.object({
  id: z.string().optional(),
  date: z.string(),
  no_of_artist: z.number(),
  start_time: z.string(),
  end_time: z.string(),
})

export const DBBlockedDate = z.object({
  id: z.string(),
  date: z.string(),
  no_of_artist: z.number(),
  start_time: z.number(),
  end_time: z.number(),
})

export type BlockedDate = z.infer<typeof blockedDateSchema>;
export type DBBlockedDate = z.infer<typeof DBBlockedDate>;

export const artistProfileSchema = z.object({
  personal: personalInfoSchema,
  professional: professionalInfoSchema,
  cover_images: z.array(imageSchema),
  services: z.array(serviceSchema),
  albums: z.array(albumWithImageCountSchema),
})

export type ArtistProfile = z.infer<typeof artistProfileSchema>;

export const bookedServiceSchema = z.object({
  service: serviceSchema.omit({ add_on: true }),
  add_on: z.array(addOnSchema.extend({ count: z.number().min(0, { message: "Count must be at least 0" }).max(20, { message: "Count must be less than 20" }) })),
})

export type BookedService = z.infer<typeof bookedServiceSchema>;

export const slotDataSchema = z.object({
  availability: z.array(DBAvailability),
  blockedDates: z.array(z.object({
    id: z.string(),
    date: z.string(),
    no_of_artist: z.number(),
    start_time: z.number(),
    end_time: z.number(),
  })),
  maxClients: z.number(),
  bookingMonthLimit: z.number(),
  bookedSlots: z.array(z.object({
    id: z.string(),
    start_time: z.number(),
    date: z.string(),
    duration: z.number(),
  })),
})

export type SlotData = z.infer<typeof slotDataSchema>;

export const bookingSchema = z.object({
  service_id: z.string(),
  start_time: z.number(),
  date: z.string(),
  location_type: z.enum(["work_from_home", "client_home"]),
  address: z.string().optional(),
})

export type Booking = z.infer<typeof bookingSchema>;

export const addOnBookingSchema = z.array(z.object({
  add_on_id: z.string(),
  count: z.number(),
}))

export type AddOnBooking = z.infer<typeof addOnBookingSchema>;

export const bookingInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  phone_no: z.string().nullable(),
  service: z.object({
    id: z.string(),
    name: z.string(),
    price: z.number(),
    duration: z.number(),
  }),
  add_on: z.array(z.object({
    id: z.string(),
    name: z.string(),
    price: z.number(),
    count: z.number(),
  })),
  start_time: z.number(),
  date: z.string(),
})

export type BookingInfo = z.infer<typeof bookingInfoSchema>;

export const artistSchema = z.object({
  id: z.string(),
  business_name: z.string(),
  area: z.object({
    name: z.string(),
  }),
  logo: z.string().nullable(),
})

export type Artist = z.infer<typeof artistSchema>;

export const incomeSchema = z.object({
  currentMonthIncome: z.number(),
  lastMonthIncome: z.number(),
  serviceWiseIncome: z.array(z.object({
    name: z.string(),
    serviceIncome: z.number(),
    addOnIncome: z.number(),
    total: z.number(),
  })),
})

export type Income = z.infer<typeof incomeSchema>;

export type MonthlyIncome = {
  month: string;
  serviceIncome: number;
  addOnIncome: number;
  total: number;
};