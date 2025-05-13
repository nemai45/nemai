"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export const whiteListUser = async (
  email: string,
  role: "artist" | "admin"
) => {
  const supabase = await createClient();
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
