import { ImageIcon, Trash } from 'lucide-react';
import React, { FC, useState, useEffect } from 'react';
import { toast } from 'sonner';
import ImageCropperModal from './ImageCropperModal';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import imageCompression from 'browser-image-compression';
import { addCoverImage, addAlbumImage } from '@/action/user'; // Added logo action

interface ImageAddDialogProps {
    isAddingImage: boolean;
    setIsAddingImage: (isAddingImage: boolean) => void;
    albumId: string; 
    imageType: "cover" | "portfolio"; 
    id: string;
}

const PREVIEW_DIMENSIONS = {
    cover: { width: 300, height: 120 }, // 2.5:1 ratio
    portfolio: { width: 200, height: 250 }, // 4:5 ratio  
};

const ImageAddDialog: FC<ImageAddDialogProps> = ({ 
    isAddingImage, 
    setIsAddingImage, 
    albumId, 
    imageType,
    id 
}) => {
    const [isUploading, setIsUploading] = useState(false);
    const [croppingImageSrc, setCroppingImageSrc] = useState<string | null>(null);
    const [isCropping, setIsCropping] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isCompressing, setIsCompressing] = useState(false);

    const getPreviewContainerClass = () => {
        const dimensions = PREVIEW_DIMENSIONS[imageType];
        return `relative overflow-hidden rounded-lg bg-gray-100 mx-auto`;
    };

    const getPreviewStyle = () => {
        const dimensions = PREVIEW_DIMENSIONS[imageType];
        return {
            width: `${dimensions.width}px`,
            height: `${dimensions.height}px`,
        };
    };

    const handleCropConfirm = (file: File) => {
        setSelectedFile(file);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        const newPreviewUrl = URL.createObjectURL(file);
        setPreviewUrl(newPreviewUrl);
        setIsCropping(false);
        if (croppingImageSrc) {
            URL.revokeObjectURL(croppingImageSrc);
        }
        setCroppingImageSrc(null);
    };

    const resetForm = () => {
        if (selectedFile) {
            setSelectedFile(null);
        }
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
        if (croppingImageSrc) {
            URL.revokeObjectURL(croppingImageSrc);
            setCroppingImageSrc(null);
        }
        setIsCropping(false);
    };

    // Cleanup URLs on unmount
    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
            if (croppingImageSrc) {
                URL.revokeObjectURL(croppingImageSrc);
            }
        };
    }, []);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Reset input to allow same file selection
        e.target.value = '';

        // Validate file type
        const validImageTypes = [
            'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 
            'image/heic', 'image/heif', 'image/tiff', 'image/bmp',
            'image/svg+xml', 'image/gif'
        ];
        
        if (!validImageTypes.includes(file.type) && !file.name.toLowerCase().match(/\.(jpe?g|png|webp|heic|heif|tiff?|bmp|svg|gif)$/)) {
            toast.error("Please select a valid image file.");
            return;
        }

        if (file.size > 20 * 1024 * 1024) {
            toast.error("File size must be less than 20MB.");
            return;
        }

        try {
            setIsCompressing(true);
            
            // For HEIC/HEIF files, skip compression and let Cloudinary handle conversion
            if (file.type === 'image/heic' || file.type === 'image/heif' || 
                file.name.toLowerCase().match(/\.(heic|heif)$/)) {
                const previewUrl = URL.createObjectURL(file);
                setCroppingImageSrc(previewUrl);
                setIsCropping(true);
                return;
            }
            
            // Enhanced compression options for better quality
            const shouldCompress = file.size > 1024 * 1024; // Only compress if > 1MB
            
            if (!shouldCompress) {
                const previewUrl = URL.createObjectURL(file);
                setCroppingImageSrc(previewUrl);
                setIsCropping(true);
                return;
            }
            
            const options = {
                maxSizeMB: 5,
                maxWidthOrHeight: 2048,
                useWebWorker: true,
                fileType: file.type as 'image/jpeg' | 'image/png' | 'image/webp',
                initialQuality: 0.9,
                alwaysKeepResolution: true,
                preserveExif: true,
            };
            
            const compressedFile = await imageCompression(file, options);
            const previewUrl = URL.createObjectURL(compressedFile);
            
            setCroppingImageSrc(previewUrl);
            setIsCropping(true);
            
        } catch (error) {
            console.error('Compression error:', error);
            // If compression fails, try with original file
            const previewUrl = URL.createObjectURL(file);
            setCroppingImageSrc(previewUrl);
            setIsCropping(true);
            toast.error("Image processing had issues, using original file.");
        } finally {
            setIsCompressing(false);
        }
    };

    const uploadImage = async () => {
        if (!selectedFile) {
            toast.error("Please select an image first.");
            return;
        }
        
        if (imageType === 'portfolio' && !albumId) {
            toast.error("Please select an album.");
            return;
        }

        setIsUploading(true);
        
        try {
            let result;
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
            
            // Set folder based on image type
            const folderMap = {
                cover: 'cover-images',
                portfolio: 'portfolio-images',
            };
            
            formData.append('folder', folderMap[imageType]);                    
            
            switch (imageType) {
                case 'cover':
                    result = await addCoverImage(formData, id);
                    break;
                case 'portfolio':
                    result = await addAlbumImage(formData, albumId!, id);
                    break;
                default:
                    throw new Error('Invalid image type');
            }
            
            if (result.error) {
                toast.error(result.error);
                return;
            }
            
            const successMessages = {
                cover: "Cover image uploaded successfully!",
                portfolio: "Portfolio image uploaded successfully!",
            };
            
            toast.success(successMessages[imageType]);
            
            setIsAddingImage(false);
            resetForm();
            
        } catch (error) {
            console.error('Upload error:', error);
            toast.error("Upload failed. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDialogClose = (open: boolean) => {
        if (!open && !isUploading && !isCompressing) {
            setIsAddingImage(false);
            resetForm();
        }
    };

    // Get dialog content based on image type
    const getDialogContent = () => {
        const titles = {
            cover: "Add Cover Image",
            portfolio: "Add to Portfolio", 
        };
        
        const descriptions = {
            cover: "Upload a high-quality cover image for your profile.",
            portfolio: "Upload an image to showcase your nail art skills.",
        };
        
        return {
            title: titles[imageType],
            description: descriptions[imageType]
        };
    };

    const dialogContent = getDialogContent();

    return (
        <>
            <Dialog open={isAddingImage} onOpenChange={handleDialogClose}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{dialogContent.title}</DialogTitle>
                        <DialogDescription>{dialogContent.description}</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {!previewUrl ? (
                            <div
                                className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors ${
                                    isCompressing ? 'pointer-events-none opacity-50' : ''
                                }`}
                                onClick={() => !isCompressing && document.getElementById("image-upload")?.click()}
                            >
                                {isCompressing ? (
                                    <>
                                        <div className="h-10 w-10 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
                                        <p className="text-sm text-muted-foreground">Processing image...</p>
                                    </>
                                ) : (
                                    <>
                                        <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
                                        <p className="text-sm text-muted-foreground text-center">
                                            Click to upload an image, or drag and drop
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            All image formats supported (max. 20MB)
                                        </p>
                                    </>
                                )}
                                <input 
                                    id="image-upload" 
                                    type="file" 
                                    accept="image/*,.heic,.heif" 
                                    className="hidden" 
                                    onChange={handleFileChange}
                                    disabled={isCompressing}
                                />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center space-y-2">
                                <p className="text-sm font-medium text-gray-700">Preview</p>
                                <div className={getPreviewContainerClass()}>
                                    <div style={getPreviewStyle()}>
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                            style={getPreviewStyle()}
                                        />
                                    </div>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="absolute top-2 right-2 z-10 h-8 w-8 p-0"
                                        onClick={() => {
                                            if (previewUrl) {
                                                URL.revokeObjectURL(previewUrl);
                                            }
                                            setSelectedFile(null);
                                            setPreviewUrl(null);
                                        }}
                                        disabled={isUploading}
                                    >
                                        <Trash className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="gap-2">
                        <Button 
                            onClick={() => handleDialogClose(false)} 
                            variant="outline" 
                            disabled={isUploading || isCompressing}
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={uploadImage} 
                            disabled={!selectedFile || isUploading || isCompressing}
                            className="min-w-[100px]"
                        >
                            {isUploading ? (
                                <>
                                    <div className="h-4 w-4 border-2 border-background border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Uploading...
                                </>
                            ) : (
                                "Upload Image"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            
            <ImageCropperModal
                isOpen={isCropping}
                onClose={() => {
                    setIsCropping(false);
                    if (croppingImageSrc) {
                        URL.revokeObjectURL(croppingImageSrc);
                        setCroppingImageSrc(null);
                    }
                }}
                imageSrc={croppingImageSrc}
                onCropConfirm={handleCropConfirm}
                cropType={imageType}
            />
        </>
    );
};

export default ImageAddDialog;