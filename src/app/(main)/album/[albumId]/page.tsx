import { getAlbumImages, getCoverImages } from '@/lib/user';
import React from 'react'
import { Image } from '@/lib/type';
import AlbumView from '@/components/AlbumView';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

const page = async ({ params }: { params: Promise<{ albumId: string }> }) => {
    const { albumId } = await params;
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
        console.error(error);
    }
    if (!user) {
        return redirect("/login");
    }
    let items: Image[];
    if (albumId === "cover-images") {
        const { data, error } = await getCoverImages(user.id);
        if (error) {
            console.error(error);
        }
        if (!data) {
            return <div>No data found</div>;
        }
        items = data;
    } else {
        const { data, error } = await getAlbumImages(albumId);
        if (error) {
            console.error(error);
        }
        if (!data) {
            return <div>No data found</div>;
        }
        items = data;
    }
    return (
        <AlbumView albumId={albumId} items={items} />
    )
}

export default page