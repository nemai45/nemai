import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, MapPin, Calendar } from "lucide-react"
import Link from "next/link"
import { featuredArtists } from "@/lib/mock-data"

const FeaturedArtists = () => {
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
          {featuredArtists.map((artist) => (
            <Card
              key={artist.id}
              className="unicorn-card overflow-hidden group hover:scale-[1.02] transition-transform duration-300"
            >
              <div className="relative aspect-square">
                <img
                  src={artist.image || "/placeholder.svg"}
                  alt={artist.name}
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
                      src={artist.profileImage || "/placeholder.svg"}
                      alt={`${artist.name} profile`}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{artist.name}</h3>
                    <div className="flex items-center text-amber-500 text-sm">
                      <Star className="w-4 h-4 fill-current mr-1" />
                      {artist.rating} <span className="text-muted-foreground ml-1">({artist.reviews} reviews)</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center text-muted-foreground text-sm mt-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{artist.location}</span>
                </div>
                <div className="flex items-center text-muted-foreground text-sm mt-1">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>Next available: Today</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/browse">
            <Button className="unicorn-button inline-flex items-center">View All Nail Artists</Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

export default FeaturedArtists
