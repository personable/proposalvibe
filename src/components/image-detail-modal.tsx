import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { ImageDetail } from "@/types"; // Import the ImageDetail type

interface ImageDetailModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  image: ImageDetail | null; // The selected image details
  onSaveDescription: (description: string) => void;
}

const ImageDetailModal: React.FC<ImageDetailModalProps> = ({
  isOpen,
  onOpenChange,
  image,
  onSaveDescription,
}) => {
  const [description, setDescription] = useState("");

  // Update local description state when the image prop changes
  useEffect(() => {
    if (image) {
      setDescription(image.description);
    } else {
      // Reset description if no image is selected (e.g., modal closed and reopened without selection)
      setDescription("");
    }
  }, [image]);

  if (!image) {
    return null; // Don't render the modal if no image is selected
  }

  const handleSave = () => {
    onSaveDescription(description);
    // Optionally close the modal here or rely on the parent component closing it
    // onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        {" "}
        {/* Adjust size as needed */}
        <DialogHeader>
          <DialogTitle>Image Details</DialogTitle>
          <DialogDescription>
            View the image and add or edit its description.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          {/* Image Display */}
          <div className="relative w-full aspect-video rounded-md overflow-hidden border">
            <Image
              src={image.src}
              alt="Selected scope image"
              layout="fill"
              objectFit="contain" // Use 'contain' to show the whole image without cropping
            />
          </div>

          {/* Description Textarea */}
          <div>
            <Label htmlFor="image-description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="image-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description for this image..."
              className="mt-1 min-h-[100px]" // Adjust height as needed
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button">Cancel</Button>
          </DialogClose>
          <Button type="button" onClick={handleSave}>
            Save Description
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImageDetailModal;
