"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera } from "lucide-react"
import { Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const ProfileSettings = () => {
  const { toast } = useToast()

  const handleSave = () => {
    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully.",
    })
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="relative">
          <Avatar className="w-24 h-24 border-4 border-background">
            <AvatarImage
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=200"
              alt="Profile"
            />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <Button size="icon" className="absolute bottom-0 right-0 rounded-full h-8 w-8 text-xs bg-primary">
            <Camera className="h-4 w-4" />
          </Button>
        </div>
        <div>
          <h3 className="text-xl font-semibold">Crystal Nguyen</h3>
          <p className="text-muted-foreground">Nail Artist since January 2023</p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Personal Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input id="firstName" defaultValue="Crystal" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input id="lastName" defaultValue="Nguyen" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue="crystal@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" type="tel" defaultValue="(555) 123-4567" />
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Professional Details</h3>
        <div className="space-y-2">
          <Label htmlFor="businessName">Business Name</Label>
          <Input id="businessName" defaultValue="Crystal Magic Nails" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            rows={4}
            defaultValue="I specialize in intricate nail art designs and gel extensions. With 5+ years of experience, I bring your nail vision to life with a focus on quality and creativity."
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="experience">Years of Experience</Label>
            <Input id="experience" type="number" defaultValue="5" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" defaultValue="Downtown" />
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Services & Pricing</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 border border-border rounded-md">
            <div>
              <h4 className="font-medium">Gel Manicure</h4>
              <Input type="number" className="w-24 mt-1" defaultValue="45" />
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex justify-between items-center p-3 border border-border rounded-md">
            <div>
              <h4 className="font-medium">Acrylic Full Set</h4>
              <Input type="number" className="w-24 mt-1" defaultValue="85" />
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex justify-between items-center p-3 border border-border rounded-md">
            <div>
              <h4 className="font-medium">Nail Art (per nail)</h4>
              <Input type="number" className="w-24 mt-1" defaultValue="5" />
            </div>
            <Switch defaultChecked />
          </div>
          <Button variant="outline">
            <Plus className="w-4 h-4 mr-2" /> Add Service
          </Button>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Availability</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="monday">Monday</Label>
              <Switch id="monday" defaultChecked />
            </div>
            <div className="flex space-x-2">
              <Input type="time" defaultValue="09:00" className="w-full" />
              <Input type="time" defaultValue="17:00" className="w-full" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="tuesday">Tuesday</Label>
              <Switch id="tuesday" defaultChecked />
            </div>
            <div className="flex space-x-2">
              <Input type="time" defaultValue="09:00" className="w-full" />
              <Input type="time" defaultValue="17:00" className="w-full" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="wednesday">Wednesday</Label>
              <Switch id="wednesday" defaultChecked />
            </div>
            <div className="flex space-x-2">
              <Input type="time" defaultValue="09:00" className="w-full" />
              <Input type="time" defaultValue="17:00" className="w-full" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="thursday">Thursday</Label>
              <Switch id="thursday" defaultChecked />
            </div>
            <div className="flex space-x-2">
              <Input type="time" defaultValue="09:00" className="w-full" />
              <Input type="time" defaultValue="17:00" className="w-full" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="friday">Friday</Label>
              <Switch id="friday" defaultChecked />
            </div>
            <div className="flex space-x-2">
              <Input type="time" defaultValue="09:00" className="w-full" />
              <Input type="time" defaultValue="17:00" className="w-full" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="saturday">Saturday</Label>
              <Switch id="saturday" defaultChecked />
            </div>
            <div className="flex space-x-2">
              <Input type="time" defaultValue="10:00" className="w-full" />
              <Input type="time" defaultValue="16:00" className="w-full" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="sunday">Sunday</Label>
              <Switch id="sunday" />
            </div>
            <div className="flex space-x-2">
              <Input type="time" defaultValue="10:00" className="w-full" disabled />
              <Input type="time" defaultValue="16:00" className="w-full" disabled />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 flex justify-end space-x-3">
        <Button variant="outline">Cancel</Button>
        <Button className="unicorn-button" onClick={handleSave}>
          Save Changes
        </Button>
      </div>
    </div>
  )
}

export default ProfileSettings
