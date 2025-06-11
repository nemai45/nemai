import { getAlbumImages, getCoverImages } from '@/lib/user';
import React from 'react'
import { Image } from '@/lib/type';
import AlbumView from '@/components/AlbumView';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import Error from '@/components/Error';
import { getUserRole } from '@/lib/get-user-role';

const page = async ({ params }: { params: Promise<{ albumId: string }> }) => {
    const { albumId } = await params;
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
        console.error(error);
        return <Error error={error.message} />
    }
    if (!user) {
        return redirect("/login");
    }
    const role = await getUserRole();
    let items: Image[];
    let artistId: string;
    if (albumId === "cover-images" && role === "artist") {
        const result = await getCoverImages(user.id);
        if ('error' in result) {
            console.error(result.error);
            return <Error error={result.error} />
        }
        items = result.data;
        artistId = user.id;
    } else {
        const result = await getAlbumImages(albumId);
        if ('error' in result) {
            console.error(result.error);
            return <Error error={result.error} />
        }
        items = result.data.images;
        artistId = result.data.artistId;
    }
    return (
        <AlbumView artistId={artistId} albumId={albumId} items={items} />
    )
}

export default page