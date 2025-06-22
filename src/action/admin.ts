"use server";

import { getUserRole } from "@/lib/get-user-role";
import { minutesToTime } from "@/lib/utils";
import { createClient } from "@/utils/supabase/server";
import { format } from "date-fns";
import { revalidatePath } from "next/cache";

export const whiteListUser = async (
  email: string,
  role: "artist" | "admin"
) => {
  const supabase = await createClient();
  const { data: user, error: userError } = await supabase.auth.getUser();
  if (userError) {
    return {
      error: userError.message,
    };
  }
  const userRole = await getUserRole();
  if (userRole !== "admin") {  
    return {
      error: "User is not an admin",
    };
  }
  const { error } = await supabase.from("whitelist").insert({
    email,
    role
  });
  if (error) {
    return {
      error: error.message,
    };
  }
  revalidatePath("/admin/whitelist");
  return {
    error: null,
  }
};

export const confirmCancel = async (id: string) => {
  const supabase = await createClient();
  const { data: user, error: userError } = await supabase.auth.getUser();
  if (userError) {
    return {
      error: userError.message,
    };
  }
  const userRole = await getUserRole();
  if (userRole !== "admin") {  
    return {
      error: "User is not an admin",
    };
  }
  const { data: booking, error: bookingError } = await supabase.from("order").select("id, status, users!inner(first_name, last_name), services!inner(name, artist_id), start_time, date").eq("id", id).single();
  if (bookingError) {
    return {
      error: bookingError.message,
    };
  }
  if (booking.status !== "cancel_requested") {
    return {
      error: "Booking is not in cancel requested status",
    };
  }
  const { error } = await supabase.from("order").update({
    status: "cancelled",
  }).eq("id", id);
  if (error) {
    return {
      error: error.message,
    };
  }

  const { error: notificationError } = await supabase.from("notifications").insert({
    artist_id: booking.services.artist_id,
    message: `${booking.users.first_name} ${booking.users.last_name} has cancelled their booking for ${booking.services.name} on ${format(new Date(booking.date), "dd/MM/yyyy")} at ${minutesToTime(booking.start_time)}`,
  });
  if (notificationError) {
    return {
      error: notificationError.message,
    };
  }
  revalidatePath("/admin/cancel-bookings");
  return {
    error: null,
  }
}

export const rejectCancel = async (id: string) => {
  const supabase = await createClient();
  const { data: user, error: userError } = await supabase.auth.getUser();
  if (userError) {
    return {
      error: userError.message,
    };
  }
  const userRole = await getUserRole();
  if (userRole !== "admin") {  
    return {
      error: "User is not an admin",
    };
  }
  const { data: booking, error: bookingError } = await supabase.from("order").select("id, status").eq("id", id).single();
  if (bookingError) {
    return {
      error: bookingError.message,
    };
  }
  if (booking.status !== "cancel_requested") {
    return {
      error: "Booking is not in cancel requested status",
    };
  }
  const { error } = await supabase.from("order").update({
    status: "paid",
  }).eq("id", id);
  if (error) {
    return {
      error: error.message,
    };
  }
  revalidatePath("/admin/cancel-bookings");
  return {
    error: null,
  }
}