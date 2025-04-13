"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { Clock, X, Plus } from "lucide-react"

// Mock data
const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const TIME_OPTIONS = Array.from({ length: 24 * 4 }, (_, i) => {
  const hour = Math.floor(i / 4)
  const minute = (i % 4) * 15
  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
})

// Update the mockBlockedDates to include time slots
const mockBlockedDates = [
  { id: "1", blocked_date: "2025-04-15", reason: "Personal day", start_time: null, end_time: null },
  { id: "2", blocked_date: "2025-04-20", reason: "Holiday", start_time: null, end_time: null },
  { id: "3", blocked_date: "2025-04-11", reason: "Doctor's appointment", start_time: "13:00", end_time: "15:00" },
]

const mockAvailability = [
  { id: "1", day_of_week: 1, start_time: "09:00", end_time: "17:00" },
  { id: "2", day_of_week: 2, start_time: "09:00", end_time: "17:00" },
  { id: "3", day_of_week: 3, start_time: "09:00", end_time: "17:00" },
  { id: "4", day_of_week: 4, start_time: "09:00", end_time: "17:00" },
  { id: "5", day_of_week: 5, start_time: "09:00", end_time: "17:00" },
]

const AvailabilityManager = () => {
  const { toast } = useToast()

  const [weeklyAvailability, setWeeklyAvailability] = useState(mockAvailability)
  // Update the state to include time slots for blocked dates
  const [blockedDates, setBlockedDates] = useState(mockBlockedDates)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [blockReason, setBlockReason] = useState("")
  const [blockTimeSlot, setBlockTimeSlot] = useState(false)
  const [blockStartTime, setBlockStartTime] = useState("09:00")
  const [blockEndTime, setBlockEndTime] = useState("12:00")

  // New time slot being added
  const [newTimeSlot, setNewTimeSlot] = useState({
    dayOfWeek: 1, // Monday
    startTime: "09:00",
    endTime: "17:00",
  })

  const handleAddTimeSlot = async () => {
    const newSlot = {
      id: `new-${Date.now()}`,
      day_of_week: newTimeSlot.dayOfWeek,
      start_time: newTimeSlot.startTime,
      end_time: newTimeSlot.endTime,
    }

    setWeeklyAvailability([...weeklyAvailability, newSlot])

    toast({
      title: "Success",
      description: "Weekly availability time slot added.",
    })
  }

  const handleRemoveTimeSlot = async (id: string) => {
    setWeeklyAvailability(weeklyAvailability.filter((slot) => slot.id !== id))

    toast({
      title: "Success",
      description: "Time slot removed.",
    })
  }

  // Update the handleBlockDate function to handle time slots
  const handleBlockDate = async () => {
    if (!selectedDate) return

    const formattedDate = format(selectedDate, "yyyy-MM-dd")

    // Check if date is already fully blocked
    const existingFullBlock = blockedDates.find(
      (date) => date.blocked_date === formattedDate && date.start_time === null && date.end_time === null,
    )

    if (existingFullBlock) {
      toast({
        title: "Warning",
        description: "This date is already fully blocked.",
        variant: "destructive",
      })
      return
    }

    // Check if time slot is already blocked
    if (blockTimeSlot) {
      const existingTimeSlotBlock = blockedDates.find(
        (date) =>
          date.blocked_date === formattedDate && date.start_time === blockStartTime && date.end_time === blockEndTime,
      )

      if (existingTimeSlotBlock) {
        toast({
          title: "Warning",
          description: "This time slot is already blocked.",
          variant: "destructive",
        })
        return
      }
    }

    const newBlockedDate = {
      id: `new-${Date.now()}`,
      blocked_date: formattedDate,
      reason: blockReason,
      start_time: blockTimeSlot ? blockStartTime : null,
      end_time: blockTimeSlot ? blockEndTime : null,
    }

    setBlockedDates([...blockedDates, newBlockedDate])
    setSelectedDate(undefined)
    setBlockReason("")
    setBlockTimeSlot(false)

    toast({
      title: "Success",
      description: blockTimeSlot ? "Time slot blocked successfully." : "Date blocked successfully.",
    })
  }

  const handleUnblockDate = async (id: string) => {
    setBlockedDates(blockedDates.filter((date) => date.id !== id))

    toast({
      title: "Success",
      description: "Date unblocked.",
    })
  }

  // Update the isDateBlocked function to handle partial blocks
  const isDateBlocked = (date: Date) => {
    return blockedDates.some(
      (blockedDate) => blockedDate.blocked_date === format(date, "yyyy-MM-dd") && blockedDate.start_time === null,
    )
  }

  // Add a function to check if a date has any blocks (full or partial)
  const hasAnyBlocks = (date: Date) => {
    return blockedDates.some((blockedDate) => blockedDate.blocked_date === format(date, "yyyy-MM-dd"))
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Weekly Availability</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {DAYS_OF_WEEK.map((day, index) => (
              <div key={index} className="space-y-2">
                <div className="font-medium">{day}</div>
                <div className="space-y-2">
                  {weeklyAvailability
                    .filter((slot) => slot.day_of_week === index)
                    .map((slot) => (
                      <div key={slot.id} className="flex items-center justify-between bg-muted/50 p-2 rounded-md">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          <span>
                            {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
                          </span>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveTimeSlot(slot.id)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  {weeklyAvailability.filter((slot) => slot.day_of_week === index).length === 0 && (
                    <div className="text-muted-foreground text-sm">No availability set</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-4">
            <div className="text-lg font-semibold mb-2">Add New Time Slot</div>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="day">Day of Week</Label>
                <Select
                  value={newTimeSlot.dayOfWeek.toString()}
                  onValueChange={(value) =>
                    setNewTimeSlot({
                      ...newTimeSlot,
                      dayOfWeek: Number.parseInt(value),
                    })
                  }
                >
                  <SelectTrigger id="day">
                    <SelectValue placeholder="Select a day" />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS_OF_WEEK.map((day, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-time">Start Time</Label>
                  <Select
                    value={newTimeSlot.startTime}
                    onValueChange={(value) =>
                      setNewTimeSlot({
                        ...newTimeSlot,
                        startTime: value,
                      })
                    }
                  >
                    <SelectTrigger id="start-time">
                      <SelectValue placeholder="Start time" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_OPTIONS.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end-time">End Time</Label>
                  <Select
                    value={newTimeSlot.endTime}
                    onValueChange={(value) =>
                      setNewTimeSlot({
                        ...newTimeSlot,
                        endTime: value,
                      })
                    }
                  >
                    <SelectTrigger id="end-time">
                      <SelectValue placeholder="End time" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_OPTIONS.filter((time) => time > newTimeSlot.startTime).map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={handleAddTimeSlot} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Time Slot
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Blocked Dates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border rounded-md p-4">
            {/* Update the Calendar modifiers */}
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              modifiers={{
                blocked: (date) => isDateBlocked(date),
                partiallyBlocked: (date) => !isDateBlocked(date) && hasAnyBlocks(date),
              }}
              modifiersStyles={{
                blocked: { backgroundColor: "#FFDBDB", color: "#E11D48", opacity: 0.8 },
                partiallyBlocked: { backgroundColor: "#FFF4DB", color: "#D97706", opacity: 0.8 },
              }}
            />
          </div>

          {/* Add UI for time slot blocking option */}
          {selectedDate && (
            <div className="border-t pt-4 space-y-4">
              <div className="flex items-center space-x-2 mb-2">
                <Label htmlFor="block-time-slot" className="flex items-center cursor-pointer">
                  <input
                    id="block-time-slot"
                    type="checkbox"
                    className="mr-2 h-4 w-4"
                    checked={blockTimeSlot}
                    onChange={(e) => setBlockTimeSlot(e.target.checked)}
                  />
                  Block specific time slot instead of entire day
                </Label>
              </div>

              {blockTimeSlot && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="block-start-time">Start Time</Label>
                    <Select value={blockStartTime} onValueChange={setBlockStartTime}>
                      <SelectTrigger id="block-start-time">
                        <SelectValue placeholder="Start time" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_OPTIONS.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="block-end-time">End Time</Label>
                    <Select value={blockEndTime} onValueChange={setBlockEndTime}>
                      <SelectTrigger id="block-end-time">
                        <SelectValue placeholder="End time" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_OPTIONS.filter((time) => time > blockStartTime).map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="block-reason">Reason (optional)</Label>
                <Input
                  id="block-reason"
                  placeholder="Why are you blocking this date?"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                />
              </div>

              <Button
                onClick={handleBlockDate}
                className="w-full"
                disabled={isDateBlocked(selectedDate) && !blockTimeSlot}
              >
                {blockTimeSlot
                  ? `Block time slot on ${format(selectedDate, "MMMM d, yyyy")}`
                  : `Block ${format(selectedDate, "MMMM d, yyyy")}`}
              </Button>
            </div>
          )}

          {/* Update the Currently Blocked Dates section to show time slots */}
          <div className="border-t pt-4">
            <div className="text-lg font-semibold mb-2">Currently Blocked Dates</div>
            {blockedDates.length === 0 ? (
              <p className="text-muted-foreground text-sm">No blocked dates</p>
            ) : (
              <div className="space-y-2">
                {blockedDates.map((date) => (
                  <div key={date.id} className="flex items-center justify-between bg-muted/50 p-2 rounded-md">
                    <div>
                      <div className="font-medium">{format(new Date(date.blocked_date), "MMMM d, yyyy")}</div>
                      {date.start_time && date.end_time && (
                        <div className="text-sm text-amber-600 font-medium">
                          Time: {date.start_time} - {date.end_time}
                        </div>
                      )}
                      {!date.start_time && !date.end_time && (
                        <div className="text-sm text-rose-600 font-medium">Full day block</div>
                      )}
                      {date.reason && <div className="text-muted-foreground text-sm">{date.reason}</div>}
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleUnblockDate(date.id)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AvailabilityManager
