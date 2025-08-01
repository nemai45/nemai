"use server";
import { getUserRole } from "@/lib/get-user-role";
import razorpay from "@/lib/razorpay";
import {
  AddOnBooking,
  Availability,
  BlockedDate,
  Booking,
  CombinedInfo,
  CreatePayment,
  Result,
  Service,
} from "@/lib/type";
import { getArtistDue } from "@/lib/user";
import {
  getFinalAmount,
  shouldAllowCancel,
  timeToMinutes,
  uploadToCloudinary,
} from "@/lib/utils";
import supabaseAdmin from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export const onBoardUser = async (data: CombinedInfo, logo: File | null) => {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  const role = await getUserRole();
  if (error) {
    return {
      error: error.message,
    };
  }
  if (!role) {
    return {
      error: "User role not found",
    };
  }
  if (!user) {
    return {
      error: "User not found",
    };
  }
  const { data: isVerified, error: authError } = await supabase
    .from("users")
    .select("is_phone_verified")
    .eq("id", user.id)
    .single();
  if (authError) {
    return {
      error: authError.message,
    };
  }
  if (!isVerified.is_phone_verified) {
    return {
      error: "Please verify your phone number",
    };
  }

  const { personal, professional } = data;

  if (professional && logo) {
    if (
      !professional.is_work_from_home &&
      !professional.is_available_at_client_home
    ) {
      return {
        error:
          "At least one of the options work from studio or available at client home must be selected",
      };
    }
    const fileName = `${user.id}-${Date.now()}`;
    const { data, error: DBError } = await supabase.storage
      .from("logos")
      .upload(fileName, logo);
    if (DBError) {
      return {
        error: DBError.message,
      };
    }
    professional.logo = data.fullPath;
  }

  const { error: rpcError } = await supabase.rpc("onboard_user", {
    user_id: user.id,
    role: role,
    first_name: personal.first_name,
    last_name: personal.last_name,
    phone_no: personal.phone_no,
    business_name: professional?.business_name || null,
    logo: professional?.logo || null,
    address: professional?.address || null,
    bio: professional?.bio || null,
    upi_id: professional?.upi_id || null,
    no_of_artists: professional?.no_of_artists || null,
    booking_month_limit: professional?.booking_month_limit || null,
    location: professional?.location || null,
    area: parseInt(professional?.area || "0"),
    is_work_from_home: professional?.is_work_from_home || null,
    is_available_at_client_home:
      professional?.is_available_at_client_home || null,
  });

  if (rpcError) {
    return {
      error: rpcError.message,
    };
  }
  if (role === "customer") {
    redirect("/customer-dashboard");
  } else {
    redirect("/artist-dashboard");
  }
  return {
    logo: null,
    error: null,
  };
};

export const updateUser = async (
  data: CombinedInfo,
  logo: File | null,
  id?: string
) => {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  const role = await getUserRole();
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
  const { personal, professional } = data;

  const { error: DBError } = await supabase
    .from("users")
    .update({
      first_name: personal.first_name,
      last_name: personal.last_name,
    })
    .eq("id", id || user.id);
  if (DBError) {
    return {
      error: DBError.message,
    };
  }
  if ((role === "artist" || role === "admin") && professional) {
    if (
      !professional.is_work_from_home &&
      !professional.is_available_at_client_home
    ) {
      return {
        error:
          "At least one of the options work from studio or available at client home must be selected",
      };
    }
    if (logo) {
      if (professional.logo) {
        const { error: DBError } = await supabase.storage
          .from("logos")
          .remove([professional.logo.split("/").pop()!]);
        if (DBError) {
          return {
            error: DBError.message,
          };
        }
      }

      const fileName = `${user.id}-${Date.now()}`;
      const { data, error: DBError } = await supabase.storage
        .from("logos")
        .upload(fileName, logo);
      if (DBError) {
        return {
          error: DBError.message,
        };
      }
      professional.logo = data.fullPath;
    }

    const { error: DBError } = await supabase
      .from("artist_profile")
      .update({
        business_name: professional.business_name,
        logo: professional.logo,
        bio: professional.bio,
        address: professional.address,
        upi_id: professional.upi_id,
        no_of_artists: professional.no_of_artists,
        booking_month_limit: professional.booking_month_limit,
        location: professional.location || null,
        area: parseInt(professional.area || "0"),
        is_work_from_home: professional.is_work_from_home,
        is_available_at_client_home: professional.is_available_at_client_home,
      })
      .eq("id", id || user.id);
    if (DBError) {
      return {
        error: DBError.message,
      };
    }
  }
  return {
    logo: professional?.logo,
    error: null,
  };
};

