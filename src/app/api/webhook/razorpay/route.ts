import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/utils/supabase/server";

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
