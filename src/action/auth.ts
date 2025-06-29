"use server";

import supabaseAdmin from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import axios from "axios";
import { User } from "lucide-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "crypto";

export async function sendOtp(phoneNumber: string) {
  const options = {
    method: "POST",
    url: `https://cpaas.messagecentral.com/verification/v3/send?countryCode=91&customerId=${process.env.MESSAGE_CENTRAL_ID}&flowType=SMS&mobileNumber=${phoneNumber}`,
    headers: {
      authToken: process.env.MESSAGE_CENTRAL_AUTH_TOKEN,
    },
  };
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("users")
      .select("is_phone_verified")
      .eq("phone_no", phoneNumber)
      .maybeSingle();
    if (error) {
      return {
        error: "Something went wrong",
      };
    }
    if (data && data.is_phone_verified) {
      return {
        error: "This phone number is already registered",
      };
    }
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError) {
      return {
        error: authError.message,
      };
    }
    if (!user) {
      return {
        error: "User not found",
      };
    }

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();
    if (userError) {
      return {
        error: userError.message,
      };
    }
    if (userData.is_phone_verified) {
      return {
        error: "Your phone number is already verified",
      };
    }

    const response = await axios(options);
    return response.data;
  } catch (error: any) {
    console.error(error);
    return { error: error.message };
  }
}

export async function sendOtpForLogin(phoneNumber: string) {
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

export async function verifyOtpAndCreateSession(
  phoneNumber: string,
  verificationId: string,
  otp: string,
  isLogin: boolean = false
) {
  const endpoint = `https://cpaas.messagecentral.com/verification/v3/validateOtp?countryCode=91&mobileNumber=${phoneNumber}&verificationId=${verificationId}&customerId=${process.env.MESSAGE_CENTRAL_ID}&code=${otp}`;
  const supabase = await createClient();
  try {
    const response = await axios.get(endpoint, {
      headers: {
        authToken: process.env.MESSAGE_CENTRAL_AUTH_TOKEN,
      },
    });

    if (response.data.message !== "SUCCESS") {
      return { error: "Invalid OTP" };
    }
  } catch (error: any) {
    console.error("verifyOtpAndCreateSession error:", error);
    return { error: error.message };
  }
  const { data: existingUser } = await supabase
    .from("users")
    .select("*")
    .eq("phone_no", phoneNumber)
    .maybeSingle();

  if (!existingUser && isLogin) {
    const tempPassword = crypto.randomBytes(16).toString("hex");
    await supabaseAdmin.auth.admin.createUser({
      phone: phoneNumber,
      password: tempPassword,
      phone_confirm: true,
    })
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        phone: phoneNumber,
        password: tempPassword,
      });

    if (signInError) {
      return { error: signInError.message };
    }
    redirect("/onboarding");
  }

  if (isLogin) {
    if (!existingUser) {
      return { error: "Phone number is not registered" };
    }

    if (!existingUser.is_phone_verified) {
      return { error: "Phone number is not verified" };
    }

    const tempPassword = crypto.randomBytes(16).toString("hex");

    await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
      password: tempPassword,
    });

    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        phone: phoneNumber,
        password: tempPassword,
      });

    if (signInError) {
      return { error: signInError.message };
    }
  } else {
    if (existingUser && existingUser.is_phone_verified) {
      return { error: "This phone number is already registered" };
    }

    const {
      data: { user: currentUser },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !currentUser) {
      return { error: "User not authenticated. Please login first." };
    }

    const tempPassword = crypto.randomBytes(16).toString("hex");

    await supabaseAdmin.auth.admin.updateUserById(currentUser.id, {
      phone: phoneNumber,
      password: tempPassword,
      phone_confirm: true,
    });

    const { error: updateError } = await supabase
      .from("users")
      .update({
        phone_no: phoneNumber,
        is_phone_verified: true,
      })
      .eq("id", currentUser.id);

    if (updateError) {
      return { error: updateError.message };
    }

    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        phone: phoneNumber,
        password: tempPassword,
      });

    if (signInError) {
      return { error: signInError.message };
    }
  }
  
  if (isLogin) {
    redirect("/");
  }
  return { success: "OTP verified successfully" };
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
