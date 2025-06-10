import React from 'react'
import { getArtists } from '@/lib/user'
import ArtistList from '@/components/ArtistList';
import { getUserRole } from '@/lib/get-user-role';
import { redirect } from 'next/navigation';
const page = async () => {
    const result = await getArtists();
    if('error' in result) {
        return <div>{result.error}</div>
    }
    const artists = result.data;
    const role = await getUserRole();
    if (!role) {
        return redirect('/login')
    }
    return (
        <ArtistList artists={artists} role={role} />
    )
}

export default page