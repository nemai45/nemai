"use client"
import { createAlbum } from "@/action/user";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useUser } from "@/hooks/use-user";
import { Album, albumSchema, AlbumWithImageCount } from "@/lib/type";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import AlbumGrid from "../AlbumGrid";
import Error from "../Error";
import NailLoader from "../NailLoader";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";
interface PortfolioManagerProps {
  id?: string;
  role?: string;
  albums: AlbumWithImageCount[];
  coverImageCount: number;
  logo: string | null;
}


const PortfolioManager = ({ id, role, albums, coverImageCount, logo }: PortfolioManagerProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState("");
  const [isAddingNewAlbum, setIsAddingNewAlbum] = useState(false);
  const router = useRouter();

  const albumForm = useForm<Omit<Album, "id">>({
    resolver: zodResolver(albumSchema.omit({ id: true })),
    defaultValues: {
      name: "",
    },
  });

  const { user, loading, error } = useUser();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);
  if (loading) return <div>Loading...</div>
  if (error) return <Error error={error.message} />
  if (!user) return null;

  const albumsData: AlbumWithImageCount[] = [
    {
      name: "Cover Images",
      id: "cover-images",
      cover_image: null,
      image_count: coverImageCount,
      artist_id: user.id
    },
    ...albums
  ];

  const handleCreateAlbum = async (data: Omit<Album, "id">) => {
    setIsLoading(true)
    const { error } = await createAlbum(data.name, id);
    if (error) {
      toast.error(error);
    } else {
      toast.success("Album created successfully!");
    }
    setIsLoading(false)
    setIsAddingNewAlbum(false);
    setNewAlbumName("");
  };

  const handleOpenAlbumView = (albumId: string) => {
    if (role === "admin" && id) {
      router.push(`/artist/${id}/album/${albumId}`);
    } else {
      router.push(`/album/${albumId}`);
    }
  };

  if (isLoading) return <NailLoader />

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Your Portfolio</h1>
        <div className="flex gap-2">
          <Button onClick={() => setIsAddingNewAlbum(true)} variant="outline">
            <Plus className="mr-2 h-4 w-4" /> New Album
          </Button>
        </div>
      </div>

      <AlbumGrid
        albums={albumsData}
        onAlbumClick={handleOpenAlbumView}
        isDeletable={true}
        logo={logo}
        id={id}
      />


      {/* New Album Dialog */}
      <Dialog open={isAddingNewAlbum} onOpenChange={setIsAddingNewAlbum}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Album</DialogTitle>
            <DialogDescription>Organize your nail art into collections.</DialogDescription>
          </DialogHeader>
          <Form {...albumForm}>
            <form onSubmit={albumForm.handleSubmit(handleCreateAlbum)}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <FormField
                    control={albumForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Album Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <DialogFooter className="mt-4">
                <Button type="button" onClick={() => {
                  setIsAddingNewAlbum(false);
                  setNewAlbumName("");
                }} variant="outline">
                  Cancel
                </Button>
                <Button type="submit">
                  Create Album
                </Button>
              </DialogFooter>

            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PortfolioManager;
