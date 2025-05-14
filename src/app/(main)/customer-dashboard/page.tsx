import ArtistList from "@/components/ArtistList";
import Error from "@/components/Error";
import { getArtists } from "@/lib/user";

export default async function CustomerDashboardPage() {
  const result = await getArtists();
  if ('error' in result) {
    return <Error error={result.error} />
  }

  return (
    <ArtistList artists={result.data} />
  )
}
