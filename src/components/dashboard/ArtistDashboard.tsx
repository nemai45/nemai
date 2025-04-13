"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import BookingsList from "./BookingsList"
import IncomeChart from "./IncomeChart"
import ProfileSettings from "./ProfileSettings"
import PortfolioManager from "./PortfolioManager"
import AvailabilityManager from "./AvailabilityManager"
import { useAuth } from "@/hooks/use-auth"

const ArtistDashboard = () => {
  const { profile } = useAuth()
  const [activeTab, setActiveTab] = useState("bookings")

  return (
    <div className="container mx-auto px-4 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Artist Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {profile?.first_name || "Artist"}! Manage your appointments and business.
          </p>
        </div>
      </div>

      <Tabs defaultValue="bookings" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5 lg:w-auto">
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="bookings" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Manage Your Bookings</h2>
              <BookingsList userType="artist" />
            </Card>
          </TabsContent>

          <TabsContent value="income" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Income Overview</h2>
              <IncomeChart />
            </Card>
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Portfolio Manager</h2>
              <PortfolioManager />
            </Card>
          </TabsContent>

          <TabsContent value="availability" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Manage Your Availability</h2>
              <AvailabilityManager />
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

export default ArtistDashboard
