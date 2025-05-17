"use server";
import { getUserRole } from "@/lib/get-user-role";
import {
  AddOnBooking,
  Album,
  Availability,
  BlockedDate,
  Booking,
  CombinedInfo,
  Service,
} from "@/lib/type";
import { timeToMinutes } from "@/lib/utils";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export const onBoardUser = async (
  data: CombinedInfo,
  logo: File | null,
  point: { lat: number; lng: number } | null
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
      phone_no: personal.phone_no,
      onboarded: true,
    })
    .eq("id", user.id);
  if (DBError) {
    return {
      error: DBError.message,
    };
  }
  if (role === "artist" && professional) {
    if (logo) {
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
    if (!point) {
      return {
        error: "Something went wrong",
      };
    }
    const { error: DBError } = await supabase.rpc("store_artist", {
      business_name: professional.business_name,
      logo: professional.logo || null,
      bio: professional.bio || null,
      address: professional.address,
      upi_id: professional.upi_id,
      lat: point.lat,
      lng: point.lng,
      no_of_artists: professional.no_of_artists,
      booking_month_limit: professional.booking_month_limit,
      location: professional.location || null,
    });
    if (DBError) {
      return {
        error: DBError.message,
      };
    }
    redirect("/artist-dashboard");
  }
  redirect("/customer-dashboard");
  return {
    logo: null,
    error: null,
  };
};

export const updateUser = async (
  data: CombinedInfo,
  logo: File | null,
  point: { lat: number; lng: number } | null
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
      phone_no: personal.phone_no,
    })
    .eq("id", user.id);
  if (DBError) {
    return {
      error: DBError.message,
    };
  }
  if (role === "artist" && professional) {
    if (logo) {
      if (professional.logo) {
        console.log("Removing old logo", professional.logo.split("/").pop());
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
      })
      .eq("id", user.id);
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

export const addArtistService = async (service: Service) => {
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

  const { data: serviceData, error: DBError } = await supabase
    .from("services")
    .insert({
      name: service.name,
      description: service.description,
      price: service.price,
      duration: service.duration,
      artist_id: user.id,
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

export const updateArtistService = async (service: Service) => {
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
  if (serviceData.artist_id !== user.id) {
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

export const deleteArtistService = async (serviceId: string) => {
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
  if (serviceData.artist_id !== user.id) {
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

export const createAlbum = async (name: string) => {
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
  const { error: DBError } = await supabase.from("albums").insert({
    name: name,
    artist_id: user.id,
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

export const deleteAlbum = async (albumId: string) => {
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
  const { error: DBError } = await supabase
    .from("albums")
    .delete()
    .eq("id", albumId)
    .eq("artist_id", user.id);
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

export const addCoverImage = async (file: File) => {
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
  const fileName = `${user.id}-${Date.now()}`;
  const { data, error: DBError } = await supabase.storage
    .from("images")
    .upload(fileName, file);
  if (DBError) {
    return {
      error: DBError.message,
    };
  }
  const { error: err } = await supabase.from("cover_images").insert({
    url: data.fullPath,
    artist_id: user.id,
    id: data.id,
  });
  if (err) {
    return {
      error: err.message,
    };
  }
  return {
    error: null,
  };
};

export const addAlbumImage = async (file: File, albumId: string) => {
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
  if (albumData.artist_id !== user.id) {
    return {
      error: "You are not authorized to add images to this album",
    };
  }

  const fileName = `${user.id}-${Date.now()}`;
  const { data, error: DBError } = await supabase.storage
    .from("images")
    .upload(fileName, file);
  if (DBError) {
    return {
      error: DBError.message,
    };
  }

  const { error: err } = await supabase.from("images").insert({
    url: data.fullPath,
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
      cover_image: data.fullPath,
    })
    .eq("id", albumId);

  if (coverImageError) {
    return {
      error: coverImageError.message,
    };
  }

  revalidatePath(`/artist-dashboard/portfolio/${albumId}`);
  return {
    error: null,
  };
};

export const deleteAlbumImage = async (
  imageId: string,
  albumId: string,
  fullPath: string
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
  if (role !== "artist") {
    return {
      error: "User is not an artist",
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
  if (albumData.artist_id !== user.id) {
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

  const { error: err } = await supabase.storage
    .from("images")
    .remove([fullPath.split("/").pop()!]);
  if (err) {
    return {
      error: err.message,
    };
  }

  revalidatePath(`/artist-dashboard/portfolio/${albumId}`);
  return {
    error: null,
  };
};

export const deleteCoverImage = async (imageId: string, fullPath: string) => {
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
  if (coverImageData.artist_id !== user.id) {
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
  revalidatePath("/artist-dashboard/cover-images");
  return {
    error: null,
  };
};

export const addAvailability = async (data: Availability) => {
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
    .eq("artist_id", user.id)
    .eq("day", data.dayOfWeek)
    .not("start_time", "gt", timeToMinutes(data.endTime))
    .not("end_time", "lt", timeToMinutes(data.startTime));

  if (fetchError) {
    console.log(fetchError)
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

export const deleteAvailability = async (id: string) => {
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
  if (availabilityData.artist_id !== user.id) {
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

export const addBlockedDate = async (data: BlockedDate) => {
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
    .eq("artist_id", user.id)
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
    .select("start_time, services!inner(duration, artist_id)")
    .eq("date", data.date)
    .eq("services.artist_id", user.id);

  if (bookingsError) {
    return {
      error: bookingsError.message,
    };
  }

  const { data: blockedData, error: blockedError } = await supabase
    .from("blocked_date")
    .select("*")
    .eq("artist_id", user.id)
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
    .eq("id", user.id)
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

    for (let minute = Math.max(startTime, bookingStartTime); minute < Math.min(endTime, bookingEndTime); minute += 30) {
      if (timeSlots[minute] && timeSlots[minute] > 0) {
        timeSlots[minute]--;
      }
    }
  }
  
  for(const blocked of blockedData) {
    const blockedStartTime = blocked.start_time;
    const blockedEndTime = blocked.end_time;

    for(let minute = Math.max(startTime, blockedStartTime); minute < Math.min(endTime, blockedEndTime); minute += 30) {
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

export const deleteBlockedDate = async (id: string) => {
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
  if (blockedDateData.artist_id !== user.id) {
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

export const bookService = async (booking: Booking, addOns: AddOnBooking) => {
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
    .select("id, duration, artist_id")
    .eq("id", booking.service_id)
    .single();

  if (serviceError) {
    if (serviceError.code === "PGRST116") {
      return {
        error: "Service not found",
      };
    }
    return {
      error: serviceError.message,
    }
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
    .select("start_time, services!inner(duration, artist_id)")
    .eq("date", booking.date)
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

    for (let minute = Math.max(startTime, bookingStartTime); minute < Math.min(endTime, bookingEndTime); minute += 30) {
      if (timeSlots[minute] && timeSlots[minute] > 0) {
        timeSlots[minute]--;
      }
    }
  }

  for (const blocked of blockedDateData) {
    const blockedStartTime = blocked.start_time;
    const blockedEndTime = blocked.end_time;

    for (let minute = Math.max(startTime, blockedStartTime); minute < Math.min(endTime, blockedEndTime); minute += 30) {
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
  
  const { data: newOrder, error: DBError } = await supabase
    .from("order")
    .insert({
      service_id: booking.service_id,
      start_time: booking.start_time,
      date: booking.date,
      user_id: user.id,
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
