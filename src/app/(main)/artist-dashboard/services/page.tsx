import { getArtistServices } from '@/lib/user'
import ServiceManager from '@/components/dashboard/ServiceManager'
import React from 'react'
import { createClient } from '@/utils/supabase/server';

const page = async () => {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    return null
  }
  if (!user) {
    return null
  }
  const { data, error: servicesError} = await getArtistServices(user.id)
  if(servicesError) {
    return null
  }
  if(!data) {
    return null
  }
  return (
    <ServiceManager services={data} />
  )
}

export default page