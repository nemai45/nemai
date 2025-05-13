"use client"

import { addAvailability, addBlockedDate, deleteAvailability, deleteBlockedDate } from "@/action/user"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { type BlockedDate } from "@/lib/type"
import { Availability } from "@/lib/type"
import { format } from "date-fns"
import { Clock, Plus, X } from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const TIME_OPTIONS = Array.from({ length: 24 * 4 }, (_, i) => {
  const hour = Math.floor(i / 4)
  const minute = (i % 4) * 15
  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
})

interface AvailabilityManagerProps {
  availability: Availability[]
  maxClients: number
  blockedDates: BlockedDate[]
}

const AvailabilityManager = ({
  availability,
  maxClients,
  blockedDates: initialBlockedDates
}: AvailabilityManagerProps) => {
  const [weeklyAvailability, setWeeklyAvailability] = useState<Availability[]>(availability)
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>(initialBlockedDates)
  const [numberOfArtists, setNumberOfArtists] = useState<string>("")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [blockedTimeSlot, setBlockedTimeSlot] = useState({
    startTime: "",
    endTime: ""
  })

  const [newTimeSlot, setNewTimeSlot] = useState({
    dayOfWeek: 0,
    startTime: "",
    endTime: "",
  })

  const handleAddTimeSlot = async () => {
    const { dayOfWeek, startTime, endTime } = newTimeSlot

    if (!startTime || !endTime) {
      toast.error("Both start and end time must be selected.")
      return
    }

    if (startTime >= endTime) {
      toast.error("Start time must be before end time.")
      return
    }

    const overlap = weeklyAvailability.some(
      (slot) =>
        slot.dayOfWeek === dayOfWeek &&
        !(
          endTime <= slot.startTime ||
          startTime >= slot.endTime
        )
    )

    if (overlap) {
      toast.error("This time slot overlaps with an existing one.")
      return
    }
    const newId = crypto.randomUUID()
    setWeeklyAvailability([...weeklyAvailability, {
      ...newTimeSlot,
      id: newId
    }])
    setNewTimeSlot({
      dayOfWeek: dayOfWeek,
      startTime: endTime,
      endTime: ""
    })

    const { data, error } = await addAvailability(newTimeSlot)
    if (error) {
      toast.error(error)
      setNewTimeSlot({
        dayOfWeek: dayOfWeek,
        startTime: startTime,
        endTime: endTime
      })
      setWeeklyAvailability(weeklyAvailability.filter((slot) => slot.id !== newId))
      return
    }
    if (data) {
      setWeeklyAvailability((prev) => prev.map((slot) => slot.id === newId ? { ...slot, id: data } : slot))
    }
  }

  const handleRemoveTimeSlot = async (id: string) => {
    setWeeklyAvailability(weeklyAvailability.filter((slot) => slot.id !== id))
    const { error } = await deleteAvailability(id)
    if (error) {
      toast.error(error)
      const removedSlot = availability.find(slot => slot.id === id)
      if (removedSlot) {
        setWeeklyAvailability(prev => [...prev, removedSlot])
      }
      return
    }
  }

  const getSelectedDayOfWeek = () => {
    if (!selectedDate) return -1;
    const day = selectedDate.getDay();
    return day === 0 ? 6 : day - 1;
  }

  const getAvailableTimeSlots = () => {
    const dayOfWeek = getSelectedDayOfWeek();
    return weeklyAvailability.filter(slot => slot.dayOfWeek === dayOfWeek);
  }

  const availableTimeSlots = useMemo(() => {
    return getAvailableTimeSlots();
  }, [weeklyAvailability, selectedDate]);
  
  const getBlockStartTimeOptions = useMemo(() => {
    if (availableTimeSlots.length === 0) return [];

    const allTimeOptions = TIME_OPTIONS.filter(time => {
      return availableTimeSlots.some(slot =>
        time >= slot.startTime && time < slot.endTime
      );
    });

    if (selectedDate) {
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      const blockedTimesForDay = blockedDates.filter(date =>
        date.blocked_date === formattedDate
      );

      return allTimeOptions.filter(time => {
        return !blockedTimesForDay.some(blockedDate =>
          blockedDate.start_time && blockedDate.end_time &&
          time >= blockedDate.start_time && time < blockedDate.end_time
        );
      });
    }
    return allTimeOptions;
  }, [availableTimeSlots, selectedDate, blockedDates]);

  const getBlockEndTimeOptions = useMemo(() => {
    if (!blockedTimeSlot.startTime || availableTimeSlots.length === 0 || !selectedDate) return [];

    const relevantSlots = availableTimeSlots.filter(slot =>
      blockedTimeSlot.startTime >= slot.startTime &&
      blockedTimeSlot.startTime < slot.endTime
    );

    if (relevantSlots.length === 0) return [];

    const latestEnd = relevantSlots.reduce((latest, slot) =>
      slot.endTime > latest ? slot.endTime : latest
      , "00:00");
    
    const formattedDate = format(selectedDate, "yyyy-MM-dd");

    const blockedTimesForDay = blockedDates.filter(date =>
      date.blocked_date === formattedDate
    );

    const earliestBlockedStartTime = blockedTimesForDay.reduce((earliest, slot) =>
      slot.start_time < earliest ? slot.start_time : earliest
    , "23:59");

    const latestEndTime = latestEnd < earliestBlockedStartTime ? latestEnd : earliestBlockedStartTime

    return TIME_OPTIONS.filter(time =>
      time > blockedTimeSlot.startTime && time <= latestEndTime
    );
  }, [blockedTimeSlot.startTime, availableTimeSlots, selectedDate, blockedDates]);

  const handleBlockDate = async () => {
    if (!selectedDate) {
      toast.error("Please select a date to block.")
      return
    }

    const { startTime, endTime } = blockedTimeSlot
    if (!startTime || !endTime) {
      toast.error("Please select both start and end times for blocking.")
      return
    }

    if (startTime >= endTime) {
      toast.error("Start time must be before end time.")
      return
    }

    if (!numberOfArtists) {
      toast.error("Please select the number of artists.")
      return
    }

    const formattedDate = format(selectedDate, "yyyy-MM-dd")

    const existingBlock = blockedDates.find((date) =>
      date.blocked_date === formattedDate &&
      ((date.start_time && date.end_time) ?
        !(endTime <= date.start_time || startTime >= date.end_time) :
        true)
    )

    if (existingBlock) {
      toast.error("This date and time range is already blocked.")
      return
    }

    const dayOfWeek = getSelectedDayOfWeek();
    const isWithinWorkingHours = weeklyAvailability.some(slot =>
      slot.dayOfWeek === dayOfWeek &&
      startTime >= slot.startTime &&
      endTime <= slot.endTime
    );

    if (!isWithinWorkingHours) {
      toast.error("Selected time is outside working hours for this day.")
      return
    }

    const newBlockedDate: Omit<BlockedDate, "id"> = {
      blocked_date: formattedDate,
      start_time: startTime,
      end_time: endTime,
      no_of_artists: parseInt(numberOfArtists)
    }

    const newId = crypto.randomUUID()
    const tempBlockedDate = { ...newBlockedDate, id: newId }

    setBlockedDates([...blockedDates, tempBlockedDate])
    setBlockedTimeSlot({ startTime: "", endTime: "" })
    setNumberOfArtists("")

    const { data, error } = await addBlockedDate(newBlockedDate)

    if (error) {
      toast.error(error)
      setBlockedDates(blockedDates.filter(date => date.id !== newId))
      return
    }

    if (data) {
      setBlockedDates(prev => prev.map(date => date.id === newId ? { ...date, id: data } : date))
    }

    toast.success("Date blocked successfully.")

  }

  const handleUnblockDate = async (id: string) => {
    setBlockedDates(blockedDates.filter((date) => date.id !== id))
    const { error } = await deleteBlockedDate(id)

    if (error) {
      toast.error(error)
      const removedBlock = blockedDates.find(date => date.id === id)
      if (removedBlock) {
        setBlockedDates(prev => [...prev, removedBlock])
      }
      return
    }

    toast.success("Date unblocked successfully.")
  }

  const isDateBlocked = (date: Date) => {
    const formattedDate = format(date, "yyyy-MM-dd")
    if (formattedDate < format(new Date(), "yyyy-MM-dd")) {
      return true
    }
    return blockedDates.some((blockedDate) => blockedDate.blocked_date === formattedDate)
  }

  const isAvailableDate = (date: Date) => {
    const formattedDate = format(date, "yyyy-MM-dd")
    return formattedDate < format(new Date(), "yyyy-MM-dd")
  }

  const selectedDateHasAvailability = () => {
    const dayOfWeek = getSelectedDayOfWeek();
    return weeklyAvailability.some(slot => slot.dayOfWeek === dayOfWeek);
  };

  const getEndTimeOptions = (startTime: string, dayOfWeek: number) => {
    if (!startTime) return []

    const timeSlots = weeklyAvailability.filter(
      (slot) => slot.dayOfWeek === dayOfWeek
    );

    const sortedSlots = timeSlots
      .map((slot) => slot.startTime)
      .sort();

    const nextSlot = sortedSlots.find((time) => time > startTime);

    return TIME_OPTIONS.filter((time) => {
      if (nextSlot) {
        return time > startTime && time <= nextSlot;
      }
      return time > startTime;
    });
  };

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
                    .filter((slot) => slot.dayOfWeek === index)
                    .map((slot) => (
                      <div key={slot.id} className="flex items-center justify-between bg-muted/50 p-2 rounded-md">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          <span>
                            {slot.startTime.substring(0, 5)} - {slot.endTime.substring(0, 5)}
                          </span>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveTimeSlot(slot.id || "")}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  {weeklyAvailability.filter((slot) => slot.dayOfWeek === index).length === 0 && (
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
                      startTime: "",
                      endTime: ""
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
                        endTime: ""
                      })
                    }
                  >
                    <SelectTrigger id="start-time">
                      <SelectValue placeholder="Start time" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_OPTIONS.filter((time) => {
                        const timeSlots = weeklyAvailability.filter(
                          (slot) => slot.dayOfWeek === newTimeSlot.dayOfWeek
                        );
                        return timeSlots.every(
                          (slot) => time < slot.startTime || time >= slot.endTime
                        );
                      }).map((time) => (
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
                    disabled={!newTimeSlot.startTime}
                  >
                    <SelectTrigger id="end-time">
                      <SelectValue placeholder="End time" />
                    </SelectTrigger>
                    <SelectContent>
                      {getEndTimeOptions(newTimeSlot.startTime, newTimeSlot.dayOfWeek).map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={handleAddTimeSlot}
                className="w-full"
                disabled={!newTimeSlot.startTime || !newTimeSlot.endTime}
              >
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
          <div className="space-y-2">
            <Label htmlFor="block-date">Select Date</Label>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => isAvailableDate(date)}
              className="p-3 pointer-events-auto"
            />
          </div>

          {selectedDate && !selectedDateHasAvailability() && (
            <div className="text-amber-500 text-sm">
              No working hours available for this day. Please set weekly availability first.
            </div>
          )}

          {selectedDate && selectedDateHasAvailability() && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="block-start-time">Start Time</Label>
                  <Select
                    value={blockedTimeSlot.startTime}
                    onValueChange={(value) =>
                      setBlockedTimeSlot({
                        ...blockedTimeSlot,
                        startTime: value,
                        endTime: ""
                      })
                    }
                  >
                    <SelectTrigger id="block-start-time">
                      <SelectValue placeholder="Start time" />
                    </SelectTrigger>
                    <SelectContent>
                      {getBlockStartTimeOptions.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="block-end-time">End Time</Label>
                  <Select
                    value={blockedTimeSlot.endTime}
                    onValueChange={(value) =>
                      setBlockedTimeSlot({
                        ...blockedTimeSlot,
                        endTime: value,
                      })
                    }
                    disabled={!blockedTimeSlot.startTime}
                  >
                    <SelectTrigger id="block-end-time">
                      <SelectValue placeholder="End time" />
                    </SelectTrigger>
                    <SelectContent>
                      {getBlockEndTimeOptions.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="no-of-artists">Number of Artists</Label>
                <Select
                  value={numberOfArtists}
                  onValueChange={setNumberOfArtists}
                >
                  <SelectTrigger id="no-of-artists">
                    <SelectValue placeholder="No of Artists" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: maxClients }, (_, i) => (
                      <SelectItem key={i} value={(i + 1).toString()}>
                        {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <Button
            onClick={handleBlockDate}
            className="w-full"
            disabled={!selectedDate || !blockedTimeSlot.startTime || !blockedTimeSlot.endTime || !numberOfArtists}
          >
            Block Date
          </Button>

          <div className="mt-4">
            {blockedDates.length === 0 ? (
              <div className="text-muted-foreground text-sm">No blocked dates</div>
            ) : (
              <ul className="space-y-2">
                {blockedDates.map((blockedDate) => (
                  <li
                    key={blockedDate.id}
                    className="flex justify-between items-center bg-muted/50 p-2 rounded-md"
                  >
                    <div>
                      <div className="font-medium">{format(blockedDate.blocked_date, "dd-MM-yyyy")}</div>
                      {blockedDate.start_time && blockedDate.end_time && (
                        <div className="text-sm text-muted-foreground">
                          {blockedDate.start_time.substring(0, 5)} - {blockedDate.end_time.substring(0, 5)}
                          {blockedDate.no_of_artists && (
                            <span className="ml-2">({blockedDate.no_of_artists} artists)</span>
                          )}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleUnblockDate(blockedDate.id || "")}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AvailabilityManager
