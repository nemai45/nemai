"use client"
import { onBoardUser } from '@/action/user'
import { PersonalInfo, ProfessionalInfo } from '@/lib/type'
import { FC, useState } from 'react'
import ProfileCard from './ProfileCard'

interface OnBoardingProps {
  email: string;
  role: string;
}

const OnBoarding:FC<OnBoardingProps> = ({ email, role }) => {
  
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    email: email,
    first_name: '',
    last_name: '',
    phone_no: ''
  })
  const [professionalInfo, setProfessionalInfo] = useState<ProfessionalInfo>({
    business_name: '',
    logo: null,
    bio: '',
    address: '',
    upi_id: '',
    no_of_artists: 0,
    booking_month_limit: 0,
    location: null
  })

  return (
    <div className="flex items-center justify-center w-full h-full p-4">
      <ProfileCard handleSubmit={onBoardUser} personalInfo={personalInfo} professionalInfo={role === 'artist' ? professionalInfo : null}/>
    </div>
  )
}

export default OnBoarding