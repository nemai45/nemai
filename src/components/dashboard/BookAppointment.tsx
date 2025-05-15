"use client"

import { bookService } from "@/action/user"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { addOnBookingSchema, BookedService, bookingSchema, Service, SlotData } from "@/lib/type"
import { timeToMinutes } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import axios, { AxiosError } from "axios"
import { format } from "date-fns"
import { useParams, useRouter } from "next/navigation"
import { useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import Error from "../Error"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { date } from "zod"

interface BookAppointmentProps {
  bookedService: BookedService
  services: Service[]
}

const getSlotData = async (id: string, serviceId: string) => {
  const res = await axios.get(`/api/slot/${id}/${serviceId}`)
  return res.data
}

const TIME_OPTIONS = Array.from({ length: 24 * 4 }, (_, i) => {
  const hour = Math.floor(i / 4)
  const minute = (i % 4) * 15
  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
})

const getSelectedDayOfWeek = (selectedDate: Date) => {
  if (!selectedDate) return -1;
  const day = selectedDate.getDay();
  return day === 0 ? 6 : day - 1;
}

const BookAppointment = ({ bookedService, services }: BookAppointmentProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(false)
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
    // This maps each 15-minute time segment to the number of artists already booked
    const bookingMap = new Map();
    bookedSlotsForDay.forEach(slot => {
      const slotStartMinutes = slot.start_time;
      const slotEndMinutes = slotStartMinutes + slot.duration;

      // Mark each 15-minute segment in this booking as occupied
      for (let minute = slotStartMinutes; minute < slotEndMinutes; minute += 15) {
        bookingMap.set(minute, (bookingMap.get(minute) || 0) + 1);
      }
    });

    // Get all possible time slots
    return TIME_OPTIONS.filter(time => {
      const startMinutes = timeToMinutes(time);
      const endMinutes = startMinutes + serviceDuration;

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
      for (let minute = startMinutes; minute < endMinutes; minute += 15) {
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
      for (let minute = startMinutes; minute < endMinutes; minute += 15) {
        const bookedArtists = bookingMap.get(minute) || 0;
        availableArtists = Math.min(availableArtists, slotData.maxClients - bookedArtists);
      }

      return {
        time,
        count: availableArtists
      };
    });
  }, [slotData, selectedDate, bookedService.service.duration]);

  if (isLoadingSlotData) return <div>Loading...</div>
  if (isErrorSlotData) return <Error />
  if (!slotData) return <div>No slot data found</div> 

  const handleSubmitBooking = async () => {
    setLoading(true)
    const bookingData = {
      service_id: bookedService.service.id,
      start_time: timeToMinutes(selectedTimeSlot!),
      date: format(selectedDate!, "yyyy-MM-dd")
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
      return
    }
    if (!addOnBooking.success) {
      toast.error(addOnBooking.error.message)
      return
    }
    if (!booking.data || !addOnBooking.data) {
      toast.error("Invalid booking data")
      return
    }
    const { error } = await bookService(booking.data, addOnBooking.data)
    if (error) {
      toast.error(error)
    } else {
      toast.success("Booking successful")
      router.push(`/customer-dashboard/bookings`)
    }
    setLoading(false)
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
                  disabled={[{ before: new Date() }, { after: new Date(new Date().setMonth(new Date().getMonth() + slotData.bookingMonthLimit)) }]}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Select a Time</Label>
              <Select
                value={selectedTimeSlot}
                onValueChange={(value) =>
                  setSelectedTimeSlot(value)
                }
              >
                <SelectTrigger id="start-time">
                  <SelectValue placeholder="Start time" />
                </SelectTrigger>
                <SelectContent>
                  {getStartTimeOptions.map((option) => (
                    <SelectItem key={option.time} value={option.time}>
                      {option.time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location Type */}
            {selectedTimeSlot && (
              // <>
              //   <div className="space-y-2">
              //     <Label>Appointment Location</Label>
              //     <RadioGroup
              //       value={locationType}
              //       onValueChange={(value) => setLocationType(value as "artist_location" | "customer_location")}
              //     >
              //       <div className="flex items-center space-x-2">
              //         <RadioGroupItem value="artist_location" id="artist_location" />
              //         <Label htmlFor="artist_location">Artist&abpos;s Location</Label>
              //       </div>
              //       <div className="flex items-center space-x-2">
              //         <RadioGroupItem value="customer_location" id="customer_location" />
              //         <Label htmlFor="customer_location">My Location (Home Service)</Label>
              //       </div>
              //     </RadioGroup>
              //   </div>

              //   {locationType === "customer_location" && (
              //     <div className="space-y-2">
              //       <Label htmlFor="address">Your Address</Label>
              //       <Input
              //         id="address"
              //         placeholder="Enter your full address"
              //         value={address}
              //         onChange={(e) => setAddress(e.target.value)}
              //         required={locationType === "customer_location"}
              //       />
              //     </div>
              //   )}

              //   {/* Notes */}
              //   <div className="space-y-2">
              //     <Label htmlFor="notes">Additional Notes (Optional)</Label>
              //     <Textarea
              //       id="notes"
              //       placeholder="Any special requests or information"
              //       value={notes}
              //       onChange={(e) => setNotes(e.target.value)}
              //       rows={3}
              //     />
              //   </div>

              //   {/* Submit Button */}
              //   <Button
              //     className="w-full"
              //     onClick={handleSubmitBooking}
              //     disabled={!selectedTimeSlot || (locationType === "customer_location" && !address)}
              //   >
              //     Book Appointment
              //   </Button>
              // </>
              <>
                <Button
                  className="w-full"
                  onClick={handleSubmitBooking}
                  disabled={!selectedTimeSlot || loading}
                >
                  Book Appointment
                </Button>
              </>

            )}
          </>

        </CardContent>
      </Card>
    </div>
  )
}

export default BookAppointment
