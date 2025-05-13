import AvailabilityManager from '@/components/dashboard/AvailabilityManager'
import { Availability, BlockedDate } from '@/lib/type';
import { getAvailability, getBlockedDates, getMaxClients } from '@/lib/user'
import React from 'react'

const page = async () => {
  const { data, error } = await getAvailability();
  if (error) {
    return <div>{error}</div>;
  }
  if (!data) {
    return <div>No availability found</div>;
  }

  const { data: blockedDatesData, error: blockedDatesError } = await getBlockedDates();
  if (blockedDatesError) {
    return <div>{blockedDatesError}</div>;
  }
  if (!blockedDatesData) {
    return <div>No blocked dates found</div>;
  }

  const { data: maxClients, error: maxClientsError } = await getMaxClients();
  if (maxClientsError) {
    return <div>{maxClientsError}</div>;
  }
  if (!maxClients) {
    return <div>No max clients found</div>;
  }

  const availability: Availability[] = data.map((item) => ({
    id: item.id,
    startTime: minutesToTime(item.start_time),
    endTime: minutesToTime(item.end_time),
    dayOfWeek: item.day,
  }))

  function minutesToTime(minutes: number) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  }

  const blockedDates: BlockedDate[] = blockedDatesData.map((item) => ({
    id: item.id,
    blocked_date: item.date,
    no_of_artists: item.no_of_artist,
    start_time: minutesToTime(item.start_time),
    end_time: minutesToTime(item.end_time),
  }))
  return (
    <AvailabilityManager blockedDates={blockedDates} availability={availability} maxClients={maxClients} />
  )
}

export default page
