
import RecentArtistTable from '@/components/admin/RecentArtistTable';
import RecentUserTable from '@/components/admin/RecentUserTable';
import { StatsCard } from '@/components/admin/Stats';
import { getKeyMatrix } from '@/lib/user';
import { Check, FileText, User, Users } from 'lucide-react';

const page = async () => {
    const keyMatrix = await getKeyMatrix();
    if("error" in keyMatrix) {
        return <div>Error: {keyMatrix.error}</div>;
    }
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-1">Admin Dashboard</h1>
                <p className="text-gray-500">Welcome to the Nail Art Marketplace admin portal</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Orders"
                    value={keyMatrix.data.totalBookings}
                    description="All time orders"
                    icon={<FileText className="h-6 w-6" />}
                />
                <StatsCard
                    title="Total Revenue"
                    value={`₹${keyMatrix.data.totalRevenue}`}
                    description="All time revenue"
                    icon={<Check className="h-6 w-6" />}
                />
                <StatsCard
                    title="Active Artists"
                    value={keyMatrix.data.totalArtists}
                    description="Currently active artists"
                    icon={<Users className="h-6 w-6" />}
                />
                <StatsCard
                    title="Total Customers"
                    value={keyMatrix.data.totalUsers}
                    description="Registered customers"
                    icon={<User className="h-6 w-6" />}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-purple-100">
                    <h2 className="text-xl font-semibold mb-4">Recent Users</h2>
                    <RecentUserTable data={keyMatrix.data.recentUsers} />
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-purple-100">
                    <h2 className="text-xl font-semibold mb-4">Recent Artists</h2>
                    <RecentArtistTable data={keyMatrix.data.recentArtist} />
                </div>
            </div>
        </div>
    );
}

export default page