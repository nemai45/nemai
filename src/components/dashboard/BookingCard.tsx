import { cancelBooking } from '@/action/user';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useUser } from '@/hooks/use-user';
import type { BookingInfo } from '@/lib/type';
import { minutesToTime } from '@/lib/utils';
import { format } from 'date-fns';
import { ChevronDown, ChevronUp, Clock, MapPin, User } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Input } from '../ui/input';
import NailLoader from '../NailLoader';

interface BookingCardProps {
  booking: BookingInfo;
}

export function BookingCard({ booking }: BookingCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const formattedTime = minutesToTime(booking.start_time);
  const formattedDate = format(new Date(booking.date), 'EEEE, MMMM d, yyyy');
  const addOnTotal = booking.add_on.reduce((sum, addon) => sum + (addon.price * addon.count), 0);
  const totalPrice = booking.service.price + addOnTotal;
  const [reason, setReason] = useState("");
  const [isCancel, setIsCancel] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { role } = useUser();

  const cancelBookingAction = async () => {
    setIsLoading(true);
    if (reason.length === 0) {
      toast.error("Please enter a reason");
      setIsLoading(false);
      return;
    }
    const { error } = await cancelBooking(booking.id, reason);
    if (error) {
      toast.error(error);
    } else {
      toast.success("Booking cancelled successfully");
      setIsCancel(false);
    }
    setIsLoading(false);
  }

  const duration = booking.service.duration;
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;
  const durationText = `${hours > 0 ? `${hours}h ` : ''}${minutes > 0 ? `${minutes}m` : ''}`;
  return (
    <>
      <Card className="w-full gap-2 py-0 overflow-hidden transition-all duration-300 hover:shadow-md">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 pt-3 pb-2">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg">{booking.service.name}</h3>
              <p className="text-sm text-muted-foreground">{formattedDate}</p>
              <div className="flex items-center gap-1 mt-1">
                <User className="h-3.5 w-3.5 text-primary" />
                <span className="text-sm font-medium">{booking.name}</span>
                {booking.phone_no && (
                  <span className="text-sm font-medium">{booking.phone_no}</span>
                )}
              </div>
              {booking.client_address ? (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-primary" />
                  <span className="text-sm font-medium">{booking.client_address}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-primary" />
                  <span className="text-sm font-medium">Artist&apos;s address</span>
                </div>
              )}
            </div>
            <div className="flex flex-col items-end gap-3">
              <Badge
                variant="outline"
                className="bg-primary/10 text-primary dark:bg-primary/20 flex items-center gap-1"
              >
                <Clock className="h-3 w-3" /> {durationText}
              </Badge>
              {
                <>
                  {(role === "customer" && booking.status === "paid") && (
                    <Button disabled={isLoading} variant="destructive" onClick={() => setIsCancel(true)}>
                      Cancel Booking
                    </Button>
                  )}
                  {
                    (role === "customer" && booking.status === "cancel_requested") && (
                      <Badge variant="destructive" className="text-sm font-medium">Cancellation Requested</Badge>
                    )
                  }
                </>
              }
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div className="flex items-center">
              <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
              <span className="text-sm font-medium">{formattedTime}</span>
            </div>

            <div className="text-right">
              <span className="text-lg font-semibold">{totalPrice.toFixed(2)} ₹</span>
              <p className="text-xs text-muted-foreground">Service: {booking.service.price.toFixed(2)} ₹</p>
            </div>
          </div>
          {booking.add_on.length > 0 && (
            <Collapsible
              open={isOpen}
              onOpenChange={setIsOpen}
              className="mt-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Add-ons ({booking.add_on.length})</span>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
                    {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
              </div>

              <CollapsibleContent className="mt-2">
                {booking.add_on.map((addon) => (
                  <div key={addon.id} className="flex justify-between items-center py-2 text-sm">
                    <span>{addon.name} × {addon.count}</span>
                    <span>{addon.price * addon.count} ₹</span>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}
        </CardContent>
      </Card>
      <Dialog open={isCancel} onOpenChange={setIsCancel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Are you sure you want to cancel this booking?
          </DialogDescription>
          <Input type="text" placeholder="Reason" value={reason} onChange={(e) => setReason(e.target.value)} />
          <DialogFooter>
            <Button variant="destructive" onClick={cancelBookingAction}>Cancel Booking</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>

  );
}