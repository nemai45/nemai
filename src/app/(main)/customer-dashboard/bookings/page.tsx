import BookingsList from '@/components/dashboard/BookingsList';
import Error from '@/components/Error';
import { getBookings } from '@/lib/user'
import React from 'react'

const page = async () => {
  const result = await getBookings();
  if ('error' in result) {
    return <Error error={result.error}/>
  }

  return (
    <div>
      <BookingsList bookings={result.data} />
    </div>
  )
}

export default page