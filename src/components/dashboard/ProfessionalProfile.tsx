import { Camera } from 'lucide-react'
import { Avatar, AvatarImage } from '../ui/avatar'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { ProfessionalInfo } from '@/lib/type'
import { FC } from 'react'

interface ProfessionalProfileProps {
  professionalInfo: ProfessionalInfo
  setProfessionalInfo: React.Dispatch<React.SetStateAction<ProfessionalInfo>>
}

const ProfessionalProfile:FC<ProfessionalProfileProps> = ({ professionalInfo, setProfessionalInfo}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProfessionalInfo((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Professional Details</h3>
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="relative">
          <Avatar className="w-24 h-24 border-4 border-background">
            <AvatarImage
              src={professionalInfo.logo || ''}
              alt="Profile"
            />
          </Avatar>
          <Button size="icon" className="absolute bottom-0 right-0 rounded-full h-8 w-8 text-xs bg-primary">
            <Camera className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="businessName">Business Name</Label>
        <Input id="businessName" required name='business_name' onChange={handleChange} value={professionalInfo.business_name}/>
      </div>
      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          name='bio'
          onChange={handleChange}
          value={professionalInfo.bio || ''}
          rows={4}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input required name='address' onChange={handleChange} value={professionalInfo.address} id="address" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="upiId">UPI ID</Label>
        <Input required name='upi_id' onChange={handleChange} value={professionalInfo.upi_id} id="upiId" />
      </div>
    </div>
  )
}

export default ProfessionalProfile