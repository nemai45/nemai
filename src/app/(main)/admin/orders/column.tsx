"use client"
import { OrderDetails } from "@/lib/type";
import { ColumnDef } from "@tanstack/react-table";

export const columns: ColumnDef<OrderDetails>[] = [
    {
        header: "Order ID",
        accessorKey: "id",
    },
    {
        header: "Total Amount",
        accessorKey: "total_amount",
    },
    {
        header: "Paid Amount",
        accessorKey: "paid_amount",
    },
    {
        header: "Discount",
        accessorKey: "discount",
    },
    {
        header: "Promo Code Discount",
        accessorKey: "promo_code_discount",
    },
    {
        header: "Date",
        accessorKey: "date",
    },
    {
        header: "Service Name",
        accessorKey: "service_name",
    },
    {
        header: "Artist Name",
        accessorKey: "artist_name",
    },
    {
        header: "User Name",
        accessorKey: "user_name",
    },
    {
        header: "Status",
        accessorKey: "status",
    },
    {
        header: "Promo Code",
        accessorKey: "promo_code",
    },
]