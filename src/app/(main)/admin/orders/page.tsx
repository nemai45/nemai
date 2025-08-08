import { getAllOrders } from '@/lib/user';
import React from 'react'
import { columns } from './column';
import { DataTable } from './data-table';

const page = async () => {
    const result = await getAllOrders();
    if('error' in result) {
        return <div>{result.error}</div>
    }
    const orders = result.data;
  return (
    <>
        <h1 className='text-2xl font-bold'>Orders</h1>
        <DataTable columns={columns} data={orders} />
    </>
  )
}

export default page