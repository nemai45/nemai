"use client";
import React, { useState, useCallback } from 'react';
import Cropper, { Area, Point } from 'react-easy-crop';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';

interface ImageCropperModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string | null;
  onCropConfirm: (croppedImageFile: File) => void;
  cropType: "logo" | "cover" | "portfolio";
}

// Updated output dimensions for better web optimization
const OUTPUT_DIMENSIONS = {
  cover: { width: 1200, height: 480 }, // 2.5:1 ratio - slightly smaller for better performance
  portfolio: { width: 800, height: 1000 }, // 4:5 ratio - good for social media
  logo: { width: 512, height: 512 } // 1:1 ratio - standard logo size
};

// Aspect ratios
const ASPECT_RATIOS = {
  cover: 2.5, // 2.5:1
  portfolio: 0.8, // 4:5
  logo: 1 // 1:1
};

const ImageCropperModal: React.FC<ImageCropperModalProps> = ({ 
  isOpen, 
  onClose, 
  imageSrc, 
  onCropConfirm, 
  cropType  
}) => {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const aspectRatio = ASPECT_RATIOS[cropType];
  const cropShape = cropType === "logo" ? "round" : "rect";
  const outputDimensions = OUTPUT_DIMENSIONS[cropType];

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixelsResult: Area) => {
    setCroppedAreaPixels(croppedAreaPixelsResult);
  }, []);

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: Area,
    fileName = 'cropped.jpg',
    quality = 0.95 // Slightly reduced for better file size
  ): Promise<File> => {
    const createImage = (url: string): Promise<HTMLImageElement> =>
      new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', error => reject(error));
        image.setAttribute('crossOrigin', 'anonymous');
        image.src = url;
      });

    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    const outputWidth = outputDimensions.width;
    const outputHeight = outputDimensions.height;

    canvas.width = outputWidth;
    canvas.height = outputHeight;
    
    // Enhanced canvas settings for better quality
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Fill with white background for transparency handling
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, outputWidth, outputHeight);

    // Apply better scaling algorithm
    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      outputWidth,
      outputHeight
    );

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const file = new File([blob], fileName, { 
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(file);
          }
        },
        'image/jpeg',
        quality
      );
    });
  };

  const handleConfirmCrop = async () => {
    if (!croppedAreaPixels || !imageSrc) {
      return;
    }
    
    setIsProcessing(true);
    try {
      const fileName = `cropped_${cropType}_${Date.now()}.jpg`;
      const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels, fileName, 0.95);
      onCropConfirm(croppedFile);
      onClose();
      // Reset state
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
    } catch (error) {
      console.error('Crop error:', error);
      toast.error("Failed to crop image. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    onClose();
  };

  if (!imageSrc) return null;

  // Get crop type display info
  const getCropInfo = () => {
    const info = {
      cover: {
        title: "cover image",
        ratio: "2.5:1 ratio",
      },
      portfolio: {
        title: "portfolio image", 
        ratio: "4:5 ratio",
      },
      logo: {
        title: "logo",
        ratio: "1:1 ratio", 
      }
    };
    return info[cropType];
  };

  const cropInfo = getCropInfo();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[500px] md:max-w-[700px] p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-lg font-semibold">
            Crop your {cropInfo.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="px-6">
          {/* Cropper Section */}
          <div className="relative h-[300px] sm:h-[400px] w-full bg-gray-50 rounded-lg overflow-hidden">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={aspectRatio}
              cropShape={cropShape}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              showGrid={true}
              style={{
                containerStyle: {
                  borderRadius: '8px',
                },
                cropAreaStyle: {
                  border: '2px solid #3b82f6',
                },
              }}
            />
          </div>
        </div>
        
        <DialogFooter className="p-6 pt-4 gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmCrop} 
            disabled={!croppedAreaPixels || isProcessing}
            className="min-w-[120px]"
          >
            {isProcessing ? (
              <>
                <div className="h-4 w-4 border-2 border-background border-t-transparent rounded-full animate-spin mr-2"></div>
                Processing...
              </>
            ) : (
              "Confirm Crop"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImageCropperModal;