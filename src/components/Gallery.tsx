import React, { useState, useEffect } from "react";
import {
  getGalleryItems,
  GalleryItem,
  deleteGalleryItem,
} from "../lib/supabase";
import { format } from "date-fns";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import GalleryForm from "./GalleryForm";
import { Trash2, Edit, Plus, Calendar, Heart, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ImageGallery from "./ImageGallery";
import { motion } from "framer-motion";

const Gallery = () => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { isLoggedIn, userName } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  const fetchGalleryItems = async () => {
    setIsLoading(true);
    try {
      const data = await getGalleryItems();
      console.log("Gallery items fetched:", data);

      // Sort by date (newest first)
      const sortedItems = [...data].sort(
        (a, b) =>
          new Date(b.monthsary_date).getTime() -
          new Date(a.monthsary_date).getTime(),
      );
      setGalleryItems(sortedItems);
    } catch (error) {
      console.error("Error fetching gallery items:", error);
      toast({
        title: "Failed to load gallery",
        description: "Please try refreshing the page",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this gallery item?")) {
      try {
        await deleteGalleryItem(id);
        setGalleryItems(galleryItems.filter((item) => item.id !== id));
        toast({
          title: "Gallery item deleted",
          description: "The gallery has been updated",
        });
      } catch (error) {
        console.error("Error deleting gallery item:", error);
        toast({
          title: "Delete failed",
          description: "Could not delete the gallery item. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleEditSuccess = () => {
    fetchGalleryItems();
    setIsEditing(false);
    setSelectedItem(null);
  };

  const groupItemsByMonthYear = () => {
    const groups: { [key: string]: GalleryItem[] } = {};

    galleryItems.forEach((item) => {
      const date = new Date(item.monthsary_date);
      const monthYear = format(date, "MMMM yyyy");

      if (!groups[monthYear]) {
        groups[monthYear] = [];
      }

      groups[monthYear].push(item);
    });

    return groups;
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <img
            src="/load-gallery.png"
            alt="Loading gallery"
            className="animate-pulse h-32 w-32 mb-6"
          />
          <div className="animate-pulse text-romance-primary text-xl">
            Loading your memories...
          </div>
        </div>
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariant = {
    hidden: { opacity: 0, scale: 0.9 },
    show: { opacity: 1, scale: 1 },
  };

  const groupedItems = groupItemsByMonthYear();

  return (
    <div className="py-12 min-h-[50vh]">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl text-romance-primary font-bold cursive">
            Our Photo Gallery
          </h2>

          {isLoggedIn && (
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-romance-primary hover:bg-romance-secondary text-white">
                  <Plus size={16} className="mr-1" /> Add Gallery
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Gallery</DialogTitle>
                </DialogHeader>

                <GalleryForm
                  onSuccess={handleEditSuccess}
                  userName={userName || ""}
                />
              </DialogContent>
            </Dialog>
          )}
        </motion.div>

        {Object.keys(groupedItems).length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <p className="text-lg text-gray-500">No photos added yet.</p>
            {isLoggedIn && (
              <p className="mt-2 text-romance-primary">
                Click "Add Gallery" to create your first gallery!
              </p>
            )}
          </motion.div>
        ) : (
          <div className="space-y-16">
            {Object.entries(groupedItems).map(
              ([monthYear, items], groupIndex) => (
                <motion.div
                  key={monthYear}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: groupIndex * 0.1 }}
                >
                  <motion.div
                    className="flex items-center mb-6"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: groupIndex * 0.1 + 0.1 }}
                  >
                    <div className="bg-romance-primary/10 p-2 rounded-full mr-3">
                      <Calendar size={20} className="text-romance-primary" />
                    </div>
                    <h3 className="text-2xl text-romance-secondary font-bold">
                      {monthYear}
                    </h3>
                  </motion.div>

                  <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    variants={container}
                    initial="hidden"
                    animate="show"
                  >
                    {items.map((item, index) => (
                      <motion.div
                        key={item.id}
                        className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden"
                        variants={itemVariant}
                      >
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <time className="text-sm text-romance-secondary font-medium flex items-center">
                              <Calendar size={14} className="mr-1" />
                              {format(
                                new Date(item.monthsary_date),
                                "MMMM d, yyyy",
                              )}
                              <span className="ml-2 opacity-60">
                                {index + 1}/{items.length}
                              </span>
                            </time>

                            {isLoggedIn && (
                              <div className="flex space-x-2">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-8 w-8 p-0"
                                      onClick={() => {
                                        setSelectedItem(item);
                                        setIsEditing(true);
                                      }}
                                    >
                                      <Edit size={14} />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                                    <DialogHeader>
                                      <DialogTitle>Edit Gallery</DialogTitle>
                                    </DialogHeader>
                                    {selectedItem && isEditing && (
                                      <GalleryForm
                                        item={selectedItem}
                                        onSuccess={handleEditSuccess}
                                        userName={userName || ""}
                                      />
                                    )}
                                  </DialogContent>
                                </Dialog>

                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-destructive hover:text-destructive-foreground hover:bg-destructive"
                                  onClick={() => handleDelete(item.id)}
                                >
                                  <Trash2 size={14} />
                                </Button>
                              </div>
                            )}
                          </div>

                          <motion.h4
                            className="text-lg font-bold text-romance-primary mb-2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                          >
                            {item.title}
                          </motion.h4>
                          <p className="text-gray-700 mb-4 line-clamp-2">
                            {item.description}
                          </p>
                        </div>

                        {item.images && item.images.length > 0 && (
                          <div className="mb-3 px-2">
                            <ImageGallery images={item.images} />
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              ),
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;
