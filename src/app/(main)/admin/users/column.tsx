"use client"
import { ColumnDef } from "@tanstack/react-table";
import { User } from "@/lib/type";
import { format } from "date-fns";

export const columns: ColumnDef<User>[] = [
    {
        header: "First Name",
        accessorKey: "first_name",
    },
    {
        header: "Last Name",
        accessorKey: "last_name",
    },
    {
        header: "Email",
        accessorKey: "email",
    },
    {
        header: "Phone Number",
        accessorKey: "phone_no",
    },
    {
        header: "Role",
        accessorKey: "role",
    },
    {
        header: () => <div className="text-right">Registered At</div>,
        cell: ({ row }) => {
            const formatted = format(new Date(row.getValue("created_at")), "dd/MM/yyyy")
            return <div className="text-right font-medium">{formatted}</div>
        },
        accessorKey: "created_at",
    },
]