import { updateUser } from '@/action/user'
import { getAreas, getProfile } from '@/lib/user'
import ProfileCard from './ProfileCard'
import { createClient } from '@/utils/supabase/server';
import { getUserRole } from '@/lib/get-user-role';
import Error from './Error';
import { redirect } from 'next/navigation';

interface ProfileProps {
    id?: string
}

const Profile = async ({ id }: ProfileProps) => {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
        console.error(error)
        return <Error error={error.message} />
    }
    if (!user) {
        redirect('/login')
    }
    const role = await getUserRole();
    if (!role) {
        redirect('/login')
    }
    const result = await getProfile(id ?? user.id, role === "admin" ? "artist" : role);
    if ('error' in result) {
        console.error(result.error)
        return <Error error={result.error} />
    } 

    const area = await getAreas();
    if ('error' in area) {
        console.error(area.error)
        return <Error error={area.error} />
    }
    
    return (
        <div className="flex items-center justify-center w-full h-full p-4">
            <ProfileCard
                areas={area.data}
                handleSubmit={updateUser}
                personalInfo={result.data.personal}
                professionalInfo={result.data.professional}
            />
        </div>
    )
}

export default Profile