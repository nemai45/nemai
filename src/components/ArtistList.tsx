import { Artist } from '@/lib/type';
import React from 'react'
import ArtistCard from './dashboard/ArtistCard';

interface ArtistListProps {
  artists: Artist[];
}

const ArtistList = ({ artists }: ArtistListProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {artists.map((artist) => (
            <ArtistCard key={artist.id} artist={artist} />
        ))}
    </div>
  )
}

export default ArtistList