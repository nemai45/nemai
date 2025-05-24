import { deleteAlbum } from "@/action/user";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlbumWithImageCount } from "@/lib/type";
import { MoreVertical, Trash } from "lucide-react";
import Image from "next/image";
import { Button } from "./ui/button";
import { useState } from "react";
import { toast } from "sonner";
import NailLoader from "./NailLoader";

interface AlbumGridProps {
  albums: AlbumWithImageCount[];
  onAlbumClick: (albumId: string) => void;
  isDeletable: boolean;
  logo: string | null;
}

const AlbumGrid = ({ albums, onAlbumClick, isDeletable, logo }: AlbumGridProps) => {
  const [isLoading, setIsLoading] = useState(false);
  if (isLoading) return <NailLoader />
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
      {albums.map((album) => (
        <Card
          key={album.id}
          className="overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-300"
          onClick={() => onAlbumClick(album.id)}
        >
          <CardContent className="p-0">
            <div className="relative aspect-square overflow-hidden">
              <Image
                src={album.cover_image ? `https://ftqdfdhxdtekgjxrlggp.supabase.co/storage/v1/object/public/${album.cover_image}` : logo ? `https://ftqdfdhxdtekgjxrlggp.supabase.co/storage/v1/object/public/${logo}` : "/hero.jpg"}
                width={100}
                height={100}
                alt={album.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {isDeletable && (
                <>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200"></div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 transition-opacity"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Album Options</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={async (e) => {
                        e.stopPropagation();  
                        setIsLoading(true)
                        const { error } = await deleteAlbum(album.id);
                        if (error) {
                          toast.error(error);
                        } else {
                          toast.success("Album deleted successfully!");
                        }
                        setIsLoading(false)
                      }}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </div>
          </CardContent>
          <CardFooter className="p-3 bg-white/90 dark:bg-gray-900/90">
            <div className="w-full">
              <p className="font-medium truncate">{album.name}</p>
              <p className="text-sm text-muted-foreground">
                {album.image_count} {album.image_count === 1 ? "item" : "items"}
              </p>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default AlbumGrid;
