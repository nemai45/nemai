import { updateUser } from '@/action/user'
import { getProfile } from '@/lib/user'
import ProfileCard from './ProfileCard'
import { createClient } from '@/utils/supabase/server';
import { getUserRole } from '@/lib/get-user-role';

const Profile = async () => {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
        return null
    }
    if (!user) {
        return null
    }
    const role = await getUserRole();
    if (!role) {
        return null
    }
    const { profile, error: profileError } = await getProfile(user.id, role);
    if (profileError) {
        console.error(profileError)
        return null
    }
    if (!profile) {
        return null
    }

    return (
        <div className="flex items-center justify-center w-full h-full p-4">
            <ProfileCard
                handleSubmit={updateUser}
                personalInfo={profile.personal}
                professionalInfo={profile.professional}
            />
        </div>
    )
}

export default Profile