import { addAlbumImage, addCoverImage } from '@/action/user';
import { ImageIcon, Trash } from 'lucide-react';
import Image from 'next/image';
import React, { FC, useState } from 'react';
import { toast } from 'sonner';
import ImageCropperModal from './ImageCropperModal';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';

interface ImageAddDialogProps {
    isAddingImage: boolean;
    setIsAddingImage: (isAddingImage: boolean) => void;
    albumId: string;
    isCoverImage: boolean;
}
const ImageAddDialog: FC<ImageAddDialogProps> = ({ isAddingImage, setIsAddingImage, albumId, isCoverImage }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [croppingImageSrc, setCroppingImageSrc] = useState<string | null>(null);
    const [croppingType, setCroppingType] = useState<"cover" | "portfolio" | null>(null);
    const [isCropping, setIsCropping] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setCroppingImageSrc(previewUrl);
            setCroppingType(isCoverImage ? "cover" : "portfolio");
            setIsCropping(true);
        }
    };

    const uploadImage = async () => {
        if (!selectedFile) return;
        if (!isCoverImage && !albumId) {
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
            const { error } = await addAlbumImage(selectedFile, albumId);
            if (error) {
                toast.error(error);
            } else {
                toast.success("Album image uploaded successfully!");
            }
        }
        setIsUploading(false);
        setIsAddingImage(false);
    };
    return (
        <>
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
        </>
    )
}

export default ImageAddDialog