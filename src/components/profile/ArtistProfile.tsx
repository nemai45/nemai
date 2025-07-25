"use client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { ArtistProfile as ArtistProfileType, BookedService } from "@/lib/type"
import Autoplay from 'embla-carousel-autoplay'
import { MapPin, MapPinned } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import AlbumGrid from "../AlbumGrid"
import BookAppointment from "../dashboard/BookAppointment"
import ServicesList from "./ServicesList"

interface ArtistProfileProps {
  artistProfile: ArtistProfileType
}

const ArtistProfile = ({ artistProfile }: ArtistProfileProps) => {
  const router = useRouter()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isBooked, setIsBooked] = useState(false)
  const [bookedService, setBookedService] = useState<BookedService | null>(null)
  
  return (
    <>
      {!isBooked && <div className="container mx-auto px-4 space-y-6">
        {/* Cover Image Carousel */}
        {artistProfile.cover_images.length > 0 && (
          <Carousel
            plugins={[Autoplay({
              delay: 5000,
            })]}
            className="w-full">
            <CarouselContent>
              {artistProfile.cover_images.map((item) => (
                <CarouselItem key={item.id}>
                  <div className="relative aspect-[2.5/1] rounded-xl overflow-hidden">
                    <img
                      src={item.url.startsWith("images/") ? `https://ftqdfdhxdtekgjxrlggp.supabase.co/storage/v1/object/public/${item.url}` : item.url || "/placeholder.svg"}
                      alt={"Cover image"}
                      className="w-full h-full"
                      width={100}
                      height={100}
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>
        )}

        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/4 flex flex-col items-center">
                <Avatar className="h-32 w-32 border-4 border-background">
                  <AvatarImage src={`https://ftqdfdhxdtekgjxrlggp.supabase.co/storage/v1/object/public/${artistProfile.professional.logo}` || "/placeholder.svg"} alt={artistProfile.personal.first_name + " " + artistProfile.personal.last_name} />
                  <AvatarFallback className="text-2xl">{artistProfile.personal.first_name.charAt(0) + artistProfile.personal.last_name.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>

              <div className="md:w-3/4">
                <h1 className="text-3xl font-bold mb-2">{artistProfile.professional.business_name}</h1>

                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {artistProfile.professional.address && (
                    <div className="flex items-center justify-between w-full text-muted-foreground">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{artistProfile.professional.address}</span>
                      </div>
                      {artistProfile.professional.location && (
                        <a href={artistProfile.professional.location} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600">
                          <MapPinned className="h-8 w-8 ml-1" />
                        </a>
                      )}
                    </div>
                  )}

                  {/* {artistProfile.average_rating > 0 && (
                  <div className="flex items-center text-amber-500">
                    <Star className="h-4 w-4 mr-1 fill-amber-500" />
                    <span>{artistProfile.average_rating.toFixed(1)}</span>
                  </div>
                )} */}
                </div>

                {artistProfile.professional.bio && <p className="text-muted-foreground mb-4">{artistProfile.professional.bio}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Services Offered</CardTitle>
          </CardHeader>
          <CardContent>
            <ServicesList discount={artistProfile.professional.discount} isBooked={isBooked} setIsBooked={setIsBooked} isDrawerOpen={isDrawerOpen} setIsDrawerOpen={setIsDrawerOpen} services={artistProfile.services} bookedService={bookedService} setBookedService={setBookedService} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Portfolio</CardTitle>
          </CardHeader>
          <CardContent>
            <AlbumGrid albums={artistProfile.albums} onAlbumClick={(albumId) => {
              router.push(`/album/${albumId}`)
            }} isDeletable={false} logo={artistProfile.professional.logo} />
          </CardContent>
        </Card>
      </div>}
      {isBooked && bookedService && <BookAppointment profile={artistProfile} bookedService={bookedService} services={artistProfile.services} />}
    </>
  )
}

export default ArtistProfile
