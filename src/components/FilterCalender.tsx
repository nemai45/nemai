'use client'
import { BookingInfo } from '@/lib/type';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useState } from 'react';
import BookingList from './dashboard/BookingsList';
import { Button } from './ui/button';
import { Calendar } from './ui/calendar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';

interface FilterCalenderProps {
    bookings: BookingInfo[];
}

const FilterCalender = ({ bookings }: FilterCalenderProps) => {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [isOpen, setIsOpen] = useState(false);

    const filteredBookings = selectedDate
        ? bookings.filter(booking => booking.date === format(selectedDate, 'yyyy-MM-dd'))
        : bookings;

    const clearDateFilter = () => {
        setSelectedDate(undefined);
    };

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold mb-4">Your Bookings</h2>
                    <div className="bg-card mx-auto w-sm flex justify-center rounded-lg shadow p-4 mb-6">
                        <div className="flex gap-2 flex-col items-center">
                            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                                <CollapsibleTrigger asChild>
                                    <Button variant="outline" className="w-full justify-between">
                                        <span>Filter by Date</span>
                                        <CalendarIcon className="ml-auto h-4 w-4" />
                                    </Button>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <Calendar
                                        mode="single"
                                        selected={selectedDate}
                                        onSelect={setSelectedDate}
                                        disabled={(date) => {
                                            const today = new Date();
                                            return format(date, 'yyyy-MM-dd') < format(today, 'yyyy-MM-dd');
                                        }}
                                        className="rounded-md border mt-2 bg-white p-3 pointer-events-auto"
                                        initialFocus
                                    />
                                    {selectedDate && (
                                        <p className="text-sm text-muted-foreground mt-2">
                                            Showing bookings for: {format(selectedDate, 'MMMM d, yyyy')}
                                        </p>
                                    )}

                                </CollapsibleContent>
                            </Collapsible>
                        </div>
                    </div>
                </div>
                <BookingList bookings={filteredBookings} />
            </div>
        </div>
    );
}

export default FilterCalender