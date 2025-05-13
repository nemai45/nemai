"use client"
import { onBoardUser } from '@/action/user'
import { Card, CardContent } from '@/components/ui/card'
import { useUser } from '@/hooks/use-user'
import { PersonalInfo, ProfessionalInfo } from '@/lib/type'
import { useRouter } from 'next/navigation'
import { FC, useEffect, useState } from 'react'
import ProfileCard from './ProfileCard'

interface OnBoardingProps {
  email: string;
}

const OnBoarding:FC<OnBoardingProps> = ({ email }) => {
  const router = useRouter()

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
      <ProfileCard handleSubmit={onBoardUser} personalInfo={personalInfo} professionalInfo={professionalInfo}/>
    </div>
  )
}

export default OnBoarding