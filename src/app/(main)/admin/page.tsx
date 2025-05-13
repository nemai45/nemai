"use client";
import { DataTable } from '@/components/admin/DataTable';
import { StatsCard } from '@/components/admin/Stats';
import { Check, FileText, User, Users } from 'lucide-react';
import React from 'react'

const page = () => {

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-1">Admin Dashboard</h1>
                <p className="text-gray-500">Welcome to the Nail Art Marketplace admin portal</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Orders"
                    value={0}
                    description="All time orders"
                    icon={<FileText className="h-6 w-6" />}
                />
                <StatsCard
                    title="Total Revenue"
                    value={`$${0}`}
                    description="All time revenue"
                    icon={<Check className="h-6 w-6" />}
                />
                <StatsCard
                    title="Active Artists"
                    value={0}
                    description="Currently active artists"
                    icon={<Users className="h-6 w-6" />}
                />
                <StatsCard
                    title="Total Customers"
                    value={0}
                    description="Registered customers"
                    icon={<User className="h-6 w-6" />}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-purple-100">
                    <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
                    {/* <DataTable
                        data={[]}
                        columns={[
                            { key: "id", header: "Order ID" },
                            { key: "customer", header: "Customer" },
                            { key: "service", header: "Service" },
                            {
                                key: "status",
                                header: "Status",
                                cell: (order:any) => (
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.status === 'completed'
                                            ? 'bg-green-100 text-green-800'
                                            : order.status === 'pending'
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                        {order.status}
                                    </span>
                                )
                            },
                            {
                                key: "amount",
                                header: "Amount",
                                cell: (order) => `$${order.amount.toFixed(2)}`
                            }
                        ]}
                    /> */}
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-purple-100">
                    <h2 className="text-xl font-semibold mb-4">Top Artists</h2>
                    {/* <DataTable
                        data={[]}
                        columns={[
                            { key: "name", header: "Artist Name" },
                            {
                                key: "rating",
                                header: "Rating",
                                cell: (artist:any) => (
                                    <div className="flex items-center">
                                        <span>{artist.rating}</span>
                                        <span className="text-yellow-400 ml-1">★</span>
                                    </div>
                                )
                            },
                            {
                                key: "completedBookings",
                                header: "Bookings",
                                cell: (artist) => artist.completedBookings
                            },
                            {
                                key: "status",
                                header: "Status",
                                cell: (artist) => (
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${artist.status === 'active'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {artist.status}
                                    </span>
                                )
                            }
                        ]}
                    /> */}
                </div>
            </div>
        </div>
    );
}

export default page