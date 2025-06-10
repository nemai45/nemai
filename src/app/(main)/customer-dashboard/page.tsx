import ArtistList from "@/components/ArtistList";
import Error from "@/components/Error";
import { getArtists } from "@/lib/user";
import { getUserRole } from "@/lib/get-user-role";
import { redirect } from "next/navigation";

export default async function CustomerDashboardPage() {
  const result = await getArtists();
  if ('error' in result) {
    return <Error error={result.error} />
  }
  const role = await getUserRole();
  if (!role) {
    return redirect('/login')
  }
  return (
    <ArtistList artists={result.data} role={role} />
  )
}
