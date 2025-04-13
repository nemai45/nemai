"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import BookAppointment from "./BookAppointment"
import BookingsList from "./BookingsList"
import ProfileSettings from "./ProfileSettings"
import { useAuth } from "@/hooks/use-auth"
import { Card } from "@/components/ui/card"

const CustomerDashboard = () => {
  const { profile } = useAuth()
  const [activeTab, setActiveTab] = useState("book")

  return (
    <div className="container mx-auto px-4 space-y-6">
      <div className="flex flex-col m:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {profile?.first_name || "Customer"}! Book appointments and manage your nail care schedule.
          </p>
        </div>
      </div>

      <Tabs defaultValue="book" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:w-auto">
          <TabsTrigger value="book">Book Appointment</TabsTrigger>
          <TabsTrigger value="appointments">My Appointments</TabsTrigger>
          <TabsTrigger value="profile">Profile Settings</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="book" className="space-y-4">
            <BookAppointment />
          </TabsContent>

          <TabsContent value="appointments" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">My Appointments</h2>
              <BookingsList userType="customer" />
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-4">
            <ProfileSettings />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}

export default CustomerDashboard
