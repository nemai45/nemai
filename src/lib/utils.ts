import axios from "axios";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getLocation = async (address: string) => {
  const url = `https://api.opencagedata.com/geocode/v1/json`;

  try {
    const response = await axios.get(url, {
      params: {
        key: process.env.NEXT_PUBLIC_OPENCAGE_API_KEY,
        q: address,
        limit: 1,
        language: "en",
      },
    });

    const data = response.data;

    if (data && data.results && data.results.length > 0) {
      const location = data.results[0].geometry;
      return {
        lat: location.lat,
        lng: location.lng,
      };
    } else {
      throw new Error("No results found");
    }
  } catch (err) {
    if (err instanceof Error) {
      return {
        error: "Something went wrong",
      };
    } else {
      return {
        error: "Something went wrong",
      };
    }
  }
};

export const minutesToTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

export const timeToMinutes = (time: string) => {
  const [hours, mins] = time.split(':').map(Number);
  return hours * 60 + mins;
}
