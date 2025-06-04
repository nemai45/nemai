import OnBoarding from '@/components/OnBoarding'
import { getUserRole } from '@/lib/get-user-role'
import { getAreas, getVerifiedPhone } from '@/lib/user'
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
  const areas = await getAreas();
  if ('error' in areas) {
    console.error(areas.error)
    return redirect('/login')
  }
  const verifiedPhone = await getVerifiedPhone();
  if ('error' in verifiedPhone) {
    console.error(verifiedPhone.error)
    return redirect('/login')
  }

  return (
    <OnBoarding phone={verifiedPhone.data} email={user.email} role={role} areas={areas.data} />
  )
}


export default page