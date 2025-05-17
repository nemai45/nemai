
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, DollarSign } from 'lucide-react';
import { BookedService, Service } from '@/lib/type';
import AddOnDrawer from '../AddOnDrawer';
import { useUser } from '@/hooks/use-user';
import { useRouter } from 'next/navigation';
import Error from '../Error';

interface ServicesListProps {
  services: Service[];
  isDrawerOpen: boolean;
  setIsDrawerOpen: (isOpen: boolean) => void;
  isBooked: boolean;
  setIsBooked: (isBooked: boolean) => void;
  bookedService: BookedService | null;
  setBookedService: (bookedService: BookedService | null) => void;
}

const ServicesList = ({ services, isDrawerOpen, setIsDrawerOpen, isBooked, setIsBooked, bookedService, setBookedService }: ServicesListProps) => {
  const { user, loading, error, role } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);
  if (loading) return <div>Loading...</div>
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
        <Card key={service.id} className="h-full flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{service.name}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                {service.price}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {service.duration} min
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-grow">
            {service.description && (
              <CardDescription className="text-sm">
                {service.description}
              </CardDescription>
            )}
          </CardContent>
          <CardFooter>
            {role === "customer" && (
              <Button variant="outline" className="w-full" onClick={() => {
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
              }}>
                Book Now
              </Button>
            )}
          </CardFooter>
        </Card>
      ))}
      {bookedService && bookedService.add_on.length > 0 &&
        <AddOnDrawer isBooked={isBooked} setIsBooked={setIsBooked} services={services} isDrawerOpen={isDrawerOpen} setIsDrawerOpen={setIsDrawerOpen} bookedService={bookedService} setBookedService={setBookedService} />}
    </div>
  );
};

export default ServicesList;
