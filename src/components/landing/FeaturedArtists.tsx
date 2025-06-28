import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, MapPin, Calendar } from "lucide-react"
import Link from "next/link"
import ArtistCard from "../dashboard/ArtistCard"
import { Artist } from "@/lib/type"
import { getUserRole } from "@/lib/get-user-role"

interface FeaturedArtistsProps {
  artists: Artist[]
}

const FeaturedArtists = async ({ artists }: FeaturedArtistsProps) => {
  const role = await getUserRole();
  return (
    <section className="py-16 bg-gradient-to-b from-unicorn-light to-white" id="featured-artists">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">Our Featured Nail Artists</h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Discover top-rated nail artists in your area and book your appointment today
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {artists.map((artist) => (
            <ArtistCard key={artist.id} artist={artist} role={role || "customer"} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/login">
            <Button className="unicorn-button inline-flex items-center">View All Nail Artists</Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

export default FeaturedArtists
