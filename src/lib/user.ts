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
  Notification,
  Service,
  User,
  CanceledBooking,
  ArtistPayment,
  Payment,
  ArtistPaymentHistory,
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
  console.log(userId, role);
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
): Promise<Result<{images: Image[], artistId: string}>> => {
  const supabase = await createClient();
  const { data: album, error: albumError } = await supabase
    .from("albums")
    .select("artist_id")
    .eq("id", albumId)
    .single();
  if (albumError) {
    return { error: albumError.message };
  }
  if (!album) {
    return { error: "Album not found" };
  }
  const artistId = album.artist_id;
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
    data: {
      images: dataWithArtistId,
      artistId: artistId,
    },
  };
};

export const getAvailability = async (
  artistId?: string
): Promise<Result<DBAvailability[]>> => {
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
  if (role !== "artist" && role !== "admin") {
    return { error: "User is not an artist" };
  }
  if (role === "artist" && !artistId) {
    artistId = user.id;
  }
  if (!artistId) {
    return { error: "Artist ID not found" };
  }
  const { data, error: DBError } = await supabase
    .from("availability")
    .select("id, start_time, end_time, day")
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

export const getBlockedDates = async (
  artistId?: string
): Promise<Result<DBBlockedDate[]>> => {
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
  if (role !== "artist" && role !== "admin") {
    return { error: "User is not an artist" };
  }
  if (role === "artist" && !artistId) {
    artistId = user.id;
  }
  if (!artistId) {
    return { error: "Artist ID not found" };
  }

  const { data, error: DBError } = await supabase
    .from("blocked_date")
    .select("id, date, no_of_artist, start_time, end_time")
    .eq("artist_id", artistId);
  if (DBError) {
    return { error: DBError.message };
  }
  return {
    data: data,
  };
};

export const getNoOfArtists = async (artistId?: string): Promise<Result<number>> => {
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
  if (role !== "artist" && role !== "admin") {
    return { error: "User is not an artist" };
  }
  if(role === "artist" && !artistId) {
    artistId = user.id
  }
  if(!artistId) {
    return { error: "Artist ID not found" };
  }
  const { data, error: DBError } = await supabase
    .from("artist_profile")
    .select("no_of_artists")
    .eq("id", artistId)
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

export const getVerifiedPhone = async (): Promise<Result<string | null>> => {
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
  const { data: isVerified, error: authError } = await supabase
    .from("users")
    .select("phone_no, is_phone_verified")
    .eq("id", user.id)
    .single();
  if (authError) {
    return { error: authError.message };
  }
  if (!isVerified.is_phone_verified || !isVerified.phone_no) {
    return { data: null };
  }
  return { data: isVerified.phone_no };
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
      "id, services(id, artist_profile(business_name), name, price, duration), start_time, date, booked_add_on(id, add_on(id, name, price), count), client_address, status"
    )
    .eq("user_id", user.id)
    .not("status", "eq", "cancelled")
    .not("status", "eq", "pending")
    .order("date", { ascending: false })
    .order("start_time", { ascending: true });

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
    client_address: booking.client_address,
    status: booking.status,
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

export const getArtistBookings = async (
  artistId?: string
): Promise<Result<BookingInfo[]>> => {
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
  if (role !== "artist" && role !== "admin") {
    return { error: "User is not an artist" };
  }
  if (role === "artist" && !artistId) {
    artistId = user.id;
  }
  if (!artistId) {
    return { error: "Artist ID not found" };
  }
  const date = dateInIST.split(",")[0];
  const formattedDate = date.split("/").reverse().join("-");
  const { data, error: DBError } = await supabase
    .from("order")
    .select(
      "id, users(first_name, last_name, phone_no),services!inner(id, artist_id, name, price, duration), start_time, date, booked_add_on(id, add_on(id, name, price), count), client_address, status"
    )
    .eq("services.artist_id", artistId)
    .not("status", "eq", "cancelled")
    .not("status", "eq", "pending")
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
    client_address: booking.client_address,
    status: booking.status,
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
      "id, users(first_name, last_name, phone_no),services!inner(id, artist_id, name, price, duration), start_time, date, booked_add_on(id, add_on(id, name, price), count), client_address, status"
    )
    .eq("services.artist_id", user.id)
    .not("status", "eq", "cancelled")
    .not("status", "eq", "pending")
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
    client_address: booking.client_address,
    status: booking.status,
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
  if (role !== "customer" && role !== "admin") {
    return { error: "User is not a customer or admin" };
  } 
  const { data, error: DBError } = await supabase
    .from("artist_profile")
    .select("id, business_name, area(name), logo, is_featured, disabled");
  if (DBError) {
    return { error: DBError.message };
  }
  if(role === "customer") {
    return { data: data.filter((artist) => !artist.disabled) };
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
      "id, date, service_id, services!inner(id, name, price, artist_id), booked_add_on(id, count, add_on(id, name, price)), status"
    )
    .eq("services.artist_id", user.id)
    .not("status", "eq", "cancelled")
    .not("status", "eq", "pending")
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

export const getUsers = async (): Promise<Result<User[]>> => {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    return { error: error.message };
  }
  if (!user) {
    return { error: "User not found" };
  }
  const role = await getUserRole();
  if (role !== "admin") {
    return { error: "User is not an admin" };
  }
  const { data, error: DBError } = await supabase
    .from("users")
    .select("id, first_name, last_name, email, phone_no, role, created_at")
    .eq("role", "customer");
  if (DBError) {
    return { error: DBError.message };
  }
  return { data: data };
}

export const getNotifications = async (): Promise<Result<Notification[]>> => {
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
    .from("notifications")
    .select("id, message, is_read, created_at")
    .eq("artist_id", user.id)
    .order("created_at", { ascending: false });
  if (DBError) {
    return { error: DBError.message };
  }

  const { error: userDataError } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("artist_id", user.id)
    .eq("is_read", false);
  if (userDataError) {
    return { error: userDataError.message };
  }
  
  return { data: data.map((notification) => ({
    id: notification.id.toString(),
    message: notification.message,
    isRead: notification.is_read,
    created_at: notification.created_at.toString(),
  })) };
}

export const getNotificationCount = async (): Promise<Result<number>> => {
  const supabase = await createClient();
  const { data, error: DBError } = await supabase.auth.getUser();
  if (DBError) {
    return { error: DBError.message };
  }
  if (!data) {
    return { error: "User not found" };
  }
  const role = await getUserRole();
  if (role !== "artist") {
    return { error: "User is not an artist" };
  }
  const { data: notifications, error: notificationsError } = await supabase
    .from("notifications")
    .select("id", { count: "exact" })
    .eq("artist_id", data.user.id)
    .eq("is_read", false);
  if (notificationsError) {
    return { error: notificationsError.message };
  }
  return { data: notifications.length };
}

export const getFeaturedArtists = async (): Promise<Result<Artist[]>> => {
  const supabase = await createClient();
  const { data, error: DBError } = await supabase
    .from("artist_profile")
    .select("id, business_name, area(name), logo, is_featured, disabled")
    .eq("is_featured", true);
  if (DBError) {
    return { error: DBError.message };
  }
  return { data: data };
}

export const getCanceledBookings = async (): Promise<Result<CanceledBooking[]>> => {
  const supabase = await createClient();
  const { data, error: DBError } = await supabase.auth.getUser();
  if (DBError) {
    return { error: DBError.message };
  }
  if (!data) {
    return { error: "User not found" };
  }
  const role = await getUserRole();
  if (role !== "admin") {
    return { error: "User is not an admin" };
  }
  const { data: bookings, error: bookingsError } = await supabase
    .from("order")
    .select("id, users(first_name, last_name, phone_no, email), services!inner(name), start_time, date, status, cancel_message, created_at")
    .eq("status", "cancel_requested");
  if (bookingsError) {
    return { error: bookingsError.message };
  }
  return { data: bookings.map((booking) => ({
    id: booking.id,
    name: booking.users.first_name + " " + booking.users.last_name,
    phone_no: booking.users.phone_no,
    email: booking.users.email,
    service: booking.services.name,
    start_time: booking.start_time,
    date: booking.date,
    cancel_message: booking.cancel_message || "No reason provided",
    created_at: booking.created_at.toString(),
  }))}
}

export const getArtistsDue = async (): Promise<Result<ArtistPayment[]>> => {
  const supabase = await createClient();
  const { data, error: DBError } = await supabase.auth.getUser();
  if (DBError) {
    return { error: DBError.message };
  }
  if (!data) {
    return { error: "User not found" };
  }
  const role = await getUserRole();
  if (role !== "admin") {
    return { error: "User is not an admin" };
  }
  const { data: orders, error: ordersError } = await supabase
    .from("order")
    .select("id, total_amount, paid_amount, created_at, date, services!inner(artist_profile!inner(id, business_name, upi_id))")
    .lt("date", format(new Date(), "yyyy-MM-dd"))
    .eq("status", "paid")
  if (ordersError) {
    return { error: ordersError.message };
  }
  const { data: payments, error: paymentsError } = await supabase
    .from("payments")
    .select("id, artist_id, amount, created_at")

  if (paymentsError) {
    return { error: paymentsError.message };
  }

  const dueMap = new Map<string, { name: string, due: number, upi_id: string }>();
  for (const order of orders) {
    const artistId = order.services.artist_profile.id;
    const due = order.paid_amount;
    if (dueMap.has(artistId)) {
      dueMap.set(artistId, { name: order.services.artist_profile.business_name, due: dueMap.get(artistId)!.due + due, upi_id: order.services.artist_profile.upi_id });
    } else {
      dueMap.set(artistId, { name: order.services.artist_profile.business_name, due: due, upi_id: order.services.artist_profile.upi_id });
    }
  }
  
  for (const payment of payments) {
    const artistId = payment.artist_id;
    const amount = payment.amount;
    if (dueMap.has(artistId)) {
      dueMap.set(artistId, { name: dueMap.get(artistId)!.name, due: dueMap.get(artistId)!.due - amount, upi_id: dueMap.get(artistId)!.upi_id });
      if(dueMap.get(artistId)!.due == 0) {
        dueMap.delete(artistId);
      }
    }
  }
  const artists: ArtistPayment[] = Array.from(dueMap.entries()).map(([artistId, { name, due, upi_id }]) => ({
    id: artistId,
    name,
    due,
    upi_id
  }));
  return { data: artists };
}

export const getArtistDue = async (artistId: string): Promise<Result<number>> => {
  const supabase = await createClient();
  const { data, error: DBError } = await supabase.auth.getUser();
  if (DBError) {
    return { error: DBError.message };
  }
  if (!data) {
    return { error: "User not found" };
  }
  const role = await getUserRole();
  if(role !== "admin" && role !== "artist") {
    return { error: "User is not an admin or artist" };
  }
  if(data.user.id !== artistId && role !== "admin") {
    return { error: "Artist not matched" };
  }

  const { data: orders, error: ordersError } = await supabase
    .from("order")
    .select("id, total_amount, paid_amount, created_at, date, services!inner(artist_profile!inner(id, business_name, upi_id))")
    .lt("date", format(new Date(), "yyyy-MM-dd"))
    .eq("status", "paid")
    .eq("services.artist_profile.id", artistId)
  if (ordersError) {
    return { error: ordersError.message };
  }
  const { data: payments, error: paymentsError } = await supabase
    .from("payments")
    .select("id, artist_id, amount, created_at")
    .eq("artist_id", artistId)
  if (paymentsError) {
    return { error: paymentsError.message };
  }
  const due = orders.reduce((sum, order) => sum + order.paid_amount, 0);
  const paid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  return { data: due - paid };
}

export const getPayments = async (): Promise<Result<Payment[]>> => {
  const supabase = await createClient();
  const { data, error: DBError } = await supabase.auth.getUser();
  if (DBError) {
    return { error: DBError.message };
  }
  if (!data) {
    return { error: "User not found" };
  }
  const role = await getUserRole();
  if (role !== "admin") {
    return { error: "User is not an admin" };
  }
  const { data: payments, error: paymentsError } = await supabase
    .from("payments")
    .select("id, amount, notes, created_at, artist_id, artist_profile!inner(business_name)")
  if (paymentsError) {
    return { error: paymentsError.message };
  }
  return { data: payments.map((payment) => ({
    id: payment.id,
    name: payment.artist_profile.business_name,
    amount: payment.amount,
    notes: payment.notes,
    created_at: payment.created_at.toString(),
  }))}
}

export const getArtistPayments = async (artistId: string): Promise<Result<ArtistPaymentHistory[]>> => {
  const supabase = await createClient();
  const { data, error: DBError } = await supabase.auth.getUser();
  if (DBError) {
    return { error: DBError.message };
  }
  if (!data) {
    return { error: "User not found" };
  }
  const role = await getUserRole();
  if(role !== "artist") {
    return { error: "User is not an artist" };
  }
  if(data.user.id !== artistId) {
    return { error: "Artist not matched" };
  }
  const { data: payments, error: paymentsError } = await supabase
    .from("payments")
    .select("id, amount, notes, created_at, artist_id")
    .eq("artist_id", artistId)
  if (paymentsError) {
    return { error: paymentsError.message };
  }
  return { data: payments.map((payment) => ({
    id: payment.id,
    amount: payment.amount,
    notes: payment.notes,
    created_at: payment.created_at.toString(),
  }))}
}