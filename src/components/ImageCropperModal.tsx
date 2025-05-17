
"use client";
import React, { useState, useCallback } from 'react';
import Cropper, { Area, Point } from 'react-easy-crop';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import getCroppedImg from '@/lib/utils';

interface ImageCropperModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string | null;
  onCropConfirm: (croppedImageFile: File) => void;
}

const ImageCropperModal: React.FC<ImageCropperModalProps> = ({ isOpen, onClose, imageSrc, onCropConfirm }) => {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixelsResult: Area) => {
    setCroppedAreaPixels(croppedAreaPixelsResult);
  }, []);

  const handleConfirmCrop = async () => {
    if (!croppedAreaPixels || !imageSrc) {
      return;
    }
    try {
      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (croppedImageBlob) {
        const croppedFile = new File([croppedImageBlob], "cropped_logo.png", { type: "image/png" });
        onCropConfirm(croppedFile);
        onClose();
      }
    } catch (e) {
      console.error(e);
      // Optionally show an error toast to the user
    }
  };

  if (!imageSrc) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] md:sm:max-w-[600px] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Crop your logo</DialogTitle>
        </DialogHeader>
        <div className="relative h-[300px] sm:h-[400px] w-full bg-gray-100">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            showGrid={false}
          />
        </div>
        {/* <div className="p-6 pt-2">
          <label htmlFor="zoom" className="block text-sm font-medium text-gray-700 mb-1">Zoom</label>
          <Slider
            id="zoom"
            min={1}
            max={3}
            step={0.1}
            value={[zoom]}
            onValueChange={(value: number[]) => setZoom(value[0])}
            className="w-full"
          />
        </div> */}
        <DialogFooter className="p-6 pt-0">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleConfirmCrop}>Confirm Crop</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImageCropperModal;