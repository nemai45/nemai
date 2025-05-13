import FilterCalender from "@/components/FilterCalender";
import { getArtistBookings } from "@/lib/user";

export default async function ArtistDashboardPage() {
  const { data, error } = await getArtistBookings();
  if (error) {
    return <div>{error}</div>;
  }
  if (!data) {
    return <div>No bookings found</div>;
  }
  return <FilterCalender bookings={data}/>
}
