"use client"
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from '@/hooks/use-user';
import { BookedService, Service } from '@/lib/type';
import { getDiscountedPrice } from '@/lib/utils';
import { Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import AddOnDrawer from '../AddOnDrawer';
import Error from '../Error';
import NailLoader from '../NailLoader';


interface ServicesListProps {
  services: Service[];
  isDrawerOpen: boolean;
  setIsDrawerOpen: (isOpen: boolean) => void;
  isBooked: boolean;
  setIsBooked: (isBooked: boolean) => void;
  bookedService: BookedService | null;
  setBookedService: (bookedService: BookedService | null) => void;
  discount: number | null ;
}

const ServicesList = ({ services, isDrawerOpen, setIsDrawerOpen, isBooked, setIsBooked, bookedService, setBookedService, discount }: ServicesListProps) => {
  const { user, loading, error, role } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  if (loading) return <NailLoader />
  if (error) return <Error error={error.message} />
  if (!user) return null;

  if (!services || services.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No services available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((service, index) => (
        <Card key={service.id} className="h-full flex flex-col gap-2 relative overflow-hidden group hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle className="text-lg font-semibold text-gray-800 group-hover:text-purple-700 transition-colors">
              {service.name}
            </CardTitle>
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg z-10">
              {discount ? (
                <div className="flex items-center gap-2">
                  <span className="line-through">₹{service.price}</span>
                  <span>₹{getDiscountedPrice(service.price, discount, service.discount)}</span>
                </div>
              ) : (
                <span>₹{service.price}</span>
              )}
            </div>
          </CardHeader>

          <CardContent className="flex-grow pb-4">
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="outline" className="flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200">
                <Clock className="h-3 w-3" />
                {service.duration} min
              </Badge>
            </div>
            {service.description && (
              <CardDescription className="text-sm text-gray-600 leading-relaxed">
                {service.description}
              </CardDescription>
            )}
          </CardContent>

          <CardFooter className="pt-0">
            {role === "customer" && (
              <Button
                className="w-full text-white font-medium py-2 transition-all duration-300 transform hover:scale-105"
                onClick={() => {
                  setBookedService({
                    service: service,
                    add_on: service.add_on.map((addon) => ({
                      ...addon,
                      count: 0
                    }))
                  })
                  if (service.add_on.length > 0) {
                    setIsDrawerOpen(true)
                  } else {
                    setIsBooked(true)
                  }
                }}
              >
                Book Now
              </Button>
            )}
          </CardFooter>
        </Card>
      ))}
      {bookedService && bookedService.add_on.length > 0 &&
        <AddOnDrawer discount={discount} isBooked={isBooked} setIsBooked={setIsBooked} services={services} isDrawerOpen={isDrawerOpen} setIsDrawerOpen={setIsDrawerOpen} bookedService={bookedService} setBookedService={setBookedService} />}
    </div>
  );
};

export default ServicesList;