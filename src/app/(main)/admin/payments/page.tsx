import AdminPayments from '@/components/admin/AdminPayments'
import { getArtistsDue, getPayments } from '@/lib/user'
import React from 'react'

const page = async () => {
  const result = await getArtistsDue()
  if('error' in result){
    return <div>{result.error}</div>
  }
  const payments = await getPayments()
  if('error' in payments){
    return <div>{payments.error}</div>
  }
  const artists = result.data
  const paymentsData = payments.data
  return (
    <AdminPayments artists={artists} payments={paymentsData} />
  )
}

export default page