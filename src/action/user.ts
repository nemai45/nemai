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

export const onBoardUser = async (data: CombinedInfo, logo: File | null, point: { lat: number, lng: number } | null) => {
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
    const { error: DBError } = await supabase.rpc('store_artist', {
      business_name: professional.business_name,
      logo: professional.logo,
      bio: professional.bio,
      address: professional.address,
      upi_id: professional.upi_id,
      lat: point.lat,
      lng: point.lng,
      no_of_artists: professional.no_of_artists,
      booking_month_limit: professional.booking_month_limit,
      location: professional.location
    })
    if (DBError) {
      return {
        error: DBError.message,
      };
    }
    redirect("/artist-dashboard");
  }
  redirect("/customer-dashboard");
  return {
    error: null,
  };
};

export const updateUser = async (data: CombinedInfo, logo: File | null, point: { lat: number, lng: number } | null) => {
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

  const { data: serviceData, error: serviceError } = await supabase.from("services").select("artist_id").eq("id", service.id).single();
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
    .eq("id", service.id)

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

  const { data: serviceData, error: serviceError } = await supabase.from("services").select("artist_id").eq("id", serviceId).single();
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

  const { data: albumData, error: albumError } = await supabase.from("albums").select("artist_id").eq("id", albumId).single();
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

  const { data: albumData, error: albumError } = await supabase.from("albums").select("artist_id").eq("id", albumId).single();
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

  const { data: coverImageData, error: coverImageError } = await supabase.from("cover_images").select("artist_id").eq("id", imageId).single();
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

  const { data: availabilityData, error: availabilityError } = await supabase.from("availability").select("artist_id").eq("id", id).single();
  if (availabilityError) {
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
  const { data: blockedDateData, error: blockedDateError } = await supabase.from("blocked_date").select("artist_id").eq("id", id).single();
  if (blockedDateError) {
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
