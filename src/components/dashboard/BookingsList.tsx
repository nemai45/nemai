"use client"
import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { BookingCard } from '@/components/dashboard/BookingCard';
import type { BookingInfo } from '@/lib/type';
import { Calendar } from '../ui/calendar';

interface BookingListProps {
  bookings: BookingInfo[];
}

function BookingList({ bookings }: BookingListProps) {
  if (bookings.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto animate-fade-in">
        <div className="grid grid-cols-1 gap-6 animate-fade-in">
          <div className="text-center text-muted-foreground">No bookings found</div>
        </div>
      </div>
    )
  }
  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in">
      <div className="grid grid-cols-1 gap-6 animate-fade-in">
        {bookings.map((booking) => (
          <div key={booking.id} className="transform transition-all duration-300 hover:translate-y-[-2px]">
            <BookingCard booking={booking} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default BookingList;