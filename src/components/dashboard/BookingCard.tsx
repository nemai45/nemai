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
import { minutesToTime, shouldAllowCancel } from '@/lib/utils';
import { format } from 'date-fns';
import { ChevronDown, ChevronUp, Clock, MapPin, User, Calendar, Phone } from 'lucide-react';
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
  const totalPrice = booking.total_amount;
  const [reason, setReason] = useState("");
  const [isCancel, setIsCancel] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
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
        <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 pt-3 pb-3">
          {/* Service Name & Date */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">{booking.service.name}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{formattedDate}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge
                variant="outline"
                className="bg-primary/10 text-primary dark:bg-primary/20 flex items-center gap-1"
              >
                <Clock className="h-3 w-3" /> {durationText}
              </Badge>
              {(new Date(booking.date) < new Date()) && (
                <Badge variant="outline" className="bg-primary/10 text-primary dark:bg-primary/20">
                  Completed
                </Badge>
              )}
            </div>
          </div>

          {/* Customer Info & Time Row */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-primary" />
                <span className="text-sm font-medium">{booking.name}</span>
              </div>
              {booking.phone_no && (
                <div className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5 text-primary" />
                  <span className="text-sm font-medium">{booking.phone_no}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
              <span className="text-sm font-medium">{formattedTime}</span>
            </div>
          </div>

          {/* Location & Actions Row */}
          <div className="flex justify-between items-center mt-2">
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3 text-primary" />
              <span className="text-sm font-medium">
                {booking.client_address ? booking.client_address : "Artist's location"}
              </span>
            </div>

            {shouldAllowCancel(booking.date, booking.start_time) && (
              <div className="flex items-center gap-2">
                {(role === "customer" && booking.status === "paid") && (
                  <Button disabled={isLoading} variant="destructive" size="sm" onClick={() => setIsCancel(true)}>
                    Cancel Booking
                  </Button>
                )}
                {(role === "customer" && booking.status === "cancel_requested") && (
                  <Badge variant="destructive" className="text-xs font-medium">
                    Cancellation Requested
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="px-4 py-3">
          {/* Pricing Section - Simple Display with Modal Option */}
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">₹{totalPrice.toFixed(2)}</span>
              {(booking.discount > 0 || booking.promo_code_discount > 0 || booking.service_discount > 0) && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-2 text-xs text-green-600 hover:text-green-700"
                  onClick={() => setShowPricing(true)}
                >
                  View breakdown
                </Button>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              Paid: ₹{booking.paid_amount.toFixed(2)}
            </div>
          </div>

          {/* Add-ons Section */}
          {booking.add_on.length > 0 && (
            <div className="border-t pt-3">
              <Collapsible
                open={isOpen}
                onOpenChange={setIsOpen}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Add-ons ({booking.add_on.length})</span>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
                      {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </CollapsibleTrigger>
                </div>

                <CollapsibleContent>
                  <div className="space-y-2 bg-gray-50/50 dark:bg-gray-800/20 rounded-md p-3">
                    {booking.add_on.map((addon) => (
                      <div key={addon.id} className="flex justify-between items-center text-sm">
                        <span className="font-medium">{addon.name} × {addon.count}</span>
                        <span className="font-semibold">₹{(addon.price * addon.count).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Price Breakdown Modal */}
      <Dialog open={showPricing} onOpenChange={setShowPricing}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Price Breakdown</DialogTitle>
            <DialogDescription>
              Detailed pricing for {booking.service.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="font-medium">Service Price</span>
              <span className="font-medium">₹{booking.service.price}</span>
            </div>
            
            {booking.discount > 0 && (
              <div className="flex justify-between items-center py-2 text-red-600">
                <span>Artist Discount</span>
                <span>-₹{booking.discount}</span>
              </div>
            )}
            
            {booking.promo_code_discount > 0 && (
              <div className="flex justify-between items-center py-2 text-red-600">
                <span>Promo Code Discount</span>
                <span>-₹{booking.promo_code_discount}</span>
              </div>
            )}
            
            {booking.service_discount > 0 && (
              <div className="flex justify-between items-center py-2 text-red-600">
                <span>Service Discount</span>
                <span>-₹{booking.service_discount}</span>
              </div>
            )}
            
            {booking.add_on.length > 0 && (
              <>
                <div className="border-t pt-2">
                  <p className="font-medium text-sm text-muted-foreground mb-2">Add-ons</p>
                  {booking.add_on.map((addon) => (
                    <div key={addon.id} className="flex justify-between items-center py-1">
                      <span className="text-sm">{addon.name} × {addon.count}</span>
                      <span className="text-sm font-medium">₹{(addon.price * addon.count).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
            
            <div className="border-t pt-3">
              <div className="flex justify-between items-center py-2 text-lg font-semibold">
                <span>Total Amount</span>
                <span>₹{totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-1 text-sm text-muted-foreground">
                <span>Paid Amount</span>
                <span>₹{booking.paid_amount.toFixed(2)}</span>
              </div>
              {(booking.discount + booking.promo_code_discount + booking.service_discount) > 0 && (
                <div className="flex justify-between items-center py-1 text-sm text-green-600">
                  <span>Total Savings</span>
                  <span>₹{(booking.discount + booking.promo_code_discount + booking.service_discount).toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setShowPricing(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
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
            <Button variant="destructive" onClick={cancelBookingAction}>
              {isLoading ? <NailLoader /> : "Cancel Booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}