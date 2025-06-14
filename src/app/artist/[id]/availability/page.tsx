import AvailabilityManager from '@/components/dashboard/AvailabilityManager';
import { Availability, BlockedDate } from '@/lib/type';
import { getArtistBookings, getAvailability, getBlockedDates, getNoOfArtists } from '@/lib/user';
import { minutesToTime } from '@/lib/utils';
import Error from '@/components/Error';
const page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const result = await getAvailability(id);
  if ('error' in result) {
    return <Error error={result.error} />;
  }
  const data = result.data;

  const blockedDatesResult = await getBlockedDates(id);
  if ('error' in blockedDatesResult) {
    return <Error error={blockedDatesResult.error} />;
  }
  const blockedDatesData = blockedDatesResult.data;

  const noOfArtistsResult = await getNoOfArtists(id);
  if ('error' in noOfArtistsResult) {
    return <Error error={noOfArtistsResult.error} />;
  }
  const noOfArtists = noOfArtistsResult.data;

  const bookingsResult = await getArtistBookings(id);
  if ('error' in bookingsResult) {
    return <Error error={bookingsResult.error} />;
  }
  const bookingsData = bookingsResult.data;

  const availability: Availability[] = data.map((item) => ({
    id: item.id,
    startTime: minutesToTime(item.start_time),
    endTime: minutesToTime(item.end_time),
    dayOfWeek: item.day,
  }))

  const blockedDates: BlockedDate[] = blockedDatesData.map((item) => ({
    id: item.id,
    date: item.date,
    no_of_artist: item.no_of_artist,
    start_time: minutesToTime(item.start_time),
    end_time: minutesToTime(item.end_time),
  }))
  return (
    <AvailabilityManager artistId={id} bookings={bookingsData} blockedDates={blockedDates} availability={availability} maxClients={noOfArtists} />
  )
}

export default page
