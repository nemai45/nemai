import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PersonalInfo } from "@/lib/type"
import { FC } from "react"

interface PersonalProfileProps {
  personalInfo: PersonalInfo,
  setPersonalInfo: React.Dispatch<React.SetStateAction<PersonalInfo>>
}

const PersonalProfile: FC<PersonalProfileProps> = ({ personalInfo, setPersonalInfo }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPersonalInfo((prev) => ({
      ...prev,
      [name]: value
    }))
  }
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Personal Information</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input required id="firstName" name="first_name" value={personalInfo.first_name} onChange={handleChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input required id="lastName" name="last_name" value={personalInfo.last_name} onChange={handleChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" readOnly value={personalInfo.email} type="email" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input required id="phone" name="phone_no" value={personalInfo.phone_no} onChange={handleChange} type="tel" />
        </div>
      </div>
    </div>
  )
}

export default PersonalProfile
