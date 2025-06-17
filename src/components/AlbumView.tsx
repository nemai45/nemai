"use client";
import { deleteAlbumImage, deleteCoverImage } from "@/action/user";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser } from "@/hooks/use-user";
import { Image as ImageType } from "@/lib/type";
import { MoreVertical, Trash } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Error from "./Error";
import ImageAddDialog from "./ImageAddDialog";
import NailLoader from "./NailLoader";
import { CldImage } from "next-cloudinary";

interface AlbumViewProps {
  albumId: string;
  items: ImageType[];
  artistId: string;
}

const AlbumView = ({
  albumId,
  items,
  artistId
}: AlbumViewProps) => {
  const router = useRouter();
  const { user, loading, error, role } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingImage, setIsAddingImage] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);
  if (loading) return <NailLoader />
  if (error) return <Error error={error.message} />
  if (!user) return null;

  const deleteImage = async (imageId: string, fullPath: string) => {
    if (!confirm("Are you sure you want to delete this image?")) {
      return;
    }
    setIsLoading(true)
    if (albumId === "cover-images") {
      const { error } = await deleteCoverImage(imageId, fullPath, artistId);
      if (error) {
        toast.error(error);
      } else {
        toast.success("Image deleted successfully");
      }
    } else {
      const { error } = await deleteAlbumImage(imageId, albumId, fullPath, artistId);
      if (error) {
        toast.error(error);
      } else {
        toast.success("Image deleted successfully");
      }
    }
    setIsLoading(false)
  }

  if (isLoading) return <NailLoader />
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
        <>
          <p className="text-muted-foreground ml-auto">
            {items.length} {items.length === 1 ? "photo" : "photos"}
          </p>
          {
            ((role === "artist" && artistId === user.id) || role === "admin") && (
              <Button onClick={() => setIsAddingImage(true)}>
                Add Image
              </Button>
            )
          }
        </>
      </div>
      {isAddingImage && <ImageAddDialog id={artistId} imageType={albumId === "cover-images" ? "cover" : "portfolio"} isAddingImage={isAddingImage} setIsAddingImage={setIsAddingImage} albumId={albumId} />}


      {items.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
          {items.map((item) => (
            <Link onClick={(e) => e.stopPropagation()} key={item.id} href={`/image/${item.id}`} className="relative overflow-hidden">
              {/* {
                item.url.startsWith("images/") ? (
                  <Image
                    src={`https://ftqdfdhxdtekgjxrlggp.supabase.co/storage/v1/object/public/${item.url}`}
                    alt={item.url || "Image"}
                    className="w-full h-full"
                    width={100}
                    height={100}
                    quality={100}
                  />
                ) : (
                  <CldImage
                    src={item.url}
                    alt={item.url || "Image"}
                    className="w-full h-full"
                    width={100}
                    height={100}
                  />
                )
              } */}
              <img
                src={item.url.startsWith("images/") ? `https://ftqdfdhxdtekgjxrlggp.supabase.co/storage/v1/object/public/${item.url}` : item.url}
                alt={item.url || "Image"}
                className="w-full h-full"
                width={100}
                height={100}
              />
              {((item.artist_id === user.id && role === "artist") || role === "admin") && (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>Image Options</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteImage(item.id, item.url);
                        }}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground mb-4">No photos in this album yet</p>
        </div>
      )}
    </div>
  );
};

export default AlbumView;
