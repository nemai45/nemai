import PortfolioManager from '@/components/dashboard/PortfolioManager'
import { getUserRole } from '@/lib/get-user-role';
import { AlbumWithImageCount } from '@/lib/type';
import { getAlbums, getArtistLogo } from '@/lib/user'
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import React from 'react'
import Error from '@/components/Error';

const page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    return <Error error={error.message} />
  }
  if (!user) {
    return redirect("/login");
  }
  const role = await getUserRole();
  if (!role) {
    return redirect("/login");
  }
  if (role !== "admin") {
    return redirect("/login");
  }
  const result = await getAlbums(id);
  if ('error' in result) {
    return <Error error={result.error} />
  }

  const logoResult = await getArtistLogo(id);
  if ('error' in logoResult) {
    return <Error error={logoResult.error} />
  }
  const logo = logoResult.data;
  return (
    <PortfolioManager id={id} role={role} albums={result.data.albums} coverImageCount={result.data.coverImageCount} logo={logo} />
  )
}

export default page