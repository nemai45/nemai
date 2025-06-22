import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/utils/supabase/server";
import { format } from "date-fns";
import { minutesToTime } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    const shasum = crypto.createHmac(
      "sha256",
      process.env.RAZORPAY_WEBHOOK_SECRET as string
    );
    shasum.update(body);
    const digest = shasum.digest("hex");
    if (signature !== digest) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
    const event = JSON.parse(body);
    console.log(body);
    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;
      const razorpayId = payment.order_id;
      const paymentId = payment.id;

      const supabase = await createClient();
      const { error: bookingError } = await supabase
        .from("order")
        .update({
          status: "paid",
          payment_id: paymentId,
        })
        .eq("razorpay_id", razorpayId)
        .single();
      if (bookingError) {
        return NextResponse.json(
          { error: bookingError.message },
          { status: 500 }
        );
      }
      const { data: bookingData, error: bookingDataError } = await supabase
        .from("order")
        .select(
          "id, users!inner(first_name, last_name), services!inner(name, artist_id), start_time, date"
        )
        .eq("razorpay_id", razorpayId)
        .single();
      if (bookingDataError) {
        return NextResponse.json(
          { error: bookingDataError.message },
          { status: 500 }
        );
      }
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert({
          message: `You have a new booking for ${
            bookingData.services.name
          } on ${format(
            new Date(bookingData.date),
            "dd MMM yyyy"
          )} at ${minutesToTime(bookingData.start_time)} by ${
            bookingData.users.first_name
          } ${bookingData.users.last_name}.`,
          artist_id: bookingData.services.artist_id,
        });
      if (notificationError) {
        return NextResponse.json(
          { error: notificationError.message },
          { status: 500 }
        );
      }
      return NextResponse.json(
        { message: "Payment captured" },
        { status: 200 }
      );
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