export const addArtistService = async (service: Service, id?: string) => {
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
  if (role !== "artist" && role !== "admin") {
    return {
      error: "User is not an artist or admin",
    };
  }

  const { data: serviceData, error: DBError } = await supabase
    .from("services")
    .insert({
      name: service.name,
      description: service.description,
      price: service.price,
      duration: service.duration,
      artist_id: id || user.id,
      discount: 0
    })
    .select()
    .single();
  if (DBError) {
    return {
      error: DBError.message,
    };
  }

  for (const addOn of service.add_on) {
    if (addOn.is_deleted) {
      continue;
    }
    const { error: DBError } = await supabase.from("add_on").insert({
      name: addOn.name,
      price: addOn.price,
      service_id: serviceData.id,
    });
    if (DBError) {
      return {
        error: DBError.message,
      };
    }
  }
  revalidatePath("/artist-dashboard/services");
  return {
    error: null,
  };
};

export const updateArtistService = async (service: Service, id?: string) => {
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
  if (role !== "artist" && role !== "admin") {
    return {
      error: "User is not an artist or admin",
    };
  }
  if (!service.id) {
    return {
      error: "Something went wrong",
    };
  }

  const { data: serviceData, error: serviceError } = await supabase
    .from("services")
    .select("artist_id")
    .eq("id", service.id)
    .single();
  if (serviceError) {
    return {
      error: serviceError.message,
    };
  }
  if (serviceData.artist_id !== user.id && serviceData.artist_id !== id) {
    return {
      error: "You are not authorized to update this service",
    };
  }

  const { error: DBError } = await supabase
    .from("services")
    .update({
      name: service.name,
      description: service.description,
      price: service.price,
      duration: service.duration,
    })
    .eq("id", service.id);

  if (service.discount && role === "admin") {
    const { error: DBError } = await supabase
      .from("services")
      .update({
        discount: service.discount,
      })
      .eq("id", service.id);
    if (DBError) {
      return {
        error: DBError.message,
      };
    }
  }

  if (DBError) {
    return {
      error: DBError.message,
    };
  }

  for (const addOn of service.add_on) {
    if (!addOn.id) {
      const { error: DBError } = await supabase.from("add_on").insert({
        name: addOn.name,
        price: addOn.price,
        service_id: service.id,
      });
      if (DBError) {
        return {
          error: DBError.message,
        };
      }
    } else {
      if (addOn.is_deleted) {
        const { error: DBError } = await supabase
          .from("add_on")
          .delete()
          .eq("id", addOn.id)
          .eq("service_id", service.id);

        if (DBError) {
          return {
            error: DBError.message,
          };
        }
        continue;
      }
      const { error: DBError } = await supabase
        .from("add_on")
        .update({
          name: addOn.name,
          price: addOn.price,
        })
        .eq("id", addOn.id);
      if (DBError) {
        return {
          error: DBError.message,
        };
      }
    }
  }

  revalidatePath("/artist-dashboard/services");
  return {
    error: null,
  };
};

export const deleteArtistService = async (serviceId: string, id?: string) => {
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
  if (role !== "artist" && role !== "admin") {
    return {
      error: "User is not an artist or admin",
    };
  }

  const { data: serviceData, error: serviceError } = await supabase
    .from("services")
    .select("artist_id")
    .eq("id", serviceId)
    .single();
  if (serviceError) {
    return {
      error: serviceError.message,
    };
  }
  if (serviceData.artist_id !== user.id && serviceData.artist_id !== id) {
    return {
      error: "You are not authorized to delete this service",
    };
  }

  const { error: DBError } = await supabase
    .from("services")
    .delete()
    .eq("id", serviceId);
  if (DBError) {
    return {
      error: DBError.message,
    };
  }
  revalidatePath("/artist-dashboard/services");
  return {
    error: null,
  };
};

export const createAlbum = async (name: string, id?: string) => {
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
  if (role !== "artist" && role !== "admin") {
    return {
      error: "User is not an artist or admin",
    };
  }
  const { error: DBError } = await supabase.from("albums").insert({
    name: name,
    artist_id: id || user.id,
  });
  if (DBError) {
    return {
      error: DBError.message,
    };
  }
  revalidatePath("/artist-dashboard/portfolio");
  return {
    error: null,
  };
};

