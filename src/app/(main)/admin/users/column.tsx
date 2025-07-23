"use client"
import { ColumnDef } from "@tanstack/react-table";
import { User } from "@/lib/type";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { deleteUser } from "@/action/user";
import { Trash2 } from "lucide-react";
import { Loader2 } from "lucide-react";
import { useState } from "react";

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
    {
        header: "Actions",
        accessorKey: "actions",
        cell: ({ row }) => {
            return <div className="text-right">
                <DeleteButton userId={row.original.id} />
            </div>
        },
    },
]

const DeleteButton = ({ userId }: { userId: string }) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if(!confirm("Are you sure you want to delete this user?")) {
            return;
        }
        setIsDeleting(true);
        const result = await deleteUser(userId);
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("User deleted successfully");
        }
        setIsDeleting(false);
    };

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="h-8 w-8 p-0"
        >
            {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <Trash2 className="h-4 w-4" />
            )}
        </Button>
    );
};
