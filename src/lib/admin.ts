import { createClient } from "@/utils/supabase/server";
import { unstable_cache } from "next/cache";

export const getWhiteListedUsers = async (  
  startIndex: number,
  itemsCount: number
) => {
  const supabase = await createClient();
  const res = supabase
    .from("whitelist")
    .select(`*, users(email)`)
    .range(startIndex, startIndex + itemsCount - 1)
    .order("created_at", { ascending: false });
  const totalRes = await supabase
    .from("whitelist")
    .select("*", { count: "exact" });
  const [data, total] = await Promise.all([res, totalRes]);
  const { data: whitelist, error } = data;
  const { count, error: countError } = total;
  if (countError) {
    return {
        error: countError.message,
    };
  }
  if (error) {
    return {
        error: error.message,
    }
  }
  return {
    data: whitelist.map((item) => ({
      ...item,
      added_by: item.users?.email,
    })),
    total: count,
  };
};

export const getCachedWhiteListedUsers = unstable_cache(
  getWhiteListedUsers,
  ["whitelist"],
  {
    tags: ["whitelist"],
  }
);
