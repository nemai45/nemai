"use client"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Star } from "lucide-react"

interface ArtistCardProps {
  id: string
  name: string
  location?: string
  bio?: string
  experience?: number
  avgRating?: number
  avatarUrl?: string
  servicesCount?: number
  priceRange?: string
}

const ArtistCard = ({
  id,
  name,
  location,
  bio,
  experience,
  avgRating,
  avatarUrl,
  servicesCount,
  priceRange,
}: ArtistCardProps) => {
  const router = useRouter()

  const viewArtistProfile = () => {
    router.push(`/artist-profile/${id}`)
  }

  // Extract first letter of first and last name for avatar fallback
  const getInitials = () => {
    if (!name) return "NA"
    const parts = name.split(" ")
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <Card className="h-full overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={name} />
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg">{name}</CardTitle>
            {location && <CardDescription className="text-sm">{location}</CardDescription>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 pb-4">
        {bio && <p className="text-sm text-muted-foreground line-clamp-2">{bio}</p>}
        <div className="flex flex-wrap gap-2 mt-2">
          {avgRating && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              {avgRating.toFixed(1)}
            </Badge>
          )}
          {experience && <Badge variant="outline">{experience} years exp.</Badge>}
          {servicesCount && <Badge variant="outline">{servicesCount} services</Badge>}
          {priceRange && <Badge variant="secondary">{priceRange}</Badge>}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" onClick={viewArtistProfile}>
          View Profile
        </Button>
      </CardFooter>
    </Card>
  )
}

export default ArtistCard