export const deleteAlbum = async (albumId: string, id?: string) => {
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
  if (role !== "artist" && role !== "admin") {
    return {
      error: "User is not an artist or admin",
    };
  }
  const { error: DBError } = await supabase
    .from("albums")
    .delete()
    .eq("id", albumId)
    .eq("artist_id", id || user.id);
  if (DBError) {
    return {
      error: DBError.message,
    };
  }
  revalidatePath("/artist-dashboard/portfolio");
  return {
    error: null,
  };
};

export const addCoverImage = async (formData: FormData, id?: string) => {
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
  if (role !== "artist" && role !== "admin") {
    return {
      error: "User is not an artist or admin",
    };
  }
  const { secure_url, public_id } = await uploadToCloudinary(formData);

  const { error: err } = await supabase.from("cover_images").insert({
    url: secure_url,
    artist_id: id || user.id,
  });
  if (err) {
    return {
      error: err.message,
    };
  }
  revalidatePath("/album/cover-images");
  return {
    error: null,
  };
};

export const addAlbumImage = async (
  formData: FormData,
  albumId: string,
  id?: string
) => {
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
  if (role !== "artist" && role !== "admin") {
    return {
      error: "User is not an artist or admin",
    };
  }

  const { data: albumData, error: albumError } = await supabase
    .from("albums")
    .select("artist_id")
    .eq("id", albumId)
    .single();
  if (albumError) {
    return {
      error: albumError.message,
    };
  }
  if (albumData.artist_id !== user.id && albumData.artist_id !== id) {
    return {
      error: "You are not authorized to add images to this album",
    };
  }

  const { secure_url, public_id } = await uploadToCloudinary(formData);

  const { error: err } = await supabase.from("images").insert({
    url: secure_url,
    album_id: albumId,
  });
  if (err) {
    return {
      error: err.message,
    };
  }

  const { error: coverImageError } = await supabase
    .from("albums")
    .update({
      cover_image: secure_url,
    })
    .eq("id", albumId);

  if (coverImageError) {
    return {
      error: coverImageError.message,
    };
  }

  revalidatePath(`/album/${albumId}`);
  return {
    error: null,
  };
};

