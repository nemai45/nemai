import OnBoarding from '@/components/OnBoarding'
import { getUserRole } from '@/lib/get-user-role'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

const page = async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !user.email) {
    return redirect('/login')
  }
  const role = await getUserRole()
  if (!role) {
    return redirect('/login')
  }
  return (
    <OnBoarding email={user.email} role={role} />
  )
}


export default page