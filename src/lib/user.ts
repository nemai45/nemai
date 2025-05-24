import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { getUserRole } from "./get-user-role";
import {
  AlbumWithImageCount,
  Artist,
  ArtistProfile,
  BookingInfo,
  CombinedInfo,
  DBAvailability,
  DBBlockedDate,
  Image,
  Income,
  MonthlyIncome,
  personalInfoSchema,
  professionalInfoSchema,
  Result,
  Service,
} from "./type";
import { endOfMonth, format, startOfMonth, subMonths } from "date-fns";

export const getAreas = async (): Promise<
  Result<{ id: number; name: string }[]>
> => {
  const supabase = await createClient();
  const { data, error: DBError } = await supabase
    .from("area")
    .select("id, name");
  if (DBError) {
    return { error: DBError.message };
  }
  return { data: data };
};

export const getProfile = async (
  userId: string,
  role: string
): Promise<Result<CombinedInfo>> => {
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
      .select(
        "business_name, logo, bio, address, upi_id, no_of_artists, booking_month_limit, location, area, is_work_from_home, is_available_at_client_home"
      )
      .eq("id", userId)
      .maybeSingle();
    if (professionalError) {
      return { error: professionalError.message };
    }
    if (!professional) {
      return { error: "Something went wrong!!" };
    }
    const professionalResp = {
      ...professional,
      area: professional.area?.toString(),
    };
    const professionalInfo = professionalInfoSchema.safeParse(professionalResp);
    if (!professionalInfo.success) {
      return { error: "Something went wrong!!" };
    }
    return {
      data: {
        personal: personalInfo.data,
        professional: professionalInfo.data,
      },
    };
  }
  return {
    data: {
      personal: personalInfo.data,
      professional: null,
    },
  };
};

export const getAlbums = async (
  userId: string
): Promise<
  Result<{ albums: AlbumWithImageCount[]; coverImageCount: number }>
