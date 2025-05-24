"use client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Artist } from "@/lib/type"
import { MapPin } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface ArtistCardProps {
  artist: Artist
}

const SUPABASE_BUCKET_URL_PREFIX = "https://ftqdfdhxdtekgjxrlggp.supabase.co/storage/v1/object/public/"

const ArtistCard = ({ artist }: ArtistCardProps) => {
  const router = useRouter()

  const viewArtistProfile = () => {
    router.push(`/artist-profile/${artist.id}`)
  }

  return (
    <Card
      key={artist.id}
      className="unicorn-card overflow-hidden group hover:scale-[1.02] transition-transform duration-300 rounded-lg shadow-lg"
    >
      <CardContent className="p-4 flex flex-col h-full">
        <div className="flex flex-col items-center gap-3 mb-3">
          <Avatar className="w-40 h-40">
            <AvatarImage
              className="w-full h-full rounded-full object-cover"
              src={artist.logo ? `${SUPABASE_BUCKET_URL_PREFIX}${artist.logo}` : "/hero.jpg"}
            />
            <AvatarFallback className="flex items-center justify-center bg-gray-200 text-lg font-semibold text-white">
              {artist.business_name}
            </AvatarFallback>
          </Avatar>
          <h3 className="font-semibold text-lg text-center">{artist.business_name}</h3>
        </div>
        <div className="flex items-center text-muted-foreground text-sm mt-2 justify-center gap-2">
          <MapPin className="w-4 h-4" />
          <span>{artist.area?.name || "N/A"}</span>
        </div>
        <div className="flex-grow" />
        <Link href={`/artist-profile/${artist.id}`}>
          <Button className="w-full mt-4 unicorn-button">Book Now</Button>
        </Link>
      </CardContent>

    </Card>
  )
}

export default ArtistCard
