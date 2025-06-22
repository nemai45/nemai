"use client"
import { ColumnDef } from "@tanstack/react-table";
import { CanceledBooking } from "@/lib/type";
import { format } from "date-fns";
import { minutesToTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CheckIcon, XIcon } from "lucide-react";
import { confirmCancel, rejectCancel } from "@/action/admin";
import { toast } from "sonner";

export const columns: ColumnDef<CanceledBooking>[] = [
    {
        header: "Name",
        accessorKey: "name",
    },
    {
        header: "Phone Number",
        accessorKey: "phone_no",
    },
    {
        header: "Email",
        accessorKey: "email",
    },
    {
        header: "Service Name",
        accessorKey: "service",
    },
    {
        header: "Date",
        accessorKey: "date",
        cell: ({ row }) => {
            const formatted = format(new Date(row.getValue("date")), "dd/MM/yyyy");
            return <div className="font-medium">{formatted}</div>;
        },
    },
    {
        header: "Time",
        accessorKey: "start_time",
        cell: ({ row }) => {
            const formatted = minutesToTime(row.getValue("start_time"));
            return <div className="font-medium">{formatted}</div>;
        },
    },
    {
        header: "Cancel Message",
        accessorKey: "cancel_message",
        cell: ({ row }) => {
            return <div className="font-medium text-wrap">{row.getValue("cancel_message")}</div>;
        },
    },
    {
        header: "Created At",
        accessorKey: "created_at",
        cell: ({ row }) => {
            const formatted = format(new Date(row.getValue("created_at")), "dd/MM/yyyy");
            return <div className="font-medium">{formatted}</div>;
        },
    },
    {
        header: "Accept",
        cell: ({ row }) => {
            return <Button variant="outline" onClick={async () => {
                const { error } = await confirmCancel(row.original.id);
                if(error) {
                    toast.error(error);
                } else {
                    toast.success("Booking cancelled");
                }
            }}><CheckIcon className="w-4 h-4" /></Button>;
        },
    },
    {
        header: "Reject",
        cell: ({ row }) => {
            return <Button variant="destructive" onClick={async () => {
                const { error } = await rejectCancel(row.original.id);
                if(error) {
                    toast.error(error);
                } else {
                    toast.success("Booking is set to confirmed");
                }
            }}><XIcon className="w-4 h-4" /></Button>;
        },
    },
];