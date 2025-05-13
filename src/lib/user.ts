import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { z } from "zod";
import { getUserRole } from "./get-user-role";
import {
  ArtistProfile,
  bookingInfoSchema,
  PersonalInfo,
  personalInfoSchema,
  ProfessionalInfo,
  professionalInfoSchema,
} from "./type";

export const getProfile = async (
  userId: string,
  role: string
): Promise<{
  error?: string;
  profile?: {
    personal: PersonalInfo;
    professional: ProfessionalInfo | null;
  };
}> => {
  const supabase = await createClient();
  const { data: personal, error: personalError } = await supabase
    .from("users")
    .select("first_name, last_name, phone_no, email")
    .eq("id", userId)
    .single();
  if (personalError) {
    return { error: personalError.message };
  }
  if (!personal) {
    return { error: "Something went wrong!!" };
  }
  const personalInfo = personalInfoSchema.safeParse(personal);
  if (!personalInfo.success) {
    return { error: "Something went wrong!!" };
  }
  if (role === "artist") {
    const { data: professional, error: professionalError } = await supabase
      .from("artist_profile")
      .select("business_name, logo, bio, address, upi_id, max_client, booking_month_limit, location")
      .eq("id", userId)
      .maybeSingle();
    if (professionalError) {
      return { error: professionalError.message };
    }
    if (!professional) {
      return { error: "Something went wrong!!" };
    }
    const professionalInfo = professionalInfoSchema.safeParse(professional);
    if (!professionalInfo.success) {
      return { error: "Something went wrong!!" };
    }
    return {
      profile: {
        personal: personalInfo.data,
        professional: professionalInfo.data,
      },
    };
  }
  return {
    profile: {
      personal: personalInfo.data,
      professional: null,
    },
  };
};

export const getAlbums = async (userId: string) => {
  const supabase = await createClient();
  const { data, error: DBError } = await supabase.rpc(
    "get_albums_with_image_count",
    { user_id: userId }
  );
  if (DBError) {
    return {
      error: DBError.message,
    };
  }
  const { count, error: coverImageCountError } = await supabase
    .from("cover_images")
    .select("*", { count: "exact" })
    .eq("artist_id", userId);
  if (coverImageCountError) {
    return {
      error: coverImageCountError.message,
    };
  }

  return {
    data: data,
    coverImageCount: count || 0,
  };
};
export const getCoverImages = async (artistId: string) => {
  const supabase = await createClient();
  const { data, error: DBError } = await supabase
    .from("cover_images")
    .select("id, url")
    .eq("artist_id", artistId);
  if (DBError) {
    return {
      error: DBError.message,
    };
  }
  return {
    data: data,
  };
};

export const getAlbumImages = async (albumId: string) => {
  const supabase = await createClient();
  const { data, error: DBError } = await supabase
    .from("images")
    .select("id, url")
    .eq("album_id", albumId);
  if (DBError) {
    return {
      error: DBError.message,
    };
  }
  return {
    data: data,
  };
};

export const getAvailability = async () => {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) {
    return {
      error: error.message,
    };
  }
  if (!user) {
    return {
      error: "User not found",
    };
  }
  const role = await getUserRole();
  if (role !== "artist") {
    return {
      error: "User is not an artist",
    };
  }
  const { data, error: DBError } = await supabase
    .from("availability")
    .select("id, start_time, end_time, day")
    .eq("artist_id", user.id);
  if (DBError) {
    return {
      error: DBError.message,
    };
  }
  return {
    data: data,
  };
};

export const getBlockedDates = async () => {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) {
    return { error: error.message };
  }
  if (!user) {
    return { error: "User not found" };
  }
  const role = await getUserRole();
  if (role !== "artist") {
    return { error: "User is not an artist" };
  }
  const { data, error: DBError } = await supabase
    .from("blocked_date")
    .select("*")
    .eq("artist_id", user.id);
  if (DBError) {
    return { error: DBError.message };
  }
  if (!data) {
    return { error: "Something went wrong!!" };
  }
  return {
    data: data,
  };
};

export const getMaxClients = async () => {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) {
    return { error: error.message };
  }
  if (!user) {
    return { error: "User not found" };
  }
  const role = await getUserRole();
  if (role !== "artist") {
    return { error: "User is not an artist" };
  }
  const { data, error: DBError } = await supabase
    .from("artist_profile")
    .select("max_client")
    .eq("id", user.id)
    .maybeSingle();
  if (DBError) {
    return { error: DBError.message };
  }
  if (!data) {
    return { error: "Something went wrong!!" };
  }
  return {
    data: data.max_client,
  };
};

export const getBlockedDate = async () => {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) {
    return { error: error.message };
  }
  if (!user) {
    return { error: "User not found" };
  }
  const role = await getUserRole();
  if (role !== "artist") {
    return { error: "User is not an artist" };
  }
  const { data, error: DBError } = await supabase
    .from("blocked_date")
    .select("date, start_time, end_time, no_of_artist, id")
    .eq("artist_id", user.id);
  if (DBError) {
    return { error: DBError.message };
  }
  return {
    data: data,
  };
};

export const getArtistServices = async (artistId: string) => {
  const supabase = await createClient();
  const { data, error: DBError } = await supabase
    .from("services")
    .select("id, name, description, price, duration, add_on(id, name, price)")
    .eq("artist_id", artistId);
  if (DBError) {
    return {
      error: DBError.message,
    };
  }
  if (!data) {
    return {
      error: "No services found",
    };
  }
  return {
    data: data,
  };
};

