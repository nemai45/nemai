import { getArtistServices } from '@/lib/user'
import ServiceManager from '@/components/dashboard/ServiceManager'
import React from 'react'
import { createClient } from '@/utils/supabase/server';
import Error from '@/components/Error';

const page = async () => {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    return <Error error={error.message} />
  }
  if (!user) {
    return <Error error="User not found" />
  }
  const result = await getArtistServices(user.id)
  if('error' in result) {
    return <Error error={result.error} />
  }

  return (
    <ServiceManager services={result.data} />
  )
}

export default page