import React from 'react'
import BookingList from '@/components/dashboard/BookingsList'
import { getPastBookings } from '@/lib/user'
import Error from '@/components/Error'

const page = async () => {
  const result = await getPastBookings();
  if ('error' in result) {
    return <Error error={result.error}/>
  }
  return (
    <BookingList bookings={result.data} />
  )
}

export default page