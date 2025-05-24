import NailLoader from '@/components/NailLoader'
import React from 'react'

const loading = () => {
  return (
    <div className='flex items-center justify-center h-screen'>
      <NailLoader />
    </div>  
  )
}

export default loading