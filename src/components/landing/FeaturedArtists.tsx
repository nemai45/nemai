import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, MapPin, Calendar } from "lucide-react"

// Sample data for featured artists
const FEATURED_ARTISTS = [
  {
    id: 1,
    name: "Sparkle Unicorn Nails",
    rating: 4.9,
    reviews: 124,
    location: "Downtown",
    image: "https://images.unsplash.com/photo-1604902396830-aca29e19b067?auto=format&fit=crop&q=80&w=400&h=400",
    profileImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100&h=100",
  },
  {
    id: 2,
    name: "Magical Manicures",
    rating: 4.8,
    reviews: 98,
    location: "East Village",
    image: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&q=80&w=400&h=400",
    profileImage: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=100&h=100",
  },
  {
    id: 3,
    name: "Rainbow Tips",
    rating: 4.7,
    reviews: 87,
    location: "West Side",
    image: "https://images.unsplash.com/photo-1610992015779-46217a252221?auto=format&fit=crop&q=80&w=400&h=400",
    profileImage: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=100&h=100",
  },
  {
    id: 4,
    name: "Glamour Claws",
    rating: 4.9,
    reviews: 156,
    location: "North Hills",
    image: "https://images.unsplash.com/photo-1571290274554-6a2eaa771e5f?auto=format&fit=crop&q=80&w=400&h=400",
    profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100&h=100",
  },
]

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
          {FEATURED_ARTISTS.map((artist) => (
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
                    <Link href="/auth">
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
          <Link href="/auth">
            <Button className="unicorn-button inline-flex items-center">View All Nail Artists</Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

export default FeaturedArtists
