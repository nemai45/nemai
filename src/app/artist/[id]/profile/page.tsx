import Profile from '@/components/Profile'
import React from 'react'

const page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  return (
    <Profile id={id} />
  )
}

export default page