export const deleteAlbumImage = async (
  imageId: string,
  albumId: string,
  fullPath: string,
  id?: string
) => {
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
  if (role !== "artist" && role !== "admin") {
    return {
      error: "User is not an artist or admin",
    };
  }

  const { data: albumData, error: albumError } = await supabase
    .from("albums")
    .select("artist_id")
    .eq("id", albumId)
    .single();
  if (albumError) {
    return {
      error: albumError.message,
    };
  }
  if (albumData.artist_id !== user.id && albumData.artist_id !== id) {
    return {
      error: "You are not authorized to delete images from this album",
    };
  }

  const { error: DBError } = await supabase
    .from("images")
    .delete()
    .eq("id", imageId)
    .eq("album_id", albumId);

  if (DBError) {
    return {
      error: DBError.message,
    };
  }

  const { data: isLatest, error: isLatestError } = await supabase
    .from("albums")
    .select("cover_image")
    .eq("id", albumId)
    .single();
  if (isLatestError) {
    return {
      error: isLatestError.message,
    };
  }

  if (isLatest.cover_image === fullPath) {
    const { data: latestAlbumImage, error: latestAlbumImageError } =
      await supabase
        .from("images")
        .select("url")
        .eq("album_id", albumId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (latestAlbumImageError) {
      return {
        error: latestAlbumImageError.message,
      };
    }

    const { error: updateError } = await supabase
      .from("albums")
      .update({
        cover_image: latestAlbumImage?.url || null,
      })
      .eq("id", albumId);

    if (updateError) {
      return {
        error: updateError.message,
      };
    }
  }

  const { error: err } = await supabase.storage
    .from("images")
    .remove([fullPath.split("/").pop()!]);
  if (err) {
    return {
      error: err.message,
    };
  }

  revalidatePath(`/album/${albumId}`);
  return {
    error: null,
  };
};

export const deleteCoverImage = async (
  imageId: string,
  fullPath: string,
  id?: string
) => {
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
  if (role !== "artist" && role !== "admin") {
    return {
      error: "User is not an artist or admin",
    };
  }

  const { data: coverImageData, error: coverImageError } = await supabase
    .from("cover_images")
    .select("artist_id")
    .eq("id", imageId)
    .single();
  if (coverImageError) {
    return {
      error: coverImageError.message,
    };
  }
  if (coverImageData.artist_id !== user.id && coverImageData.artist_id !== id) {
    return {
      error: "You are not authorized to delete this cover image",
    };
  }

  const { error: DBError } = await supabase
    .from("cover_images")
    .delete()
    .eq("id", imageId);
  if (DBError) {
    return {
      error: DBError.message,
    };
  }
  const { error: err } = await supabase.storage
    .from("images")
    .remove([fullPath.split("/").pop()!]);
  if (err) {
    return {
      error: err.message,
    };
  }
  revalidatePath("/album/cover-images");
  return {
    error: null,
  };
};

export const addAvailability = async (data: Availability, id?: string) => {
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
  if (role !== "artist" && role !== "admin") {
    return {
      error: "User is not an artist or admin",
    };
  }

  if (timeToMinutes(data.startTime) >= timeToMinutes(data.endTime)) {
    return {
      error: "Start time cannot be greater than end time",
    };
  }

  if (data.dayOfWeek > 6 || data.dayOfWeek < 0) {
    return {
      error: "Invalid day of week",
    };
  }

  const { data: existingSlots, error: fetchError } = await supabase
    .from("availability")
    .select("*")
    .eq("artist_id", id || user.id)
    .eq("day", data.dayOfWeek)
    .not("start_time", "gte", timeToMinutes(data.endTime))
    .not("end_time", "lte", timeToMinutes(data.startTime));

  if (fetchError) {
    console.log(fetchError);
    return {
      error: "Something went wrong",
    };
  }

  if (existingSlots.length > 0) {
    return {
      error: "This slot conflicts with an existing slot",
    };
  }

  const { data: newAvailability, error: DBError } = await supabase
    .from("availability")
    .insert({
      day: data.dayOfWeek,
      artist_id: id || user.id,
      start_time: timeToMinutes(data.startTime),
      end_time: timeToMinutes(data.endTime),
    })
    .select("id")
    .single();

  if (DBError) {
    return {
      error: DBError.message,
    };
  }

  return {
    error: null,
    data: newAvailability.id,
  };
};

export const deleteAvailability = async (id: string, artistId?: string) => {
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
  if (role !== "artist" && role !== "admin") {
    return {
      error: "User is not an artist or admin",
    };
  }

  const { data: availabilityData, error: availabilityError } = await supabase
    .from("availability")
    .select("artist_id")
    .eq("id", id)
    .single();

  if (availabilityError) {
    if (availabilityError.code === "PGRST116") {
      return {
        error: "Availability not found",
      };
    }
    return {
      error: availabilityError.message,
    };
  }
  if (
    availabilityData.artist_id !== user.id &&
    availabilityData.artist_id !== artistId
  ) {
    return {
      error: "You are not authorized to delete this availability",
    };
  }

  const { error: DBError } = await supabase
    .from("availability")
    .delete()
    .eq("id", id);
  if (DBError) {
    return {
      error: DBError.message,
    };
  }
  return {
    error: null,
  };
};

export const addBlockedDate = async (data: BlockedDate, id?: string) => {
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
  if (role !== "artist" && role !== "admin") {
    return {
      error: "User is not an artist or admin",
    };
  }

  if (timeToMinutes(data.start_time) >= timeToMinutes(data.end_time)) {
    return {
      error: "Start time cannot be greater than end time",
    };
  }

  if (data.no_of_artist < 1) {
    return {
      error: "Number of artists cannot be less than 1",
    };
  }

  const date = new Date(data.date);
  const day = date.getDay() === 0 ? 6 : date.getDay() - 1;

  const { data: availabilityData, error: availError } = await supabase
    .from("availability")
    .select("*")
    .eq("artist_id", id || user.id)
    .eq("day", day)
    .lte("start_time", timeToMinutes(data.start_time))
    .gte("end_time", timeToMinutes(data.end_time));

  if (availError) {
    return {
      error: availError.message,
    };
  }

  if (availabilityData.length === 0) {
    return {
      error: "This slot is not available",
    };
  }

  const { data: bookingsData, error: bookingsError } = await supabase
    .from("order")
    .select("start_time, services!inner(duration, artist_id), status")
    .eq("date", data.date)
    .not("status", "eq", "cancelled")
    .not("status", "eq", "pending")
    .eq("services.artist_id", id || user.id);

  if (bookingsError) {
    return {
      error: bookingsError.message,
    };
  }

  const { data: blockedData, error: blockedError } = await supabase
    .from("blocked_date")
    .select("*")
    .eq("artist_id", id || user.id)
    .eq("date", data.date)
    .not("end_time", "lt", timeToMinutes(data.start_time))
    .not("start_time", "gt", timeToMinutes(data.end_time));

  if (blockedError) {
    return {
      error: blockedError.message,
    };
  }

  const startTime = timeToMinutes(data.start_time);
  const endTime = timeToMinutes(data.end_time);

  const { data: no_of_artists, error: no_of_artists_error } = await supabase
    .from("artist_profile")
    .select("no_of_artists")
    .eq("id", id || user.id)
    .single();

  if (no_of_artists_error) {
    return {
      error: no_of_artists_error.message,
    };
  }
  const timeSlots: Record<number, number> = {};

  for (let minute = startTime; minute < endTime; minute += 30) {
    timeSlots[minute] = no_of_artists.no_of_artists;
  }

  for (const booking of bookingsData) {
    const bookingStartTime = booking.start_time;
    const bookingEndTime = bookingStartTime + booking.services.duration;

    for (
      let minute = Math.max(startTime, bookingStartTime);
      minute < Math.min(endTime, bookingEndTime);
      minute += 30
    ) {
      if (timeSlots[minute] && timeSlots[minute] > 0) {
        timeSlots[minute]--;
      }
    }
  }

  for (const blocked of blockedData) {
    const blockedStartTime = blocked.start_time;
    const blockedEndTime = blocked.end_time;

    for (
      let minute = Math.max(startTime, blockedStartTime);
      minute < Math.min(endTime, blockedEndTime);
      minute += 30
    ) {
      if (timeSlots[minute] && timeSlots[minute] > 0) {
        timeSlots[minute]--;
      }
    }
  }

  const availableArtists = Math.min(...Object.values(timeSlots));

  if (availableArtists < data.no_of_artist) {
    return {
      error: "Not enough artists available",
    };
  }

  const { data: newBlockedDate, error: DBError } = await supabase
    .from("blocked_date")
    .insert({
      date: data.date,
      artist_id: id || user.id,
      start_time: timeToMinutes(data.start_time),
      end_time: timeToMinutes(data.end_time),
      no_of_artist: data.no_of_artist,
    })
    .select("id")
    .single();
  if (DBError) {
    return {
      error: DBError.message,
    };
  }
  return {
    error: null,
    data: newBlockedDate.id,
  };
};

export const deleteBlockedDate = async (id: string, artistId?: string) => {
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
  if (role !== "artist" && role !== "admin") {
    return {
      error: "User is not an artist or admin",
    };
  }

  const { data: blockedDateData, error: blockedDateError } = await supabase
    .from("blocked_date")
    .select("artist_id")
    .eq("id", id)
    .single();

  if (blockedDateError) {
    if (blockedDateError.code === "PGRST116") {
      return {
        error: "Blocked date not found",
      };
    }
    return {
      error: blockedDateError.message,
    };
  }
  if (
    blockedDateData.artist_id !== user.id &&
    blockedDateData.artist_id !== artistId
  ) {
    return {
      error: "You are not authorized to delete this blocked date",
    };
  }

  const { error: DBError } = await supabase
    .from("blocked_date")
    .delete()
    .eq("id", id);

  if (DBError) {
    return {
      error: DBError.message,
    };
  }

  return {
    error: null,
  };
};

export const bookService = async (
  booking: Booking,
  addOns: AddOnBooking,
  razorpayId: string,
  paidAmount: number,
  totalAmount: number,
  promoCodeAmount: number,
  discountAmount: number,
  serviceDiscountAmount: number,
  promoCodeId?: string,
) => {
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
  if (role !== "customer") {
    return {
      error: "User is not a customer",
    };
  }

  const { data: serviceData, error: serviceError } = await supabase
    .from("services")
    .select("id, name, price, duration, artist_id")
    .eq("id", booking.service_id)
    .single();
  if (serviceError) {
    return {
      error: serviceError.message,
    };
  }

  let promoCodeData: { id: string; discount: number } | null = null;
  if (promoCodeId) {
    const { data: promoCodeDataDB, error: promoCodeError } = await supabase
      .from("promo_codes")
      .select("id, discount")
      .eq("id", promoCodeId)
      .single();
    if (promoCodeError) {
      return { error: promoCodeError.message };
    }
    if (!promoCodeDataDB) {
      return { error: "Invalid promo code" };
    }
    promoCodeData = promoCodeDataDB;
  }

  const startTime = booking.start_time;
  const endTime = startTime + serviceData.duration;

  const date = new Date(booking.date);
  const day = date.getDay() === 0 ? 6 : date.getDay() - 1;

  const { data: availabilityData, error: availabilityError } = await supabase
    .from("availability")
    .select("*")
    .eq("artist_id", serviceData.artist_id)
    .eq("day", day)
    .lte("start_time", startTime)
    .gte("end_time", endTime);

  if (availabilityError) {
    return {
      error: availabilityError.message,
    };
  }

  if (availabilityData.length === 0) {
    return {
      error: "This slot is not available",
    };
  }

  const { data: blockedDateData, error: blockedDateError } = await supabase
    .from("blocked_date")
    .select("*")
    .eq("artist_id", user.id)
    .eq("date", booking.date)
    .not("end_time", "lt", startTime)
    .not("start_time", "gt", endTime);

  if (blockedDateError) {
    return {
      error: blockedDateError.message,
    };
  }

  const { data: bookingsData, error: bookingsError } = await supabase
    .from("order")
    .select("start_time, services!inner(duration, artist_id), status")
    .eq("date", booking.date)
    .not("status", "eq", "cancelled")
    .not("status", "eq", "pending")
    .eq("services.artist_id", serviceData.artist_id);

  if (bookingsError) {
    return {
      error: bookingsError.message,
    };
  }

  const { data: no_of_artists, error: no_of_artists_error } = await supabase
    .from("artist_profile")
    .select("no_of_artists")
    .eq("id", serviceData.artist_id)
    .single();

  if (no_of_artists_error) {
    return {
      error: no_of_artists_error.message,
    };
  }

  const timeSlots: Record<number, number> = {};

  for (let minute = startTime; minute < endTime; minute += 30) {
    timeSlots[minute] = no_of_artists.no_of_artists;
  }

  for (const booking of bookingsData) {
    const bookingStartTime = booking.start_time;
    const bookingEndTime = bookingStartTime + booking.services.duration;

    for (
      let minute = Math.max(startTime, bookingStartTime);
      minute < Math.min(endTime, bookingEndTime);
      minute += 30
    ) {
      if (timeSlots[minute] && timeSlots[minute] > 0) {
        timeSlots[minute]--;
      }
    }
  }

  for (const blocked of blockedDateData) {
    const blockedStartTime = blocked.start_time;
    const blockedEndTime = blocked.end_time;

    for (
      let minute = Math.max(startTime, blockedStartTime);
      minute < Math.min(endTime, blockedEndTime);
      minute += 30
    ) {
      if (timeSlots[minute] && timeSlots[minute] > 0) {
        timeSlots[minute]--;
      }
    }
  }

  const availableArtists = Math.min(...Object.values(timeSlots));

  if (availableArtists < 1) {
    return {
      error: "This slot is not available",
    };
  }

  if (booking.location_type === "client_home" && !booking.address) {
    return {
      error: "Address is required",
    };
  }

  const { data: newOrder, error: DBError } = await supabase
    .from("order")
    .insert({
      service_id: booking.service_id,
      start_time: booking.start_time,
      date: booking.date,
      user_id: user.id,
      client_address:
      booking.location_type === "client_home" ? booking.address : null,
      razorpay_id: razorpayId,
      paid_amount: paidAmount,
      total_amount: totalAmount,
      promo_code: promoCodeId,
      discount: discountAmount,
      promo_code_discount: promoCodeAmount,
      service_discount: serviceDiscountAmount,
    })
    .select("id")
    .single();
  if (DBError) {
    return {
      error: DBError.message,
    };
  }
  const res = await Promise.all(
    addOns.map(async (addOn) => {
      const { error: DBError } = await supabase.from("booked_add_on").insert({
        booking_id: newOrder.id,
        add_on_id: addOn.add_on_id,
        count: addOn.count,
      });
      if (DBError) {
        return {
          error: DBError.message,
        };
      }
    })
  );
  if (res.some((r) => r?.error)) {
    return {
      error: res.find((r) => r?.error)?.error,
    };
  }

  return {
    error: null,
  };
};

export const deleteArtist = async (
  artistId: string
): Promise<Result<string>> => {
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
  const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(
    artistId
  );
  if (authError) {
    return { error: authError.message };
  }
  return { data: "Artist deleted successfully" };
};

export const addFeaturedArtist = async (
  artistId: string
): Promise<Result<string>> => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    return { error: error.message };
  }
  if (!data) {
    return { error: "User not found" };
  }
  const role = await getUserRole();
  if (role !== "admin") {
    return { error: "User is not an admin" };
  }
  const { error: DBError } = await supabase
    .from("artist_profile")
    .update({
      is_featured: true,
    })
    .eq("id", artistId);
  if (DBError) {
    return { error: DBError.message };
  }
  revalidatePath("/admin/artists");
  return { data: "Artist added to featured artists" };
};

