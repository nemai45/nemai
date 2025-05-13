
import React, { useMemo } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogTrigger 
} from "@/components/ui/dialog";

interface PortfolioItem {
  id: string;
  title: string | null;
  description: string | null;
  image_url: string;
}

interface AlbumGalleryProps {
  portfolioItems: PortfolioItem[];
}

const AlbumGallery = ({ portfolioItems }: AlbumGalleryProps) => {
  // Group portfolio items by title (as albums)
  const albums = useMemo(() => {
    const albumMap = new Map<string, PortfolioItem[]>();
    
    // Filter out cover images
    const nonCoverItems = portfolioItems.filter(
      item => !item.title?.toLowerCase().includes('cover')
    );
    
    // Group by album title
    nonCoverItems.forEach(item => {
      const albumName = item.title || 'Untitled Album';
      if (!albumMap.has(albumName)) {
        albumMap.set(albumName, []);
      }
      albumMap.get(albumName)?.push(item);
    });
    
    return Array.from(albumMap.entries()).map(([name, items]) => ({
      name,
      items
    }));
  }, [portfolioItems]);
  
  if (albums.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No portfolio items available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {albums.map((album) => (
        <div key={album.name} className="space-y-3">
          <h3 className="text-lg font-medium">{album.name}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {album.items.map((item) => (
              <Dialog key={item.id}>
                <DialogTrigger asChild>
                  <div className="relative aspect-square rounded-md overflow-hidden cursor-pointer hover:opacity-90 transition-opacity">
                    <img 
                      src={item.image_url} 
                      alt={item.description || item.title || "Portfolio image"} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <div className="relative h-full w-full">
                    <img 
                      src={item.image_url} 
                      alt={item.description || item.title || "Portfolio image"} 
                      className="w-full h-auto max-h-[70vh] object-contain"
                    />
                    {item.description && (
                      <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AlbumGallery;