export const getArtistProfile = async (
  artistId: string
): Promise<{
  error?: string;
  data?: ArtistProfile;
}> => {
  const supabase = await createClient();
  const { profile, error: profileError } = await getProfile(artistId, "artist");
  if (profileError) {
    return { error: profileError };
  }
  if (!profile) {
    return { error: "Something went wrong!!" };
  }
  if (!profile.professional) {
    return notFound();
  }
  const { data: coverImages, error: coverImagesError } = await getCoverImages(
    artistId
  );
  if (coverImagesError) {
    return { error: coverImagesError };
  }
  if (!coverImages) {
    return { error: "No cover images found" };
  }
  const { data: services, error: servicesError } = await getArtistServices(
    artistId
  );
  if (servicesError) {
    return { error: servicesError };
  }
  if (!services) {
    return { error: "No services found" };
  }
  const { data: albums, error: albumsError } = await getAlbums(artistId);
  if (albumsError) {
    return { error: albumsError };
  }
  if (!albums) {
    return { error: "No albums found" };
  }
  const albumWithImageCount = albums.map((album) => ({
    name: album.album_name,
    image_count: album.image_count,
    id: album.album_id,
    cover_image: album.cover_image,
  }));
  return {
    data: {
      personal: profile.personal,
      professional: profile.professional,
      cover_images: coverImages,
      services: services,
      albums: albumWithImageCount,
    },
  };
};

export const getBookings = async () => {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) {
    return { error: error.message };
  }
  if (!user) {
    return { error: "User not found" };
  }
  const role = await getUserRole();
  if (role !== "customer") {
    return { error: "User is not a customer" };
  }
  const { data, error: DBError } = await supabase
    .from("order")
    .select(
      "id, services(id, artist_profile(business_name), name, price, duration), start_time, date, booked_add_on(id, add_on(id, name, price), count)"
    )
    .eq("user_id", user.id);
  if (DBError) {
    return { error: DBError.message };
  }
  if (!data) {
    return { error: "No bookings found" };
  }
  const info = data.map((booking) => ({
    id: booking.id,
    name: booking.services.artist_profile.business_name,
    service: booking.services,
    add_on: booking.booked_add_on.map((addOn) => ({
      id: addOn.add_on.id,
      name: addOn.add_on.name,
      price: addOn.add_on.price,
      count: addOn.count,
    })),
    start_time: booking.start_time,
    date: booking.date,
  }));
  const bookingInfo = z.array(bookingInfoSchema).safeParse(info);
  if (!bookingInfo.success) {
    return { error: bookingInfo.error.message };
  }
  const bookingInfoData = bookingInfo.data;

  return { data: bookingInfoData };
};

const options: Intl.DateTimeFormatOptions = {
  timeZone: "Asia/Kolkata",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
};

const formatter = new Intl.DateTimeFormat("en-IN", options);
const dateInIST = formatter.format(new Date());

export const getArtistBookings = async () => {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) {
    return { error: error.message };
  }
  if (!user) {
    return { error: "User not found" };
  }
  const role = await getUserRole();
  if (role !== "artist") {
    return { error: "User is not an artist" };
  }
  const date = dateInIST.split(",")[0];
  const formattedDate = date.split("/").reverse().join("-");
  const { data, error: DBError } = await supabase
    .from("order")
    .select(
      "id, users(first_name, last_name),services(id, artist_id, name, price, duration), start_time, date, booked_add_on(id, add_on(id, name, price), count)"
    )
    .eq("services.artist_id", user.id)
    .gte("date", formattedDate);
  if (DBError) {
    return { error: DBError.message };
  }
  if (!data) {
    return { error: "No bookings found" };
  }
  const info = data.map((booking) => ({
    id: booking.id,
    name: booking.users.first_name + " " + booking.users.last_name,
    service: booking.services,
    add_on: booking.booked_add_on.map((addOn) => ({
      id: addOn.add_on.id,
      name: addOn.add_on.name,
      price: addOn.add_on.price,
      count: addOn.count,
    })),
    start_time: booking.start_time,
    date: booking.date,
  }));
  const bookingInfo = z.array(bookingInfoSchema).safeParse(info);
  if (!bookingInfo.success) {
    return { error: bookingInfo.error.message };
  }
  const bookingInfoData = bookingInfo.data;
  return { data: bookingInfoData };
};

export const getPastBookings = async () => {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) {
    return { error: error.message };
  }
  if (!user) {
    return { error: "User not found" };
  }
  const role = await getUserRole();
  if (role !== "artist") {
    return { error: "User is not an artist" };
  }
  const date = dateInIST.split(",")[0];
  const formattedDate = date.split("/").reverse().join("-");
  const { data, error: DBError } = await supabase
    .from("order")
    .select(
      "id, users(first_name, last_name),services(id, artist_id, name, price, duration), start_time, date, booked_add_on(id, add_on(id, name, price), count)"
    )
    .eq("services.artist_id", user.id)
    .lt("date", formattedDate);
  if (DBError) {
    return { error: DBError.message };
  }
  if (!data) {
    return { error: "No bookings found" };
  }
  const info = data.map((booking) => ({
    id: booking.id,
    name: booking.users.first_name + " " + booking.users.last_name,
    service: booking.services,
    add_on: booking.booked_add_on.map((addOn) => ({
      id: addOn.add_on.id,
      name: addOn.add_on.name,
      price: addOn.add_on.price,
      count: addOn.count,
    })),
    start_time: booking.start_time,
    date: booking.date,
  }));
  const bookingInfo = z.array(bookingInfoSchema).safeParse(info);
  if (!bookingInfo.success) {
    return { error: bookingInfo.error.message };
  }
  const bookingInfoData = bookingInfo.data;
  return { data: bookingInfoData };
};