> => {
  const supabase = await createClient();
  const { data: albums, error: DBError } = await supabase.rpc(
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
  const data = albums.map((album) => ({
    id: album.album_id,
    name: album.album_name,
    image_count: album.image_count,
    cover_image: album.cover_image,
    artist_id: userId,
  }));
  return {
    data: {
      albums: data,
      coverImageCount: count || 0,
    },
  };
};

export const getArtistLogo = async (
  artistId: string
): Promise<Result<string | null>> => {
  const supabase = await createClient();
  const { data, error: DBError } = await supabase
    .from("artist_profile")
    .select("logo")
    .eq("id", artistId)
    .maybeSingle();
  if (DBError) {
    return {
      error: DBError.message,
    };
  }
  return {
    data: data?.logo || null,
  };
};

export const getCoverImages = async (
  artistId: string
): Promise<Result<Image[]>> => {
  const supabase = await createClient();
  const { data, error: DBError } = await supabase
    .from("cover_images")
    .select("id, url, artist_id")
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

export const getAlbumImages = async (
  albumId: string,
  artistId: string
): Promise<Result<Image[]>> => {
  const supabase = await createClient();
  const { data, error: DBError } = await supabase
    .from("images")
    .select("id, url")
    .eq("album_id", albumId)
    .order("created_at", { ascending: false });
  if (DBError) {
    return {
      error: DBError.message,
    };
  }
  const dataWithArtistId = data.map((image) => ({
    ...image,
    artist_id: artistId,
  }));

  return {
    data: dataWithArtistId,
  };
};

export const getAvailability = async (): Promise<Result<DBAvailability[]>> => {
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

export const getBlockedDates = async (): Promise<Result<DBBlockedDate[]>> => {
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
    .select("id, date, no_of_artist, start_time, end_time")
    .eq("artist_id", user.id);
  if (DBError) {
    return { error: DBError.message };
  }
  return {
    data: data,
  };
};

export const getNoOfArtists = async (): Promise<Result<number>> => {
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
    .select("no_of_artists")
    .eq("id", user.id)
    .single();

  if (DBError) {
    return { error: DBError.message };
  }

  return {
    data: data.no_of_artists,
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

export const getArtistServices = async (
  artistId: string
): Promise<Result<Service[]>> => {
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
  const result = await getProfile(artistId, "artist");
  if ("error" in result) {
    return { error: result.error };
  }
  if (!result.data.professional) {
    return notFound();
  }
  const coverImagesResult = await getCoverImages(artistId);
  if ("error" in coverImagesResult) {
    return { error: coverImagesResult.error };
  }
  const coverImages = coverImagesResult.data;

  const servicesResult = await getArtistServices(artistId);
  if ("error" in servicesResult) {
    return { error: servicesResult.error };
  }
  const services = servicesResult.data;

  const albumsResult = await getAlbums(artistId);
  if ("error" in albumsResult) {
    return { error: albumsResult.error };
  }
  const albumWithImageCount = albumsResult.data.albums;
  return {
    data: {
      personal: result.data.personal,
      professional: result.data.professional,
      cover_images: coverImages,
      services: services,
      albums: albumWithImageCount,
    },
  };
};

export const getBookings = async (): Promise<Result<BookingInfo[]>> => {
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
    .eq("user_id", user.id)
    .order("date");

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
    phone_no: null,
    add_on: booking.booked_add_on.map((addOn) => ({
      id: addOn.add_on.id,
      name: addOn.add_on.name,
      price: addOn.add_on.price,
      count: addOn.count,
    })),
    start_time: booking.start_time,
    date: booking.date,
  }));

  return { data: info };
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

export const getArtistBookings = async (): Promise<Result<BookingInfo[]>> => {
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
      "id, users(first_name, last_name, phone_no),services!inner(id, artist_id, name, price, duration), start_time, date, booked_add_on(id, add_on(id, name, price), count)"
    )
    .eq("services.artist_id", user.id)
    .gte("date", formattedDate)
    .order("date");
  if (DBError) {
    return { error: DBError.message };
  }
  if (!data) {
    return { error: "No bookings found" };
  }
  const info = data.map((booking) => ({
    id: booking.id,
    name: booking.users.first_name + " " + booking.users.last_name,
    phone_no: booking.users.phone_no,
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
  return { data: info };
};

export const getPastBookings = async (): Promise<Result<BookingInfo[]>> => {
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
      "id, users(first_name, last_name, phone_no),services!inner(id, artist_id, name, price, duration), start_time, date, booked_add_on(id, add_on(id, name, price), count)"
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
    phone_no: booking.users.phone_no,
    add_on: booking.booked_add_on.map((addOn) => ({
      id: addOn.add_on.id,
      name: addOn.add_on.name,
      price: addOn.add_on.price,
      count: addOn.count,
    })),
    start_time: booking.start_time,
    date: booking.date,
  }));
  return { data: info };
};

export const getArtists = async (): Promise<Result<Artist[]>> => {
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
    .from("artist_profile")
    .select("id, business_name, area(name), logo");
  if (DBError) {
    return { error: DBError.message };
  }
  return { data: data };
};

export const getIncome = async (): Promise<
  Result<Income & { monthlyChart: MonthlyIncome[] }>
> => {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) return { error: error.message };
  if (!user) return { error: "User not found" };

  const role = await getUserRole();
  if (role !== "artist") return { error: "User is not an artist" };

  const now = new Date();
  const currentMonthStart = startOfMonth(now).toISOString();
  const currentMonthEnd = endOfMonth(now).toISOString();
  const lastMonthStart = startOfMonth(subMonths(now, 1)).toISOString();
  const lastMonthEnd = endOfMonth(subMonths(now, 1)).toISOString();
  const sixMonthsAgoStart = startOfMonth(subMonths(now, 5)).toISOString();

  // Fetch all orders from last 6 months
  const { data: allOrders, error: allOrdersError } = await supabase
    .from("order")
    .select(
      "id, date, service_id, services!inner(id, name, price, artist_id), booked_add_on(id, count, add_on(id, name, price))"
    )
    .eq("services.artist_id", user.id)
    .gte("date", sixMonthsAgoStart)
    .lte("date", currentMonthEnd);

  if (allOrdersError) return { error: allOrdersError.message };

  const groupByMonth: Record<
    string,
    { serviceIncome: number; addOnIncome: number; total: number }
  > = {};

  let currentMonthIncome = 0;
  let lastMonthIncome = 0;
  const serviceWiseIncome: Record<
    string,
    {
      name: string;
      serviceIncome: number;
      addOnIncome: number;
      total: number;
    }
  > = {};

  for (const order of allOrders) {
    const orderDate = new Date(order.date);
    const monthKey = format(orderDate, "yyyy-MM");
    const label = format(orderDate, "MMM yyyy");

    if (!groupByMonth[monthKey]) {
      groupByMonth[monthKey] = {
        serviceIncome: 0,
        addOnIncome: 0,
        total: 0,
      };
    }

    const servicePrice = order.services.price;
    groupByMonth[monthKey].serviceIncome += servicePrice;
    groupByMonth[monthKey].total += servicePrice;

    const addOnIncome = order.booked_add_on.reduce((sum, addOn) => {
      return sum + addOn.add_on.price * addOn.count;
    }, 0);
    groupByMonth[monthKey].addOnIncome += addOnIncome;
    groupByMonth[monthKey].total += addOnIncome;

    // Monthly totals
    const dateStr = order.date;
    if (dateStr >= currentMonthStart && dateStr <= currentMonthEnd) {
      currentMonthIncome += servicePrice + addOnIncome;

      const id = order.services.id;
      const name = order.services.name;
      if (!serviceWiseIncome[id]) {
        serviceWiseIncome[id] = {
          name,
          serviceIncome: 0,
          addOnIncome: 0,
          total: 0,
        };
      }
      serviceWiseIncome[id].serviceIncome += servicePrice;
      serviceWiseIncome[id].addOnIncome += addOnIncome;
      serviceWiseIncome[id].total += servicePrice + addOnIncome;
    }

    if (dateStr >= lastMonthStart && dateStr <= lastMonthEnd) {
      lastMonthIncome += servicePrice + addOnIncome;
    }
  }

  // Construct monthly chart (last 6 months)
  const monthlyChart = [...Array(6)].map((_, i) => {
    const date = subMonths(now, 5 - i);
    const monthKey = format(date, "yyyy-MM");
    const label = format(date, "MMM yyyy");
    const monthData = groupByMonth[monthKey] || {
      serviceIncome: 0,
      addOnIncome: 0,
      total: 0,
    };

    return {
      month: label,
      ...monthData,
    };
  });

  return {
    data: {
      currentMonthIncome,
      lastMonthIncome,
      serviceWiseIncome: Object.values(serviceWiseIncome),
      monthlyChart,
    },
  };
};

export const getImage = async (imageId: string): Promise<Result<string>> => {
  const supabase = await createClient();
  const { data, error: DBError } = await supabase
    .from("images")
    .select("url")
    .eq("id", imageId)
    .maybeSingle();
  if (DBError) {
    return { error: DBError.message };
  }
  if (!data) {
    const { data, error: DBError } = await supabase
      .from("cover_images")
      .select("url")
      .eq("id", imageId)
      .maybeSingle();
    if (DBError) {
      return { error: DBError.message };
    }
    if (!data) {
      return { error: "Image not found" };
    }
    return { data: data.url };
  }
  return { data: data.url };
};
