import AdminPayments from '@/components/admin/AdminPayments'
import ArtistPayment from '@/components/ArtistPayment'
import { getArtistDue, getArtistPayments, getArtistsDue, getPayments } from '@/lib/user'
import { createClient } from '@/utils/supabase/server'
import React from 'react'

const page = async () => {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  if(!data || !data.user){
    return <div>User not found</div>
  }
  const artistId = data.user.id
  const payments = await getArtistPayments(artistId)  
  if('error' in payments){
    return <div>{payments.error}</div>
  }
  const pendingAmount = await getArtistDue(artistId)
  if('error' in pendingAmount){
    return <div>{pendingAmount.error}</div>
  }
  const paymentsData = payments.data
  return (
    <ArtistPayment pendingAmount={pendingAmount.data} payments={paymentsData} />
  )
}

export default page