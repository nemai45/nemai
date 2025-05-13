"use client"
import { onBoardUser } from '@/action/user'
import { Card, CardContent } from '@/components/ui/card'
import { useUser } from '@/hooks/use-user'
import { PersonalInfo, ProfessionalInfo } from '@/lib/type'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import ProfileCard from './ProfileCard'

const OnBoarding = () => {
  const router = useRouter()
  const { user, role, error, loading } = useUser()
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    email: user?.email || '',
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

  useEffect(() => {
    if (user) {
      setPersonalInfo((prev) => ({
        ...prev,
        email: user.email || ''
      }))
    }
  }, [user?.email, user])

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full p-4">
        <Card className='w-full max-w-2xl'>
          <CardContent className='flex items-center justify-center'>
            <p className='text-lg font-semibold'>Loading...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
    router.push('/login')
    return null
  }
  if (error) {
    console.error(error)
    router.push('/login')
    return null
  }

  return (
    <div className="flex items-center justify-center w-full h-full p-4">
      <ProfileCard handleSubmit={onBoardUser} personalInfo={personalInfo} professionalInfo={professionalInfo}/>
    </div>
  )
}

export default OnBoarding