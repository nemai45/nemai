import Error from "@/components/Error";
import FilterCalender from "@/components/FilterCalender";
import { getArtistBookings } from "@/lib/user";

export default async function ArtistDashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const result = await getArtistBookings(id);
  if ('error' in result) {
    return <Error error={result.error}/>
  }
  return <FilterCalender bookings={result.data}/>
}
