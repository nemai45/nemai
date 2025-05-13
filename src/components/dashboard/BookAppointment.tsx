"use client"

import { bookService } from "@/action/user"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { addOnBookingSchema, BookedService, bookingSchema, Service, SlotData } from "@/lib/type"
import { useQuery } from "@tanstack/react-query"
import axios, { AxiosError } from "axios"
import { format } from "date-fns"
import { useParams, useRouter } from "next/navigation"
import { useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"

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

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}


const getSelectedDayOfWeek = (selectedDate: Date) => {
  if (!selectedDate) return -1;
  const day = selectedDate.getDay();
  return day === 0 ? 6 : day - 1;
}


const BookAppointment = ({ bookedService, services }: BookAppointmentProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | undefined>(undefined)
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
    if (!slotData || !selectedDate) return [];
    const dayOfWeek = getSelectedDayOfWeek(selectedDate);
    const availableTimeSlots = slotData.availability.filter(slot => slot.day === dayOfWeek);
    const serviceDuration = bookedService.service.duration

    const allTimeOptions = TIME_OPTIONS.filter(time => {
      const slot = availableTimeSlots.find(slot =>
        timeToMinutes(time) >= slot.start_time && timeToMinutes(time) < slot.end_time
      )
      if (!slot) return false
      if (timeToMinutes(time) + serviceDuration > slot.end_time) return false
      return true
    });

    const formattedDate = format(selectedDate, "yyyy-MM-dd");
    const blockedTimesForDay = slotData.blockedDates.filter(date =>
      date.date === formattedDate
    );

    const timeOptions = allTimeOptions.map(time => {
      const startTime = timeToMinutes(time)
      const endTime = startTime + serviceDuration
      const blocked = blockedTimesForDay.find(date =>
        startTime < date.end_time && endTime > date.start_time
      )
      if (blocked) {
        return {
          time,
          count: slotData.maxClients - blocked.no_of_artist
        }
      } else {
        return {
          time,
          count: slotData.maxClients
        }
      }
    });

    const bookedSlots = slotData.bookedSlots.filter(slot => {
      return slot.date === formattedDate
    })

    const finalTimeOptions = timeOptions.filter(option => {
      const conflictSlots = bookedSlots.filter(slot => {
        const slotStartTime = slot.start_time
        const slotEndTime = slotStartTime + bookedService.service.duration
        const serviceStartTime = timeToMinutes(option.time)
        const serviceEndTime = serviceStartTime + serviceDuration
        return slotStartTime < serviceEndTime && slotEndTime > serviceStartTime
      })
      if (option.count - conflictSlots.length > 0) {
        return true
      }
      return false
    })

    return finalTimeOptions;
  }, [slotData, selectedDate, bookedService]);

  if (isLoadingSlotData) return <div>Loading...</div>
  if (isErrorSlotData) return <div>Error loading slot data</div>
  if (!slotData) return <div>No slot data found</div>

  const handleSubmitBooking = async () => {
    const bookingData = {
      service_id: bookedService.service.id,
      start_time: timeToMinutes(selectedTimeSlot!),
      date: format(selectedDate!, "yyyy-MM-dd")
    }
    const addOnData = bookedService.add_on.map(addon => ({
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
                  disabled={!selectedTimeSlot}
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
