import Error from "@/components/Error";
import FilterCalender from "@/components/FilterCalender";
import { getArtistBookings } from "@/lib/user";

export default async function ArtistDashboardPage() {
  const result = await getArtistBookings();
  if ('error' in result) {
    return <Error error={result.error}/>
  }

  return <FilterCalender bookings={result.data}/>
}
