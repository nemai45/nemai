import { getUsers } from '@/lib/user';
import React from 'react'
import { columns } from './column';
import { DataTable } from './data-table';

const page = async () => {
    const result = await getUsers();
    if('error' in result) {
        return <div>{result.error}</div>
    }
    const users = result.data;
  return (
    <>
        <h1 className='text-2xl font-bold'>Users</h1>
        <DataTable columns={columns} data={users} />
    </>
  )
}

export default page