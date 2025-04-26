import React, { useState } from "react";
import {
  TimelineEntry,
  createTimelineEntry,
  updateTimelineEntry,
  uploadImage,
} from "../lib/supabase";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { Calendar as CalendarIcon, Loader2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "@/lib/utils";

type TimelineFormProps = {
  entry?: TimelineEntry;
  onSuccess: () => void;
  userName: string;
};

const TimelineForm: React.FC<TimelineFormProps> = ({
  entry,
  onSuccess,
  userName,
}) => {
  const [title, setTitle] = useState(entry?.title || "");
  const [description, setDescription] = useState(entry?.description || "");
  const [date, setDate] = useState<Date | undefined>(
    entry?.date ? new Date(entry.date) : new Date(),
  );
  const [isMonthsary, setIsMonthsary] = useState(entry?.is_monthsary || false);
  const [images, setImages] = useState<string[]>(entry?.images || []);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);

      // Limit to maximum 3 images total
      if (images.length + selectedFiles.length > 3) {
        toast({
          title: "Too many images",
          description: "Maximum 3 images allowed per timeline entry",
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

  const removeExistingImage = (imageUrl: string) => {
    setImages(images.filter((img) => img !== imageUrl));
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
        for (const file of newImages) {
          const timestamp = new Date().getTime();
          const path = `timeline/${userName}/${timestamp}_${file.name}`;
          const imageUrl = await uploadImage(file, path);
          uploadedImageUrls.push(imageUrl);
        }
      }

      // Combine existing and new image URLs
      const allImages = [...images, ...uploadedImageUrls];

      const formattedDate = format(date, "yyyy-MM-dd");
      const timelineData = {
        title,
        description,
        date: formattedDate,
        is_monthsary: isMonthsary,
        images: allImages,
      };

      if (entry) {
        // Update existing entry
        await updateTimelineEntry(entry.id, timelineData);
        toast({
          title: "Memory updated",
          description: "Your timeline entry has been updated successfully",
        });
      } else {
        // Create new entry
        await createTimelineEntry(timelineData);
        toast({
          title: "Memory added",
          description: "Your timeline entry has been added successfully",
        });
      }

      onSuccess();
    } catch (error) {
      console.error("Error saving timeline entry:", error);
      toast({
        title: "Error saving entry",
        description:
          "There was a problem saving your memory. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What's this memory about?"
          required
        />
      </div>

      <div>
        <Label htmlFor="date">Date</Label>
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
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="isMonthsary"
          checked={isMonthsary}
          onCheckedChange={(checked) => setIsMonthsary(checked as boolean)}
        />
        <Label
          htmlFor="isMonthsary"
          className="text-sm font-medium leading-none cursor-pointer"
        >
          Mark as a monthsary
        </Label>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Tell your story..."
          className="h-24"
          required
        />
      </div>

      <div>
        <Label>Images (max 3)</Label>

        {/* Existing images */}
        {images.length > 0 && (
          <div className="flex gap-2 mb-2 overflow-x-auto py-2">
            {images.map((imageUrl, index) => (
              <div
                key={index}
                className="relative group flex-shrink-0 rounded-lg overflow-hidden shadow-lg aspect-square w-28 h-28 bg-black"
                style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}
              >
                <img
                  src={imageUrl}
                  alt={`Existing image ${index + 1}`}
                  className="object-cover w-full h-full transition-transform duration-200 group-hover:scale-105"
                />
                <button
                  type="button"
                  onClick={() => removeExistingImage(imageUrl)}
                  className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 opacity-80 hover:opacity-100 transition-opacity z-10"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Image previews for new uploads */}
        {previewUrls.length > 0 && (
          <div className="flex gap-2 mb-2 overflow-x-auto py-2">
            {previewUrls.map((url, index) => (
              <div
                key={index}
                className="relative group flex-shrink-0 rounded-lg overflow-hidden shadow-lg aspect-square w-28 h-28 bg-black"
                style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}
              >
                <img
                  src={url}
                  alt={`Preview ${index + 1}`}
                  className="object-cover w-full h-full transition-transform duration-200 group-hover:scale-105"
                />
                <button
                  type="button"
                  onClick={() => removePreviewImage(index)}
                  className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 opacity-80 hover:opacity-100 transition-opacity z-10"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Image upload input */}
        {images.length + previewUrls.length < 3 && (
          <Input
            id="images"
            type="file"
            onChange={handleImageChange}
            accept="image/*"
            multiple
            className="mt-1"
          />
        )}
        <p className="text-xs text-gray-500 mt-1">
          Upload up to 3 images to capture this memory (JPEG, PNG, GIF)
        </p>
      </div>

      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-romance-primary hover:bg-romance-secondary"
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {entry ? "Update Memory" : "Add Memory"}
        </Button>
      </div>
    </form>
  );
};

export default TimelineForm;
