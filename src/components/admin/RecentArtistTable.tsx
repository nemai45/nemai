"use client"
import { DataTable } from "@/components/DataTable"
import React from "react"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface RecentArtistTableProps {
    data: {
        id: string;
        business_name: string;
        logo: string | null;
    }[];
}

const RecentArtistTable = ({ data }: RecentArtistTableProps) => {
    return (
        <DataTable
            data={data}
            columns={[
                {
                    accessorKey: "business_name",
                    header: "Artist Name"
                },
                {
                    accessorKey: "logo",
                    header: "Logo",
                    cell: ({ row }) => {
                        return (
                            <Avatar>
                                <AvatarImage src={`https://ftqdfdhxdtekgjxrlggp.supabase.co/storage/v1/object/public/${row.original.logo}`} alt="Logo" />
                                <AvatarFallback>
                                    {row.original.business_name.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                        )
                    }
                }
            ]}
        />
    )
}

export default RecentArtistTable