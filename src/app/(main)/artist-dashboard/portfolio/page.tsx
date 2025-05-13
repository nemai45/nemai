import PortfolioManager from '@/components/dashboard/PortfolioManager'
import { getUserRole } from '@/lib/get-user-role';
import { AlbumWithImageCount } from '@/lib/type';
import { getAlbums } from '@/lib/user'
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import React from 'react'

const page = async () => {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error(error);
  }
  if (!user) {
    return redirect("/login");
  }
  const role = await getUserRole();
  if (!role) {
    return redirect("/login");
  }
  if (role !== "artist") {
    return redirect("/login");
  }
  const { data: albums, error: albumsError, coverImageCount } = await getAlbums(user.id);
  if (albumsError) {
    console.error(albumsError);
  }
  if (!albums) {
    return <div>No albums found</div>;
  } 

  const albumsWithImageCount: AlbumWithImageCount[] = albums.map((album) => ({
    id: album.album_id,
    name: album.album_name,
    image_count: album.image_count,
    cover_image: album.cover_image,
  }));

  return (
    <PortfolioManager albums={albumsWithImageCount} coverImageCount={coverImageCount} />
  )
}

export default page