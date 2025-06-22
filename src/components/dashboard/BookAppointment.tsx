"use client"

import { bookService, createOrder } from "@/action/user"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { addOnBookingSchema, ArtistProfile, BookedService, bookingSchema, Service, SlotData } from "@/lib/type"
import { timeToMinutes } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import axios, { AxiosError } from "axios"
import { format, isToday } from "date-fns"
import { useParams, useRouter } from "next/navigation"
import { useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import Error from "../Error"
import { Input } from "../ui/input"
import { RadioGroup, RadioGroupItem } from "../ui/radio-group"
import NailLoader from "../NailLoader"
import { Currency } from "lucide-react"
import Razorpay from "razorpay"

interface BookAppointmentProps {
  bookedService: BookedService
  services: Service[]
  profile: ArtistProfile
}

declare global {
  interface Window {
    Razorpay: any
  }
}

const getSlotData = async (id: string, serviceId: string) => {
  const res = await axios.get(`/api/slot/${id}/${serviceId}`)
  return res.data
}

const TIME_OPTIONS = Array.from({ length: 24 * 2 }, (_, i) => {
  const hour = Math.floor(i / 2)
  const minute = (i % 2) * 30
  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
})

const getSelectedDayOfWeek = (selectedDate: Date) => {
  if (!selectedDate) return -1;
  const day = selectedDate.getDay();
  return day === 0 ? 6 : day - 1;
}


const BookAppointment = ({ bookedService, services, profile }: BookAppointmentProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  const [locationType, setLocationType] = useState<"work_from_home" | "client_home">(profile.professional.is_work_from_home ? "work_from_home" : "client_home")
  const [address, setAddress] = useState<string | undefined>(undefined)
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const calculateTotal = () => {
    const basePrice = bookedService.service.price
    const add_on_price = bookedService.add_on.reduce((sum, addon) => {
      return sum + addon.price * addon.count
    }, 0)

    return { price: basePrice + add_on_price, duration: bookedService.service.duration }
  }

  const ref = useRef(calculateTotal())

  const { data: slotData, isLoading: isLoadingSlotData, isError: isErrorSlotData } = useQuery<SlotData, AxiosError>({
    queryKey: ["slotData", id, bookedService.service.id],
    queryFn: () => getSlotData(id, bookedService.service.id!),
  })


  const getStartTimeOptions = useMemo(() => {
    // Return early if no data or date selected
    if (!slotData || !selectedDate) return [];


    const dayOfWeek = getSelectedDayOfWeek(selectedDate);
    const formattedDate = format(selectedDate, "yyyy-MM-dd");
    const isTodayDate = isToday(selectedDate)
    const serviceDuration = bookedService.service.duration;
    const availableTimeSlots = slotData.availability.filter(slot => slot.day === dayOfWeek);

    // Pre-process blocked times for this day
    const blockedTimesForDay = slotData.blockedDates.filter(date =>
      date.date === formattedDate
    );

    // Pre-process bookings for this day
    const bookedSlotsForDay = slotData.bookedSlots.filter(slot =>
      slot.date === formattedDate
    );

    // Create a booking map for quick conflict checks
    // This maps each 30-minute time segment to the number of artists already booked
    const bookingMap = new Map();
    bookedSlotsForDay.forEach(slot => {
      const slotStartMinutes = slot.start_time;
      const slotEndMinutes = slotStartMinutes + slot.duration;

      // Mark each 30-minute segment in this booking as occupied
      for (let minute = slotStartMinutes; minute < slotEndMinutes; minute += 30) {
        bookingMap.set(minute, (bookingMap.get(minute) || 0) + 1);
      }
    });

    // Get all possible time slots
    return TIME_OPTIONS.filter(time => {
      const startMinutes = timeToMinutes(time);
      const endMinutes = startMinutes + serviceDuration;

      if (isTodayDate) {
        const currentTime = new Date().getHours() * 60 + new Date().getMinutes()
        if (startMinutes < currentTime) return false
      }

      // Check if this time is within any available slot for this day
      const slot = availableTimeSlots.find(slot =>
        startMinutes >= slot.start_time &&
        startMinutes < slot.end_time &&
        endMinutes <= slot.end_time
      );

      // If not in any available slot, remove this option
      if (!slot) return false;

      // Check for blocks that overlap with this service time
      const block = blockedTimesForDay.find(date =>
        startMinutes < date.end_time && endMinutes > date.start_time
      );

      // Calculate base availability
      let availableArtists = block
        ? slotData.maxClients - block.no_of_artist
        : slotData.maxClients;

      // Check for booking conflicts
      for (let minute = startMinutes; minute < endMinutes; minute += 30) {
        const bookedArtists = bookingMap.get(minute) || 0;
        availableArtists = Math.min(availableArtists, slotData.maxClients - bookedArtists);
      }

      // Only return times where at least one artist is available
      return availableArtists > 0;
    }).map(time => {
      const startMinutes = timeToMinutes(time);
      const endMinutes = startMinutes + serviceDuration;

      // Find overlapping blocked dates if any
      const block = blockedTimesForDay.find(date =>
        startMinutes < date.end_time && endMinutes > date.start_time
      );

      // Calculate base availability
      let availableArtists = block
        ? slotData.maxClients - block.no_of_artist
        : slotData.maxClients;

      // Account for bookings
      for (let minute = startMinutes; minute < endMinutes; minute += 30) {
        const bookedArtists = bookingMap.get(minute) || 0;
        availableArtists = Math.min(availableArtists, slotData.maxClients - bookedArtists);
      }

      return {
        time,
        count: availableArtists
      };
    });
  }, [slotData, selectedDate, bookedService.service.duration]);

  if (isLoadingSlotData) return <NailLoader />
  if (isErrorSlotData) return <Error />
  if (!slotData) return <div>No slot data found</div>

  const unavailableDays = () => {
    if (!slotData) return []
    const availableDays = slotData.availability.map(slot => slot.day)
    const unavailableDays = Array.from({ length: 7 }, (_, i) => {
      if (availableDays.includes(i)) return undefined
      return (i + 1) % 7
    }).filter(day => day !== undefined)
    return unavailableDays
  }

  const handleSubmitBooking = async () => {
    setLoading(true)
    const bookingData = {
      service_id: bookedService.service.id,
      start_time: timeToMinutes(selectedTimeSlot!),
      date: format(selectedDate!, "yyyy-MM-dd"),
      location_type: locationType,
      address: locationType === "client_home" ? address : null
    }
    const filteredAddOn = bookedService.add_on.filter(addon => addon.count > 0)

    const addOnData = filteredAddOn.map(addon => ({
      add_on_id: addon.id,
      count: addon.count
    }))

    const booking = bookingSchema.safeParse(bookingData)
    const addOnBooking = addOnBookingSchema.safeParse(addOnData)

    if (!booking.success) {
      toast.error(booking.error.message)
      setLoading(false)
      return
    }
    if (!addOnBooking.success) {
      toast.error(addOnBooking.error.message)
      setLoading(false)
      return
    }
    if (!booking.data || !addOnBooking.data) {
      toast.error("Invalid booking data")
      setLoading(false)
      return
    }
    if (locationType === "client_home" && !address) {
      toast.error("Address is required")
      setLoading(false)
      return
    }
    const { data, error } = await createOrder(booking.data, addOnBooking.data)
    if (error) {
      toast.error(error)
      setLoading(false)
      return
    } else {
      if(!data){
        toast.error("Something went wrong")
        setLoading(false)
        return;
      }
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: 1000,
        currency: "INR",
        name: "NéMai",
        image: "/logo.png",
        order_id: data.order_id,
        callback_url: `${window.location.origin}/customer-dashboard/bookings`,
        prefill: {
          name: data.name,
          email: data.email,
          phone: data.phone
        },
        theme: {
          color: "#F37254"
        }
      }
      setLoading(false)
      const rzp = new window.Razorpay(options)
      rzp.open()
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Book an Appointment</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <>
            <div className="space-y-2">
              <div className="text-sm font-medium">Selected Service:</div>
              <div className="text-sm font-medium">{bookedService.service.name}</div>
              <div className="text-sm font-medium">₹{bookedService.service.price}</div>
              <div className="text-sm font-medium">Duration: {bookedService.service.duration} min</div>
              {bookedService.add_on.some((addon) => addon.count > 0) && (
                <div className="mt-2 space-y-2">
                  <div className="text-sm font-medium">Selected Enhancements:</div>
                  <div className="space-y-1">
                    {bookedService.add_on
                      .filter((addon) => addon.count > 0)
                      .map((addon) => (
                        <div key={addon.id} className="flex justify-between text-sm">
                          <span>{addon.name}</span>
                          <span>+₹{addon.price} x {addon.count}</span>
                        </div>
                      ))}
                  </div>
                  <div className="pt-2 border-t flex justify-between font-medium">
                    <span>Total</span>
                    <span>
                      ₹{ref.current.price} • {ref.current.duration} min
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Select a Date</Label>
              <div className="border rounded-md p-4">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                  disabled={[{ before: new Date() }, { after: new Date(new Date().setMonth(new Date().getMonth() + slotData.bookingMonthLimit)) }, { dayOfWeek: unavailableDays() }]}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Select a Time</Label>
              {getStartTimeOptions.map((option) => (
                <Button
                  key={option.time}
                  value={option.time}
                  onClick={() => setSelectedTimeSlot(option.time)}
                  className={`py-2 mx-2 px-4 text-sm text-center rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${selectedTimeSlot === option.time ? "bg-blue-500 text-white" : ""
                    }`}
                >
                  {option.time}
                </Button>
              ))}
            </div>


            {selectedTimeSlot && (
              <>
                <>
                  {
                    profile.professional.is_work_from_home && profile.professional.is_available_at_client_home && (
                      <RadioGroup className="space-y-2" onValueChange={(value) => setLocationType(value as "work_from_home" | "client_home")} value={locationType}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem style={{ height: "20px", width: "20px" }} value="work_from_home">Artist&apos;s Studio</RadioGroupItem>
                          <Label>Artist&apos;s Studio</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem style={{ height: "20px", width: "20px" }} value="client_home">Your Home</RadioGroupItem>
                          <Label>Your Home</Label>
                        </div>
                      </RadioGroup>
                    )
                  }
                  {
                    locationType === "client_home" && (
                      <div className="space-y-2">
                        <Label>Enter your address</Label>
                        <Input type="text" value={address} onChange={(e) => setAddress(e.target.value)} />
                      </div>
                    )
                  }
                </>
                <>
                  <Button
                    className="w-full"
                    onClick={handleSubmitBooking}
                    disabled={!selectedTimeSlot || loading}
                  >
                    Book Appointment
                  </Button>
                </>
              </>
            )}
          </>
        </CardContent>
      </Card>
    </div>
  )
}

export default BookAppointment
