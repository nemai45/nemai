"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { addDays } from "date-fns"

// Mock data
const ARTISTS = [
  {
    id: "1",
    profile_id: "1",
    first_name: "Crystal",
    last_name: "Nguyen",
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100&h=100",
    bio: "Specializing in intricate nail art designs and gel extensions.",
    location: "Downtown",
  },
  {
    id: "2",
    profile_id: "2",
    first_name: "Sophia",
    last_name: "Kim",
    avatar_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100&h=100",
    bio: "Expert in minimalist designs and natural nail care.",
    location: "East Village",
  },
  {
    id: "3",
    profile_id: "3",
    first_name: "Maria",
    last_name: "Rodriguez",
    avatar_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=100&h=100",
    bio: "Specializing in 3D nail art and custom designs.",
    location: "West Side",
  },
]

const SERVICES = {
  "1": [
    { id: "1", name: "Gel Manicure", price: 45, duration: 60 },
    { id: "2", name: "Acrylic Full Set", price: 85, duration: 90 },
    { id: "3", name: "Nail Art (per nail)", price: 5, duration: 15 },
  ],
  "2": [
    { id: "4", name: "Natural Manicure", price: 35, duration: 45 },
    { id: "5", name: "Gel Polish", price: 40, duration: 60 },
    { id: "6", name: "Nail Repair", price: 15, duration: 30 },
  ],
  "3": [
    { id: "7", name: "3D Nail Art", price: 65, duration: 75 },
    { id: "8", name: "Chrome Nails", price: 55, duration: 60 },
    { id: "9", name: "French Tips", price: 45, duration: 60 },
  ],
}



const BookAppointment = () => {
  const { toast } = useToast()

  const [artists] = useState(ARTISTS)
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null)
  const [services, setServices] = useState<typeof SERVICES[1]>([])
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([])
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null)
  const [locationType, setLocationType] = useState<"artist_location" | "customer_location">("artist_location")
  const [address, setAddress] = useState("")
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Update services when artist is selected
  useEffect(() => {
    if (selectedArtist && SERVICES[selectedArtist as keyof typeof SERVICES]) {
      setServices(SERVICES[selectedArtist as keyof typeof SERVICES])
    } else {
      setServices([])
    }
    setSelectedService(null)
  }, [selectedArtist])

  // Generate time slots when date and service are selected
  useEffect(() => {
    if (selectedDate && selectedService) {
      // Generate mock time slots
      const slots = []

      // Create time slots at 30-minute intervals from 9 AM to 5 PM
      for (let hour = 9; hour < 17; hour++) {
        for (const minute of [0, 30]) {
          // Skip some slots randomly to simulate unavailability
          if (Math.random() > 0.7) continue

          const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
          slots.push(timeString)
        }
      }

      setAvailableTimeSlots(slots)
    } else {
      setAvailableTimeSlots([])
    }
    setSelectedTimeSlot(null)
  }, [selectedDate, selectedService, services])

  const handleSubmit = async () => {
    if (!selectedArtist || !selectedService || !selectedDate || !selectedTimeSlot) {
      toast({
        title: "Missing information",
        description: "Please fill out all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Appointment booked",
        description: "Your appointment request has been sent to the artist.",
      })

      // Reset form
      setSelectedService(null)
      setSelectedDate(new Date())
      setSelectedTimeSlot(null)
      setLocationType("artist_location")
      setAddress("")
      setNotes("")
      setIsSubmitting(false)
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Book an Appointment</CardTitle>
          <CardDescription>Choose an artist, service, and time for your nail appointment.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="artist">Select an Artist</Label>
            <Select value={selectedArtist || ""} onValueChange={setSelectedArtist}>
              <SelectTrigger id="artist">
                <SelectValue placeholder="Choose an artist" />
              </SelectTrigger>
              <SelectContent>
                {artists.map((artist) => (
                  <SelectItem key={artist.id} value={artist.id}>
                    {artist.first_name} {artist.last_name} {artist.location ? `- ${artist.location}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedArtist && (
            <>
              <div className="space-y-2">
                <Label htmlFor="service">Select a Service</Label>
                <Select value={selectedService || ""} onValueChange={setSelectedService}>
                  <SelectTrigger id="service">
                    <SelectValue placeholder="Choose a service" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name} - ${service.price} ({service.duration} mins)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedService && (
                <>
                  <div className="space-y-2">
                    <Label>Select a Date</Label>
                    <div className="border rounded-md p-4">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        className="rounded-md border"
                        disabled={[
                          {
                            before: new Date(),
                            after: addDays(new Date(), 30), // Only allow bookings 30 days in advance
                          },
                        ]}
                      />
                    </div>
                  </div>

                  {selectedDate && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="time">Select a Time</Label>
                        {availableTimeSlots.length > 0 ? (
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {availableTimeSlots.map((time) => (
                              <Button
                                key={time}
                                variant={selectedTimeSlot === time ? "default" : "outline"}
                                className={selectedTimeSlot === time ? "bg-primary" : ""}
                                onClick={() => setSelectedTimeSlot(time)}
                              >
                                {time}
                              </Button>
                            ))}
                          </div>
                        ) : (
                          <div className="text-muted-foreground">No available time slots for this date.</div>
                        )}
                      </div>

                      {selectedTimeSlot && (
                        <>
                          <div className="space-y-2">
                            <Label>Appointment Location</Label>
                            <RadioGroup
                              value={locationType}
                              onValueChange={(value) =>
                                setLocationType(value as "artist_location" | "customer_location")
                              }
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="artist_location" id="artist_location" />
                                <Label htmlFor="artist_location">Artists&apos;Location</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="customer_location" id="customer_location" />
                                <Label htmlFor="customer_location">My Location (Home Service)</Label>
                              </div>
                            </RadioGroup>
                          </div>

                          {locationType === "customer_location" && (
                            <div className="space-y-2">
                              <Label htmlFor="address">Your Address</Label>
                              <Input
                                id="address"
                                placeholder="Enter your full address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                required={locationType === "customer_location"}
                              />
                            </div>
                          )}

                          <div className="space-y-2">
                            <Label htmlFor="notes">Additional Notes (Optional)</Label>
                            <Textarea
                              id="notes"
                              placeholder="Any special requests or information"
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              rows={3}
                            />
                          </div>

                          <Button onClick={handleSubmit} className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? "Booking..." : "Book Appointment"}
                          </Button>
                        </>
                      )}
                    </>
                  )}
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default BookAppointment