export const removeFeaturedArtist = async (
  artistId: string
): Promise<Result<string>> => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    return { error: error.message };
  }
  if (!data) {
    return { error: "User not found" };
  }
  const role = await getUserRole();
  if (role !== "admin") {
    return { error: "User is not an admin" };
  }
  const { error: DBError } = await supabase
    .from("artist_profile")
    .update({
      is_featured: false,
    })
    .eq("id", artistId);
  if (DBError) {
    return { error: DBError.message };
  }
  revalidatePath("/admin/artists");
  return { data: "Artist removed from featured artists" };
};

export const createOrder = async (
  booking: Booking,
  addOns: AddOnBooking,
  promoCodeId?: string
) => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    return { error: error.message };
  }
  if (!data) {
    return { error: "User not found" };
  }
  const role = await getUserRole();
  if (role !== "customer") {
    return { error: "User is not a customer" };
  }
  const [userRes, serviceRes] = await Promise.all([
    supabase.from("users").select("id, first_name, last_name, email, phone_no").eq("id", data.user.id).single(),
    supabase.from("services").select("id, name, price, duration, artist_id, discount").eq("id", booking.service_id).single()
  ]);
  if (userRes.error || serviceRes.error) {
    return { error: userRes.error?.message || serviceRes.error?.message };
  }
  const userData = userRes.data;
  const serviceData = serviceRes.data;

  const addOnsMap = new Map<string, number>();
  for (const addOn of addOns) {
    addOnsMap.set(addOn.add_on_id, addOn.count);
  }
  let addOnsData: { id: string; name: string; price: number; count: number }[] =
    [];
  const addOnIds = addOns.map((addOn) => addOn.add_on_id);
  if (addOnIds.length > 0) {
    const { data: addOnsDetails, error: addOnsError } = await supabase
      .from("add_on")
      .select("id, name, price")
      .in("id", addOnIds);

    if (addOnsError) {
      return { error: addOnsError.message };
    }

    addOnsData = addOnsDetails.map((addOn) => ({
      id: addOn.id,
      name: addOn.name,
      price: addOn.price,
      count: addOnsMap.get(addOn.id) || 0,
    }));
  }

  let promoCodeDiscount = 0;
  if (promoCodeId) {
    const { data: promoCodeData, error: promoCodeError } = await supabase
      .from("promo_codes")
      .select("id, discount")
      .eq("id", promoCodeId)
      .single();
    if (promoCodeError) {
      return { error: promoCodeError.message };
    }
    if (promoCodeData) {
      promoCodeDiscount = promoCodeData.discount;
    }
  }

  const { data: artistData, error: artistError } = await supabase
    .from("services")
    .select("artist_profile!inner(discount)")
    .eq("id", serviceData.id)
    .single();
  if (artistError) {
    return { error: artistError.message };
  }
  const artistDiscount = artistData.artist_profile.discount;
  const paymentDetails = getFinalAmount(
    serviceData.price,
    addOnsData,
    promoCodeDiscount,
    artistDiscount,
    serviceData.discount
  );
  const tokenAmount = Math.ceil((paymentDetails.finalAmount * 0.3) / 50) * 50;
  const finalAmount =
    paymentDetails.finalAmount < 200 ? paymentDetails.finalAmount : Math.max(tokenAmount, 200);
  const options = {
    amount: finalAmount * 100,
    currency: "INR",
    receipt: `${userData.id.slice(0, 8)}_${Date.now()}`,
    notes: {
      user_id: data.user.id,
      user_name: `${userData.first_name} ${userData.last_name}`,
    },
  };
  try {
    const order = await razorpay.orders.create(options);
    return {
      data: {
        order_id: order.id,
        name: userData.first_name + " " + userData.last_name,
        email: userData.email,
        phone: userData.phone_no,
        tokenAmount: finalAmount,
        paymentDetails: paymentDetails,
      },
      error: null,
    };
  } catch (error: any) {
    console.log(error);
    return { error: error.description };
  }
};

