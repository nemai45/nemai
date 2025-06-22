import { DataTable } from '@/components/DataTable';
import { getCanceledBookings } from '@/lib/user';
import React from 'react'
import { columns } from './column';

const page = async () => {
    const result = await getCanceledBookings();
    if('error' in result) {
        return <div>{result.error}</div>
    }
    const bookings = result.data;
  return (
    <>
        <h1 className='text-2xl font-bold'>Canceled Bookings</h1>
        <DataTable columns={columns} data={bookings} />
    </>
  )
}

export default page