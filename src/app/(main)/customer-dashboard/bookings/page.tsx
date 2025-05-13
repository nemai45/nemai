import BookingsList from '@/components/dashboard/BookingsList';
import { getBookings } from '@/lib/user'
import React from 'react'

const page = async () => {
  const { data, error } = await getBookings();
  if (error) {
    return <div>{error}</div>;
  }
  if (!data) {
    return <div>No bookings found</div>;
  }
  return (
    <div>
      <BookingsList bookings={data} />
    </div>
  )
}

export default page