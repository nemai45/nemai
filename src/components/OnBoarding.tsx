"use client"
import { onBoardUser } from '@/action/user'
import { PersonalInfo, ProfessionalInfo } from '@/lib/type'
import { FC, useState } from 'react'
import ProfileCard from './ProfileCard'
interface OnBoardingProps {
  email: string;
  role: string;
  areas: {id: number, name: string}[]
}

const OnBoarding:FC<OnBoardingProps> = ({ email, role, areas }) => {
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
    area: '',
    no_of_artists: 0,
    booking_month_limit: 0,
    location: null,
    is_work_from_home: false,
    is_available_at_client_home: false
  })


  return (
    <div className="flex items-center justify-center w-full h-full p-4">
      <ProfileCard  handleSubmit={onBoardUser} personalInfo={personalInfo} professionalInfo={role === 'artist' ? professionalInfo : null} areas={areas}/>
    </div>
  )
}

export default OnBoarding