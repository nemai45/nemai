import React from 'react'
import BookingList from '@/components/dashboard/BookingsList'
import { getPastBookings } from '@/lib/user'
const page = async () => {
  const { data, error } = await getPastBookings();
  if (error) {
    return <div>{error}</div>;
  }
  if (!data) {
    return <div>No bookings found</div>;
  }
  return (
    <BookingList bookings={data} />
  )
}

export default page