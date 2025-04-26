import React, { useState } from 'react';
import { GalleryItem, createGalleryItem, updateGalleryItem, uploadImage } from '../lib/supabase';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Calendar as CalendarIcon, Loader2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { cn } from '@/lib/utils';

type GalleryFormProps = {
  item?: GalleryItem;
  onSuccess: () => void;
  userName: string;
};

const GalleryForm: React.FC<GalleryFormProps> = ({ 
  item, 
  onSuccess,
  userName
}) => {
  const [title, setTitle] = useState(item?.title || '');
  const [description, setDescription] = useState(item?.description || '');
  const [date, setDate] = useState<Date | undefined>(
    item?.monthsary_date ? new Date(item.monthsary_date) : new Date()
  );
  const [images, setImages] = useState<string[]>(item?.images || []);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      
      // Limit to maximum 20 images total
      if (images.length + selectedFiles.length > 20) {
        toast({
          title: "Too many images",
          description: "Maximum 20 images allowed per gallery",
          variant: "destructive",
        });
        return;
      }
      
      setNewImages([...newImages, ...selectedFiles]);
      
      // Create preview URLs
      const newPreviewUrls = selectedFiles.map(file => URL.createObjectURL(file));
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
    setImages(images.filter(img => img !== imageUrl));
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
          const path = `gallery/${userName}/${timestamp}_${file.name}`;
          const imageUrl = await uploadImage(file, path);
          uploadedImageUrls.push(imageUrl);
        }
      }
      
      // Combine existing and new image URLs
      const allImages = [...images, ...uploadedImageUrls];
      
      const formattedDate = format(date, 'yyyy-MM-dd');
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
      console.error('Error saving gallery:', error);
      toast({
        title: "Error saving gallery",
        description: "There was a problem saving your gallery. Please try again.",
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
                !date && "text-muted-foreground"
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
        <Label>Images (max 20)</Label>
        
        {/* Existing images */}
        {images.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-2">
            {images.map((imageUrl, index) => (
              <div key={index} className="relative group">
                <img
                  src={imageUrl}
                  alt={`Existing image ${index + 1}`}
                  className="h-24 w-full object-cover rounded-md"
                />
                <button
                  type="button"
                  onClick={() => removeExistingImage(imageUrl)}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
        
        {/* Image previews for new uploads */}
        {previewUrls.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-2">
            {previewUrls.map((url, index) => (
              <div key={index} className="relative group">
                <img
                  src={url}
                  alt={`Preview ${index + 1}`}
                  className="h-24 w-full object-cover rounded-md"
                />
                <button
                  type="button"
                  onClick={() => removePreviewImage(index)}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
        
        {/* Image upload input */}
        {(images.length + previewUrls.length) < 20 && (
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
          Upload up to 20 images for this gallery (JPEG, PNG, GIF)
        </p>
      </div>
      
      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isSubmitting} className="bg-romance-primary hover:bg-romance-secondary">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {item ? 'Update Gallery' : 'Add Gallery'}
        </Button>
      </div>
    </form>
  );
};

export default GalleryForm;
