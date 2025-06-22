import { slotDataSchema } from "@/lib/type";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; serviceId: string }> }
) {
  const { id, serviceId } = await params;
  const supabase = await createClient();
  const { data: availability, error: availabilityError } = await supabase
    .from("availability")
    .select("id, start_time, end_time, day")
    .eq("artist_id", id);
  if (availabilityError) {
    return NextResponse.json(
      { error: availabilityError.message },
      { status: 500 }
    );
  }
  if (!availability) {
    return NextResponse.json(
      { error: "No availability found" },
      { status: 404 }
    );
  }
  const { data: blockedDates, error: blockedDatesError } = await supabase
    .from("blocked_date")
    .select("id, date, no_of_artist, start_time, end_time")
    .eq("artist_id", id);
  if (blockedDatesError) {
    return NextResponse.json(
      { error: blockedDatesError.message },
      { status: 500 }
    );
  }
  if (!blockedDates) {
    return NextResponse.json(
      { error: "No blocked dates found" },
      { status: 404 }
    );
  }

  const { data: maxClients, error: maxClientsError } = await supabase
    .from("artist_profile")
    .select("no_of_artists, booking_month_limit")
    .eq("id", id)
    .single();
  if (maxClientsError) {
    return NextResponse.json(
      { error: maxClientsError.message },
      { status: 500 }
    );
  }
  if (!maxClients) {
    return NextResponse.json(
      { error: "No max clients found" },
      { status: 404 }
    );
  }
  const { data: bookedSlots, error: bookedSlotsError } = await supabase
    .from("order")
    .select("id, start_time, date, services!inner(duration, artist_id), status")
    .eq("status", "paid")
    .eq("services.artist_id", id);
  if (bookedSlotsError) {
    return NextResponse.json(
      { error: bookedSlotsError.message },
      { status: 500 }
    );
  }
  if (!bookedSlots) {
    return NextResponse.json(
      { error: "No booked slots found" },
      { status: 404 }
    );
  }
  const bookedSlotsWithDuration = bookedSlots.map((slot) => ({
    ...slot,
    duration: slot.services.duration,
  }));

  const response = slotDataSchema.safeParse({
    availability,
    blockedDates,
    maxClients: maxClients.no_of_artists,
    bookingMonthLimit: maxClients.booking_month_limit,
    bookedSlots: bookedSlotsWithDuration,
  });
  if (!response.success) {
    return NextResponse.json(
      { error: response.error.message },
      { status: 400 }
    );
  }
  return NextResponse.json(response.data);
}
