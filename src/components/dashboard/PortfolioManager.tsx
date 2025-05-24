"use client"
import { addAlbumImage, addCoverImage, createAlbum } from "@/action/user";
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
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUser } from "@/hooks/use-user";
import { Album, albumSchema, AlbumWithImageCount } from "@/lib/type";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImageIcon, ImagePlus, Plus, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import AlbumGrid from "../AlbumGrid";
import Error from "../Error";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import ImageCropperModal from "../ImageCropperModal";
import NailLoader from "../NailLoader";
import Image from "next/image";
interface PortfolioManagerProps {
  albums: AlbumWithImageCount[];
  coverImageCount: number;
  logo: string | null;
}


const PortfolioManager = ({ albums, coverImageCount, logo }: PortfolioManagerProps) => {
  const [isAddingImage, setIsAddingImage] = useState(false);
  const [name, setName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isCoverImage, setIsCoverImage] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingAlbum, setIsAddingAlbum] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState("");
  const [isAddingNewAlbum, setIsAddingNewAlbum] = useState(false);
  const [isCropping, setIsCropping] = useState(false);
  const [croppingImageSrc, setCroppingImageSrc] = useState<string | null>(null);
  const [croppingType, setCroppingType] = useState<"cover" | "portfolio" | null>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setCroppingImageSrc(previewUrl);
      setCroppingType(isCoverImage ? "cover" : "portfolio");
      setIsCropping(true);
    }
  };


  const handleCropConfirm = (file: File) => {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setIsCropping(false);
    setCroppingImageSrc(null);
    setCroppingType(null);
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setName("")
    setIsCoverImage(false);
    setSelectedAlbum("");
    setUploadProgress(0);
  };

  const uploadImage = async () => {
    if (!selectedFile) return;
    if (!isCoverImage && !selectedAlbum) {
      toast.error("Please select an album");
      return;
    }
    setIsUploading(true);
    if (isCoverImage) {
      const { error } = await addCoverImage(selectedFile);
      if (error) {
        toast.error(error);
      } else {
        toast.success("Cover image uploaded successfully!");
      }
    } else {
      const { error } = await addAlbumImage(selectedFile, selectedAlbum);
      if (error) {
        toast.error(error);
      } else {
        toast.success("Album image uploaded successfully!");
      }
    }
    setIsUploading(false);
    setIsAddingImage(false);
  };

  const handleCreateAlbum = async (data: Omit<Album, "id">) => {
    setIsLoading(true)
    const { error } = await createAlbum(data.name);
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
    router.push(`/album/${albumId}`);
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
          <Button onClick={() => setIsAddingImage(true)}>
            <ImagePlus className="mr-2 h-4 w-4" /> Add Image
          </Button>
        </div>
      </div>

      <AlbumGrid
        albums={albumsData}
        onAlbumClick={handleOpenAlbumView}
        isDeletable={true}
        logo={logo}
      />

      <Dialog open={isAddingImage} onOpenChange={setIsAddingImage}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add to Your Portfolio</DialogTitle>
            <DialogDescription>Upload an image to showcase your nail art skills.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {!previewUrl ? (
              <div
                className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-muted transition-colors"
                onClick={() => document.getElementById("image-upload")?.click()}
              >
                <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Click to upload an image, or drag and drop</p>
                <p className="text-xs text-muted-foreground mt-1">JPEG, PNG or WebP (max. 5MB)</p>
                <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </div>
            ) : (
              <div className="relative overflow-hidden rounded-md">
                <Image
                  src={previewUrl || "/placeholder.svg"}
                  alt="Preview"
                  className="w-full h-full"
                  width={100}
                  height={100}
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 z-10"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                  }}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>

            )}

            <div className="space-y-2">
              <Label>Type</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={!isCoverImage ? "default" : "outline"}
                  onClick={() => {
                    setIsCoverImage(false)
                    if (isCoverImage) {
                      setPreviewUrl(null)
                      setSelectedFile(null)
                    }
                  }}
                  className="flex-1"
                >
                  Album Image
                </Button>
                <Button
                  type="button"
                  variant={isCoverImage ? "default" : "outline"}
                  onClick={() => {
                    setIsCoverImage(true)
                    if (!isCoverImage) {
                      setPreviewUrl(null)
                      setSelectedFile(null)
                    }
                  }}
                  className="flex-1"
                >
                  Cover Image
                </Button>
              </div>
            </div>


            {!isCoverImage && (
              <div className="space-y-2">
                <Label>Album</Label>
                <div className="flex gap-2">
                  <Select disabled={isAddingAlbum} value={selectedAlbum} onValueChange={setSelectedAlbum}>
                    <SelectTrigger className="flex-grow">
                      <SelectValue placeholder="Select an album or create new" />
                    </SelectTrigger>
                    <SelectContent>
                      {albums.map((album) => (
                        <SelectItem key={album.id} value={album.id!}>
                          {album.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {isUploading && (
              <div className="w-full bg-muted rounded-full h-2.5">
                <div className="bg-primary h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => {
              setIsAddingImage(false);
              resetForm();
            }} variant="outline" disabled={isUploading}>
              Cancel
            </Button>
            <Button onClick={uploadImage} disabled={!selectedFile || isUploading}>
              {isUploading ? (
                <>
                  <div className="h-4 w-4 border-2 border-background border-t-transparent rounded-full animate-spin mr-2"></div>
                  Uploading...
                </>
              ) : (
                "Upload"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
      <ImageCropperModal
        isOpen={isCropping}
        onClose={() => {
          setIsCropping(false);
          setCroppingImageSrc(null);
          setCroppingType(null);
        }}
        imageSrc={croppingImageSrc}
        onCropConfirm={handleCropConfirm}
        cropType={croppingType ?? undefined}
      />
    </div>
  );
};

export default PortfolioManager;
