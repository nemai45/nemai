"use client"
import { addFeaturedArtist, deleteArtist, removeFeaturedArtist } from "@/action/user"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Artist } from "@/lib/type"
import { MapPin, Star, StarOff } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"
import NailLoader from "../NailLoader"

interface ArtistCardProps {
  artist: Artist
  role: string
}

const SUPABASE_BUCKET_URL_PREFIX = "https://ftqdfdhxdtekgjxrlggp.supabase.co/storage/v1/object/public/"

const ArtistCard = ({ artist, role }: ArtistCardProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const deleteArtistByID = async () => {
    if (!confirm("Are you sure you want to delete this artist?")) {
      return;
    }
    setIsLoading(true);
    const result = await deleteArtist(artist.id);
    if ('error' in result) {
      toast.error(result.error);
    } else {
      toast.success("Artist deleted successfully");
    }
    setIsLoading(false);
  }
  const addFeaturedArtistAction = async () => {
    setIsLoading(true);
    const result = await addFeaturedArtist(artist.id);
    if ('error' in result) {
      toast.error(result.error);
    } else {
      toast.success(result.data);
    }
    setIsLoading(false);
  }

  const removeFeaturedArtistAction = async () => {
    setIsLoading(true);
    const result = await removeFeaturedArtist(artist.id);
    if ('error' in result) {
      toast.error(result.error);
    } else {
      toast.success(result.data);
    }
    setIsLoading(false);
  }
  if (isLoading) return <NailLoader />
  return (
    <Card
      key={artist.id}
      className="unicorn-card overflow-hidden group hover:scale-[1.02] transition-transform duration-300 rounded-lg shadow-lg"
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {
            role === "admin" && (
              artist.is_featured ? (
                <Star onClick={removeFeaturedArtistAction} className="w-8 h-8 text-yellow-500" />
              ) : (
                <StarOff onClick={addFeaturedArtistAction} className="w-8 h-8 text-yellow-500" />
              )
            )
          }
        </CardTitle>
      </CardHeader>
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
        {role === "admin" ? (
          <>
            <Link href={`/artist/${artist.id}`}>
              <Button className="w-full mt-4 unicorn-button">View</Button>
            </Link>
            <Button className="w-full mt-4 unicorn-button" onClick={deleteArtistByID}>Delete</Button>
          </>
        ) : (
          <Link href={`/artist-profile/${artist.id}`}>
            <Button className="w-full mt-4 unicorn-button">Book Now</Button>
          </Link>
        )}
      </CardContent>
    </Card>
  )
}

export default ArtistCard
