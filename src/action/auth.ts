"use server";

import { createClient } from "@/utils/supabase/server";
import axios from "axios";
import { User } from "lucide-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function sendOtp(phoneNumber: string) {
  const options = {
    method: "POST",
    url: `https://cpaas.messagecentral.com/verification/v3/send?countryCode=91&customerId=${process.env.MESSAGE_CENTRAL_ID}&flowType=SMS&mobileNumber=${phoneNumber}`,
    headers: {
      authToken: process.env.MESSAGE_CENTRAL_AUTH_TOKEN,
    },
  };
  try {
    const response = await axios(options);
    return response.data;
  } catch (error: any) {
    console.error(error);
    return { error: error.message };
  }
}

export async function verifyOtp(
  phoneNumber: string,
  verificationId: string,
  otp: string
) {
  const options = {
    method: "GET",
    url: `https://cpaas.messagecentral.com/verification/v3/validateOtp?countryCode=91&mobileNumber=${phoneNumber}&verificationId=${verificationId}&customerId=${process.env.MESSAGE_CENTRAL_ID}&code=${otp}`,
    headers: {
      authToken: process.env.MESSAGE_CENTRAL_AUTH_TOKEN,
    },
  };
  try {
    const response = await axios(options);
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError) {
      return { error: authError.message };
    }
    if (!user) {
      return { error: "User not found" };
    }
    const { error } = await supabase
      .from("users")
      .update({
        is_phone_verified: true,
        phone_no: phoneNumber
      })
      .eq("id", user.id);
    
    if (error) {
      return { error: error.message };
    }

    return response.data;
  } catch (error: any) {
    console.error(error);
    return { error: error.message };
  }
}
export async function signInWithGoogle() {
  const headersList = await headers();
  const origin = headersList.get("origin") || "http://localhost:3000";
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });
  if (error) {
    return {
      error: error.message,
      data: data,
    };
  }
  if (data.url) {
    redirect(`${data.url}`);
  }
  return {
    data: data,
    error: error,
  };
}

export async function signOut() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    return { error: error.message };
  }
  redirect("/login");
}