export const cancelBooking = async (bookingId: string, reason: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    return { error: error.message };
  }
  if (!data) {
    return { error: "User not found" };
  }
  const role = await getUserRole();
  if (role !== "customer") {
    return { error: "User is not a customer" };
  }
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("first_name, last_name")
    .eq("id", data.user.id)
    .single();
  if (userError) {
    return { error: userError.message };
  }
  const { data: bookingData, error: bookingError } = await supabase
    .from("order")
    .select(
      "id, status, user_id, services!inner(artist_id, name), date, start_time"
    )
    .eq("id", bookingId)
    .single();
  if (bookingError) {
    return { error: bookingError.message };
  }
  if (bookingData.user_id !== data.user.id) {
    return { error: "You are not authorized to cancel this booking" };
  }
  if (bookingData.status !== "paid") {
    return { error: "You haven't paid for this booking, so it is not valid" };
  }
  if (!shouldAllowCancel(bookingData.date, bookingData.start_time)) {
    return {
      error:
        "You can only cancel this booking within 36 hours of the booking time",
    };
  }
  const { error: cancelError } = await supabase
    .from("order")
    .update({
      status: "cancel_requested",
      cancel_message: reason,
    })
    .eq("id", bookingId);
  if (cancelError) {
    return { error: cancelError.message };
  }
  revalidatePath("/customer-dashboard/bookings");
  return { error: null };
};

