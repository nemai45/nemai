"use server";

import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

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
