"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Check, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

interface BookingProps {
  userType: "artist" | "customer"
}

interface Booking {
  id: string
  appointment_date: string
  start_time: string
  end_time: string
  location_type: string
  address: string | null
  status: string
  service: {
    name: string
    price: number
  }
  customer: {
    first_name: string
    last_name: string
    avatar_url: string | null
  }
  artist: {
    first_name: string
    last_name: string
    avatar_url: string | null
  }
}

// Mock data
const MOCK_BOOKINGS: Booking[] = [
  {
    id: "1",
    appointment_date: "2025-04-15",
    start_time: "10:00",
    end_time: "11:00",
    location_type: "artist_location",
    address: null,
    status: "pending",
    service: {
      name: "Gel Manicure",
      price: 45,
    },
    customer: {
      first_name: "Sarah",
      last_name: "Johnson",
      avatar_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100&h=100",
    },
    artist: {
      first_name: "Crystal",
      last_name: "Nguyen",
      avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100&h=100",
    },
  },
  {
    id: "2",
    appointment_date: "2025-04-16",
    start_time: "14:00",
    end_time: "15:30",
    location_type: "customer_location",
    address: "123 Main St, Apt 4B",
    status: "confirmed",
    service: {
      name: "Acrylic Full Set",
      price: 85,
    },
    customer: {
      first_name: "Michael",
      last_name: "Chen",
      avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100&h=100",
    },
    artist: {
      first_name: "Crystal",
      last_name: "Nguyen",
      avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100&h=100",
    },
  },
  {
    id: "3",
    appointment_date: "2025-04-18",
    start_time: "11:00",
    end_time: "12:00",
    location_type: "artist_location",
    address: null,
    status: "completed",
    service: {
      name: "Nail Art",
      price: 65,
    },
    customer: {
      first_name: "Jessica",
      last_name: "Martinez",
      avatar_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=100&h=100",
    },
    artist: {
      first_name: "Sophia",
      last_name: "Kim",
      avatar_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100&h=100",
    },
  },
]

const BookingsList = ({ userType }: BookingProps) => {
  const { toast } = useToast()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setBookings(MOCK_BOOKINGS)
      setLoading(false)
    }, 1000)
  }, [])

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    // Simulate API call
    setTimeout(() => {
      setBookings(bookings.map((booking) => (booking.id === bookingId ? { ...booking, status: newStatus } : booking)))

      toast({
        title: "Success",
        description: `Booking ${newStatus} successfully.`,
      })
    }, 500)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-amber-100 text-amber-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return <div className="text-center py-10">Loading bookings...</div>
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <p>No bookings found.</p>
        <p className="mt-2">
          {userType === "customer"
            ? "Book a nail appointment to see your bookings here."
            : "When customers book appointments with you, they will appear here."}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <div
          key={booking.id}
          className="border border-border rounded-lg p-4 flex flex-col sm:flex-row justify-between gap-4"
        >
          <div className="flex items-start gap-4">
            <Avatar className="w-12 h-12">
              <AvatarImage
                src={userType === "artist" ? booking.customer.avatar_url || "" : booking.artist.avatar_url || ""}
                alt={
                  userType === "artist"
                    ? `${booking.customer.first_name} ${booking.customer.last_name}`
                    : `${booking.artist.first_name} ${booking.artist.last_name}`
                }
              />
              <AvatarFallback>
                {userType === "artist"
                  ? `${booking.customer.first_name?.[0] || ""}${booking.customer.last_name?.[0] || ""}`
                  : `${booking.artist.first_name?.[0] || ""}${booking.artist.last_name?.[0] || ""}`}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold">
                  {userType === "artist"
                    ? `${booking.customer.first_name || ""} ${booking.customer.last_name || ""}`
                    : `${booking.artist.first_name || ""} ${booking.artist.last_name || ""}`}
                </h3>
                <Badge className={getStatusColor(booking.status)}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </Badge>
              </div>
              <p className="text-muted-foreground mb-2">{booking.service?.name}</p>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {format(new Date(booking.appointment_date), "MMMM d, yyyy")}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {booking.start_time?.substring(0, 5)} - {booking.end_time?.substring(0, 5)}
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {booking.location_type === "artist_location" ? "Artist Location" : "Customer Location"}
                </div>
              </div>
              {booking.address && <p className="text-sm mt-1">{booking.address}</p>}
            </div>
          </div>
          <div className="flex flex-col sm:items-end justify-between">
            <div className="text-lg font-semibold mb-auto">${booking.service?.price?.toFixed(2)}</div>
            {userType === "artist" && booking.status === "pending" && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="bg-green-500 hover:bg-green-600"
                  onClick={() => handleStatusChange(booking.id, "confirmed")}
                >
                  <Check className="w-4 h-4 mr-1" /> Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-500 border-red-500 hover:bg-red-50"
                  onClick={() => handleStatusChange(booking.id, "cancelled")}
                >
                  <X className="w-4 h-4 mr-1" /> Decline
                </Button>
              </div>
            )}
            {userType === "customer" && booking.status === "pending" && (
              <Button
                size="sm"
                variant="outline"
                className="text-red-500 border-red-500 hover:bg-red-50"
                onClick={() => handleStatusChange(booking.id, "cancelled")}
              >
                Cancel Request
              </Button>
            )}
            {booking.status === "confirmed" && userType === "artist" && (
              <Button size="sm" onClick={() => handleStatusChange(booking.id, "completed")}>
                Mark Complete
              </Button>
            )}
            {booking.status === "confirmed" && userType === "customer" && (
              <Button
                size="sm"
                variant="outline"
                className="text-red-500 border-red-500 hover:bg-red-50"
                onClick={() => handleStatusChange(booking.id, "cancelled")}
              >
                Cancel Appointment
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default BookingsList
