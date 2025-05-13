import { Button } from "@/components/ui/button"
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle
} from "@/components/ui/drawer"
import { Label } from "@/components/ui/label"
import { BookedService, Service } from "@/lib/type"
import { useState } from "react"
import Counter from "./Counter"
import BookAppointment from "./dashboard/BookAppointment"

interface AddOnDrawerProps {
    isDrawerOpen: boolean
    setIsDrawerOpen: (isOpen: boolean) => void
    services: Service[]
    isBooked: boolean
    setIsBooked: (isBooked: boolean) => void
    bookedService: BookedService | null
    setBookedService: (bookedService: BookedService | null) => void
}

const AddOnDrawer = ({ isDrawerOpen, setIsDrawerOpen, services, isBooked, setIsBooked, bookedService, setBookedService }: AddOnDrawerProps) => {
    if (!bookedService) return null
    return (
        <>
            <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                <DrawerContent>
                    <div className="mx-auto w-full max-w-sm">
                        <DrawerHeader>
                            <DrawerTitle>Add-on Services</DrawerTitle>
                            <DrawerDescription>Enhance your appointment with these additional services.</DrawerDescription>
                        </DrawerHeader>
                        <div className="p-4">
                            <div>
                                {bookedService.add_on.map((addon) => (
                                    <div key={addon.id} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Counter count={addon.count} onIncrease={() => {
                                                setBookedService({
                                                    ...bookedService,
                                                    add_on: bookedService.add_on.map((a) => a.id === addon.id ? { ...a, count: a.count + 1 } : a)
                                                })
                                            }} onDecrease={() => {
                                                setBookedService({
                                                    ...bookedService,
                                                    add_on: bookedService.add_on.map((a) => a.id === addon.id ? { ...a, count: a.count - 1 } : a)
                                                })
                                            }} />
                                            <Label htmlFor={`addon-${addon.id}`} className="cursor-pointer">
                                                {addon.name}
                                            </Label>
                                        </div>
                                        <div className="text-sm">
                                            +RS{addon.price}/nail
                                        </div>
                                    </div>
                                ))}
                                <Button className="w-full" onClick={() => {
                                    setIsBooked(true)
                                    setIsDrawerOpen(false)
                                }}>
                                    Book Now
                                </Button>
                            </div>
                        </div>
                    </div>
                </DrawerContent>
            </Drawer>
        </>
    )
}

export default AddOnDrawer