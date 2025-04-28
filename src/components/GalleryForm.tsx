"use client";

import type React from "react";
import { useState } from "react";
import {
  type GalleryItem,
  createGalleryItem,
  updateGalleryItem,
  deleteImageFromStorage,
} from "../lib/supabase";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { CalendarIcon, Camera, Loader2, X, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "@/lib/utils";
import { uploadMultipleImagesOptimized } from "../lib/uploadQueue";
import UploadProgressIndicator from "./UploadProgressIndicator";

type GalleryFormProps = {
  item?: GalleryItem;
  onSuccess: () => void;
  userName: string;
};

const GalleryForm: React.FC<GalleryFormProps> = ({
  item,
  onSuccess,
  userName,
}) => {
  const [title, setTitle] = useState(item?.title || "");
  const [description, setDescription] = useState(item?.description || "");
  const [date, setDate] = useState<Date | undefined>(
    item?.monthsary_date ? new Date(item.monthsary_date) : new Date(),
  );
  const [images, setImages] = useState<string[]>(item?.images || []);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const { toast } = useToast();

  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);

      // Limit to maximum 20 images total
      if (images.length + newImages.length + selectedFiles.length > 20) {
        toast({
          title: "Too many images",
          description: "Maximum 20 images allowed per gallery",
          variant: "destructive",
        });
        return;
      }

      setNewImages([...newImages, ...selectedFiles]);

      // Create preview URLs
      const newPreviewUrls = selectedFiles.map((file) =>
        URL.createObjectURL(file),
      );
      setPreviewUrls([...previewUrls, ...newPreviewUrls]);
    }
  };

  const removePreviewImage = (index: number) => {
    const updatedPreviewUrls = [...previewUrls];
    const updatedNewImages = [...newImages];

    // Remove the URL from preview
    URL.revokeObjectURL(updatedPreviewUrls[index]);
    updatedPreviewUrls.splice(index, 1);

    // Remove the file from newImages
    updatedNewImages.splice(index, 1);

    setPreviewUrls(updatedPreviewUrls);
    setNewImages(updatedNewImages);
  };

  const removeExistingImage = async (imageUrl: string) => {
    try {
      // First remove from the local state
      setImages(images.filter((img) => img !== imageUrl));

      // Then attempt to delete from storage
      // We don't await this to keep the UI responsive
      // If it fails, the image will remain in storage but removed from the entry
      deleteImageFromStorage(imageUrl).catch((error) => {
        console.error("Error deleting image from storage:", error);
      });
    } catch (error) {
      console.error("Error removing image:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim() || !date) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload new images if any
      const uploadedImageUrls: string[] = [];

      if (newImages.length > 0) {
        setIsUploading(true);
        // Use the optimized upload function
        const basePath = `gallery/${userName}`;
        const urls = await uploadMultipleImagesOptimized(
          newImages,
          basePath,
          (progress) => {
            setUploadProgress(progress);
          },
        );
        uploadedImageUrls.push(...urls);
        setIsUploading(false);
      }

      // Combine existing and new image URLs
      const allImages = [...images, ...uploadedImageUrls];

      const formattedDate = format(date, "yyyy-MM-dd");
      const galleryData = {
        title,
        description,
        monthsary_date: formattedDate,
        images: allImages,
      };

      if (item) {
        // Update existing gallery
        await updateGalleryItem(item.id, galleryData);
        toast({
          title: "Gallery updated",
          description: "Your gallery has been updated successfully",
        });
      } else {
        // Create new gallery
        await createGalleryItem(galleryData);
        toast({
          title: "Gallery added",
          description: "Your gallery has been added successfully",
        });
      }

      onSuccess();
    } catch (error) {
      console.error("Error saving gallery:", error);
      toast({
        title: "Error saving gallery",
        description:
          "There was a problem saving your gallery. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  const totalImagesCount = images.length + previewUrls.length;
  const canAddMoreImages = totalImagesCount < 20;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Name this gallery"
          required
        />
      </div>

      <div>
        <Label htmlFor="date">Monthsary Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(selectedDate) => {
                setDate(selectedDate);
                // Close the popover by simulating an Escape key press
                const event = new KeyboardEvent("keydown", {
                  key: "Escape",
                  bubbles: true,
                });
                document.dispatchEvent(event);
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe this collection of photos..."
          className="h-24"
          required
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <Label>Images (max 20)</Label>
          <span className="text-xs text-gray-500">{totalImagesCount}/20</span>
        </div>

        {/* Image Gallery Section */}
        <div className="mb-4">
          {/* Existing Images Section */}
          {images.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">Current images:</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {images.map((imageUrl, index) => (
                  <div
                    key={`existing-${index}`}
                    className="relative group rounded-lg overflow-hidden shadow-md aspect-square h-20 w-20 bg-black"
                  >
                    <img
                      src={imageUrl || "/placeholder.svg"}
                      alt={`Existing image ${index + 1}`}
                      className="object-cover w-full h-full transition-transform duration-200 group-hover:scale-105"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(imageUrl)}
                      className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 opacity-80 hover:opacity-100 transition-opacity z-10"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Images Preview Section */}
          {previewUrls.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">New images:</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {previewUrls.map((url, index) => (
                  <div
                    key={`preview-${index}`}
                    className="relative group rounded-lg overflow-hidden shadow-md aspect-square h-20 w-20 bg-black"
                  >
                    <img
                      src={url || "/placeholder.svg"}
                      alt={`Preview ${index + 1}`}
                      className="object-cover w-full h-full transition-transform duration-200 group-hover:scale-105"
                    />
                    <button
                      type="button"
                      onClick={() => removePreviewImage(index)}
                      className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 opacity-80 hover:opacity-100 transition-opacity z-10"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Images Button Section */}
          {canAddMoreImages && (
            <div className="mt-4">
              <input
                id="gallery-upload"
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />

              {totalImagesCount === 0 ? (
                <label
                  htmlFor="gallery-upload"
                  className="flex flex-col items-center justify-center border-2 border-dashed border-romance-primary rounded-lg p-6 cursor-pointer hover:bg-romance-primary/10 transition"
                >
                  <Camera size={32} className="mb-2 text-romance-primary" />
                  <span className="text-romance-primary font-semibold mb-1">
                    Choose files to upload
                  </span>
                  <span className="text-gray-500 text-sm mb-2">
                    PNG, JPG, JPEG, GIF up to 10MB each
                  </span>
                  <Button
                    type="button"
                    className="mt-2 bg-romance-secondary hover:bg-romance-primary text-white"
                    onClick={() =>
                      document.getElementById("gallery-upload")?.click()
                    }
                  >
                    Upload Files
                  </Button>
                </label>
              ) : (
                <Button
                  type="button"
                  className="w-full flex items-center justify-center bg-romance-primary/10 hover:bg-romance-primary/20 text-romance-primary border border-dashed border-romance-primary/50"
                  onClick={() =>
                    document.getElementById("gallery-upload")?.click()
                  }
                >
                  <Plus size={16} className="mr-1" />
                  Add more images ({20 - totalImagesCount} remaining)
                </Button>
              )}
            </div>
          )}
        </div>

        <p className="text-xs text-gray-500 mt-1">
          Upload up to 20 images for this gallery (JPEG, PNG, GIF)
        </p>
      </div>

      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-romance-primary hover:bg-romance-secondary"
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {item ? "Update Gallery" : "Add Gallery"}
        </Button>
      </div>

      <UploadProgressIndicator
        progress={uploadProgress}
        isUploading={isUploading}
      />
    </form>
  );
};

export default GalleryForm;
