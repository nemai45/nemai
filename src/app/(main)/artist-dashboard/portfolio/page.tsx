import PortfolioManager from '@/components/dashboard/PortfolioManager'
import { getUserRole } from '@/lib/get-user-role';
import { AlbumWithImageCount } from '@/lib/type';
import { getAlbums } from '@/lib/user'
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import React from 'react'
import Error from '@/components/Error';

const page = async () => {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    return <Error error={error.message} />
  }
  if (!user) {
    return redirect("/login");
  }
  const role = await getUserRole();
  console.log(role);
  if (!role) {
    return redirect("/login");
  }
  if (role !== "artist") {
    return redirect("/login");
  }
  const result = await getAlbums(user.id);
  if ('error' in result) {
    return <Error error={result.error} />
  }
  console.log(result.data);

  return (
    <PortfolioManager albums={result.data.albums} coverImageCount={result.data.coverImageCount} />
  )
}

export default page