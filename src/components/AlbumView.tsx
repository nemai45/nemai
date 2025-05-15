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
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Error from "./Error";
import { useEffect } from "react";

interface AlbumViewProps {
  albumId: string;
  items: ImageType[];
}

const AlbumView = ({
  albumId,
  items,
}: AlbumViewProps) => {
  const router = useRouter();
  const { user, loading, error } = useUser();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);
  if (loading) return <div>Loading...</div>
  if (error) return <Error error={error.message} />
  if (!user) return null;

  const deleteImage = async (imageId: string, fullPath: string) => {
    if (!confirm("Are you sure you want to delete this image?")) {
      return;
    }
    if (albumId === "cover-images") {
      const { error } = await deleteCoverImage(imageId, fullPath);
      if (error) {
        toast.error(error);
      } else {
        toast.success("Image deleted successfully");
      }
    } else {
      const { error } = await deleteAlbumImage(imageId, albumId, fullPath);
      if (error) {
        toast.error(error);
      } else {
        toast.success("Image deleted successfully");
      }
    }
  }
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
        <p className="text-muted-foreground ml-auto">
          {items.length} {items.length === 1 ? "photo" : "photos"}
        </p>
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-1">
          {items.map((item) => (
            <div key={item.id} className="relative group aspect-square overflow-hidden">
              <img
                src={`https://ftqdfdhxdtekgjxrlggp.supabase.co/storage/v1/object/public/${item.url}` || "/placeholder.svg"}
                alt={item.url || "Image"}
                className="w-full h-full object-cover"
                width={100}
                height={100}
              />
              {item.artist_id === user.id && (
                <>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200"></div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>Image Options</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => deleteImage(item.id, item.url)}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </div>
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
