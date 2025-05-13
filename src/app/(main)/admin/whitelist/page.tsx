import { DataTable } from '@/components/admin/DataTable'
import { WhitelistForm } from '@/components/admin/WhiteListForm'
import { getCachedWhiteListedUsers, getWhiteListedUsers } from '@/lib/admin';
import React from 'react'

const page = async (props: {
    searchParams?: Promise<{
        page?: string;
    }>;
}) => {
    const searchParams = await props.searchParams;
    const currentPage = Number(searchParams?.page) || 1;
    const itemsPerPage = 5;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-1">Whitelist</h1>
                <p className="text-gray-500">Manage which email addresses are allowed to register as artists/admins</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-purple-100">
                <h2 className="text-xl font-semibold mb-4">Add New Artist/Admin to Whitelist</h2>
                <WhitelistForm />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-purple-100">
                <h2 className="text-xl font-semibold mb-4">Whitelisted Emails</h2>
                <DataTable
                    fetcher={getWhiteListedUsers}
                    currentPage={currentPage}
                    itemsPerPage={itemsPerPage}
                    columns={[
                        { key: "email", header: "Email Address" },
                        { key: "created_at", header: "Date Added", cell: (item: any) => new Date(item.created_at).toLocaleDateString() },
                        { key: "added_by", header: "Added By" },
                        {
                            key: "role",
                            header: "Role",
                            cell: (item: any) => (
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.role === "artist"
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-red-100 text-red-800'
                                    }`}>
                                    {item.role === "artist" ? 'Artist' : 'Admin'}
                                </span>
                            )
                        },
                        {
                            key: "status",
                            header: "Registration Status",
                            cell: (item: any) => (
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.status === "active"
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {item.status === "active" ? 'Registered' : 'Pending'}
                                </span>
                            )
                        },
                    ]}
                />
            </div>
        </div>
    )
}

export default page