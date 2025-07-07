import axios from "axios";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Area } from "react-easy-crop";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getLocation = async (address: string) => {
  const url = `https://maps.googleapis.com/maps/api/geocode/json`;
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) {
    return {
      error: "Google Maps API key is not set",
    };
  }

  try {
    const response = await axios.get(url, {
      params: {
        address: address,
        key: key,
      },
    });

    const data = response.data;
    console.log(data);
    if (data && data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return {
        lat: location.lat,
        lng: location.lng,
      };
    } else {
      return {
        error: "No location found",
      };
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

export const OTP_EXPIRE_TIME = 60;

export const timeToMinutes = (time: string) => {
  const [hours, mins] = time.split(':').map(Number);
  return hours * 60 + mins;
}


export const uploadToCloudinary = async (
  formData: FormData,
): Promise<{
  secure_url: string;
  public_id: string;
}> => {

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    console.log(response);
    throw new Error('Failed to upload image to Cloudinary');
  }

  return response.json();
};


const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', error => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

export const getCroppedImg = async (
  imageSrc: string,
  pixelCrop: Area,
  fileName = 'cropped.jpg',
  quality = 0.9
): Promise<File> => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], fileName, { type: 'image/jpeg' });
          resolve(file);
        }
      },
      'image/jpeg',
      quality
    );
  });
};

export const shouldAllowCancel = (bookingData: string, startTime: number) => {
  const bookingDate = new Date(bookingData);
  bookingDate.setHours(0, startTime, 0, 0);
  const cutoffTime = new Date(bookingDate.getTime() - 36 * 60 * 60 * 1000);
  const now = new Date();
  return now < cutoffTime;
}