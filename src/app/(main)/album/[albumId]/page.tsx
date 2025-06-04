import { getAlbumImages, getCoverImages } from '@/lib/user';
import React from 'react'
import { Image } from '@/lib/type';
import AlbumView from '@/components/AlbumView';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import Error from '@/components/Error';

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
    let items: Image[];
    if (albumId === "cover-images") {
        const result = await getCoverImages(user.id);
        if ('error' in result) {
            console.error(result.error);
            return <Error error={result.error} />
        }
        items = result.data;
    } else {
        const result = await getAlbumImages(albumId, user.id);
        if ('error' in result) {
            console.error(result.error);
            return <Error error={result.error} />
        }
        items = result.data;
    }
    return (
        <AlbumView albumId={albumId} items={items} />
    )
}

export default page