export const createPayment = async (payment: CreatePayment) => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    return { error: error.message };
  }
  if (!data) {
    return { error: "User not found" };
  }
  const role = await getUserRole();
  if (role !== "admin") {
    return { error: "User is not an admin" };
  }
  const result = await getArtistDue(payment.artist_id);
  if ("error" in result) {
    return { error: result.error };
  }
  if (result.data < payment.amount) {
    return { error: "Amount is greater than due" };
  }
  const { error: paymentError } = await supabase.from("payments").insert({
    artist_id: payment.artist_id,
    amount: payment.amount,
    notes: payment.notes,
  });
  console.log(paymentError);
  if (paymentError) {
    return { error: paymentError.message };
  }
  revalidatePath("/admin/payments");
  return { error: null };
};

export const disableArtist = async (artistId: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    return { error: error.message };
  }
  if (!data) {
    return { error: "User not found" };
  }
  const role = await getUserRole();
  if (role !== "admin") {
    return { error: "User is not an admin" };
  }
  const { error: DBError } = await supabase
    .from("artist_profile")
    .update({
      disabled: true,
    })
    .eq("id", artistId);
  if (DBError) {
    return { error: DBError.message };
  }
  revalidatePath("/admin/artists");
  return { error: null };
};

export const enableArtist = async (artistId: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    return { error: error.message };
  }
  if (!data) {
    return { error: "User not found" };
  }
  const role = await getUserRole();
  if (role !== "admin") {
    return { error: "User is not an admin" };
  }
  const { error: DBError } = await supabase
    .from("artist_profile")
    .update({
      disabled: false,
    })
    .eq("id", artistId);
  if (DBError) {
    return { error: DBError.message };
  }
  revalidatePath("/admin/artists");
  return { error: null };
};

