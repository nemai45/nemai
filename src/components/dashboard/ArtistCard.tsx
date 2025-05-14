"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Artist } from "@/lib/type"
import { MapPin } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface ArtistCardProps {
  artist: Artist
}

const ArtistCard = ({
  artist,
}: ArtistCardProps) => {
  const router = useRouter()

  const viewArtistProfile = () => {
    router.push(`/artist-profile/${artist.id}`)
  }

  return (
    <Card
      key={artist.id}
      className="unicorn-card overflow-hidden group hover:scale-[1.02] transition-transform duration-300"
    >
      <div className="relative aspect-square">
        <img
          src={artist.logo || "/hero.jpg"}
          alt={artist.business_name}
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-4 left-4 right-4">
            <Link href={`/artist-profile/${artist.id}`}>
              <Button className="w-full unicorn-button">Book Now</Button>
            </Link>
          </div>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full overflow-hidden">
            <img
              src={artist.logo || "/hero.jpg"}
              alt={`${artist.business_name} profile`}
              className="object-cover w-full h-full"
            />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{artist.business_name}</h3>
          </div>
        </div>
        <div className="flex items-center text-muted-foreground text-sm mt-2">
          <MapPin className="w-4 h-4 mr-1" />
          <span>{artist.address}</span>
        </div>
      </CardContent>
    </Card>
  )
}

export default ArtistCard
