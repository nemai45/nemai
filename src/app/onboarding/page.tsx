import OnBoarding from '@/components/OnBoarding'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

const page = async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !user.email) {
    return redirect('/login')
  }
  return (
    <OnBoarding email={user.email}/>
  )
}


export default page