export const getPromoCodeDiscount = async (
  promoCode: string
): Promise<Result<{ discount: number; codeId: string }>> => {
  const supabase = await createClient();
  const { data, error: DBError } = await supabase.auth.getUser();
  if (DBError) {
    return { error: DBError.message };
  }
  if (!data) {
    return { error: "User not found" };
  }
  const role = await getUserRole();
  if (role !== "customer") {
    return { error: "User is not a customer" };
  }
  const { data: promoCodeData, error: promoCodeError } = await supabase
    .from("promo_codes")
    .select("id, discount, created_at")
    .ilike("code", promoCode.trim())
    .eq("is_disabled", false)
    .maybeSingle();
  if (promoCodeError) {
    return { error: promoCodeError.message };
  }
  if (!promoCodeData) {
    return { error: "Invalid promo code" };
  }
  return {
    data: { discount: promoCodeData.discount, codeId: promoCodeData.id },
  };
};

export const deleteUser = async (userId: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    return { error: error.message };
  }
  if (!data) {
    return { error: "User not found" };
  }
  const role = await getUserRole();
  if (role !== "admin") {
    return { error: "User is not an admin" };
  }
  const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(
    userId
  );
  if (authError) {
    return { error: authError.message };
  }
  revalidatePath("/admin/users");
  return { error: null };
};

export const updateDiscountForArtist = async (
  artistId: string,
  discount: number
) => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    return { error: error.message };
  }
  const role = await getUserRole();
  if (role !== "admin") {
    return { error: "User is not an admin" };
  }
  const { error: DBError } = await supabase
    .from("artist_profile")
    .update({
      discount: discount,
    })
    .eq("id", artistId);
  if (DBError) {
    return { error: DBError.message };
  }
  revalidatePath("/admin/artists");
  return { error: null };
};
