"use client"
import { DataTable } from '../DataTable'
import React from 'react'

interface RecentUserTableProps {
    data: {
        id: string;
        first_name: string | null;
        last_name: string | null;
        phone_no: string | null;
        email: string | null;
        created_at: string;
    }[];
}

const RecentUserTable = ({ data }: RecentUserTableProps) => {
    return (
        <DataTable
        data={data}
        columns={[
            {
                accessorKey: "first_name",
                header: "First Name"
            },
            {
                accessorKey: "last_name",
                header: "Last Name"
            },
            {
                accessorKey: "phone_no",
                header: "Phone No"
            },
            {
                accessorKey: "email",
                header: "Email"
            },
            {
                accessorKey: "created_at",
                header: "Created At"
            }
        ]}
    />
    )
}

export default RecentUserTable
