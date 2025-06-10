import ArtistProfile from "@/components/profile/ArtistProfile"
import { getArtistProfile } from "@/lib/user"

async function ArtistProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data, error } = await getArtistProfile(id)
  if (error) {
    return <div>{error}</div>
  }
  if (!data) {
    return <div>No data found</div>
  }
  return (
    <ArtistProfile artistProfile={data}/>
  )
}

export default ArtistProfilePage