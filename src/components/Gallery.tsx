"use client";

import { useState, useEffect, useRef } from "react";
import {
  getGalleryItems,
  type GalleryItem,
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
import {
  Trash2,
  Edit,
  Plus,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ImageGallery from "./ImageGallery";
import { motion } from "framer-motion";
import ConfirmDialog from "./ConfirmDialog";

const Gallery = () => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeMonthYear, setActiveMonthYear] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const monthRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const { isLoggedIn, userName } = useAuth();
  const { toast } = useToast();

  // Refs for scroll animations
  const galleryRef = useRef<HTMLDivElement>(null);

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

      // Set the first month as active
      if (sortedItems.length > 0) {
        const firstDate = new Date(sortedItems[0].monthsary_date);
        setActiveMonthYear(format(firstDate, "MMMM yyyy"));
      }
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

  const confirmDelete = (id: number) => {
    setItemToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (itemToDelete === null) return;

    try {
      await deleteGalleryItem(itemToDelete);
      setGalleryItems(galleryItems.filter((item) => item.id !== itemToDelete));
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
    } finally {
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
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

  const scrollToMonth = (monthYear: string) => {
    setActiveMonthYear(monthYear);
    if (monthRefs.current[monthYear]) {
      monthRefs.current[monthYear]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const navigateMonth = (direction: "prev" | "next") => {
    const monthYears = Object.keys(groupItemsByMonthYear());
    const currentIndex = monthYears.indexOf(activeMonthYear || "");

    if (direction === "prev" && currentIndex > 0) {
      scrollToMonth(monthYears[currentIndex - 1]);
    } else if (direction === "next" && currentIndex < monthYears.length - 1) {
      scrollToMonth(monthYears[currentIndex + 1]);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <motion.div
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            className="relative w-32 h-32 mb-6"
          >
            <img
              src="/load-gallery.png"
              alt="Loading gallery"
              className="absolute top-0 left-0 w-full h-full object-contain"
            />
          </motion.div>
          <motion.div
            className="text-romance-primary text-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          >
            Loading your memories...
          </motion.div>
        </div>
      </div>
    );
  }

  const groupedItems = groupItemsByMonthYear();
  const monthYears = Object.keys(groupedItems);

  return (
    <div className="py-12 min-h-[50vh]">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl text-romance-primary font-bold">
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

        {/* Month navigation bar */}
        {monthYears.length > 0 && (
          <motion.div
            className="mb-8 bg-white rounded-lg shadow-md p-4 sticky top-20 z-10"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateMonth("prev")}
                disabled={monthYears.indexOf(activeMonthYear || "") <= 0}
                className="text-romance-primary hover:text-romance-secondary"
              >
                <ChevronLeft size={20} />
              </Button>

              <div className="flex items-center space-x-2 overflow-x-auto hide-scrollbar py-2 px-4">
                {monthYears.map((monthYear) => (
                  <Button
                    key={monthYear}
                    variant={
                      activeMonthYear === monthYear ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => scrollToMonth(monthYear)}
                    className={`whitespace-nowrap ${
                      activeMonthYear === monthYear
                        ? "bg-romance-primary hover:bg-romance-secondary"
                        : "text-romance-primary hover:bg-pink-50"
                    }`}
                  >
                    {monthYear}
                  </Button>
                ))}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateMonth("next")}
                disabled={
                  monthYears.indexOf(activeMonthYear || "") >=
                  monthYears.length - 1
                }
                className="text-romance-primary hover:text-romance-secondary"
              >
                <ChevronRight size={20} />
              </Button>
            </div>
          </motion.div>
        )}

        {Object.keys(groupedItems).length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center py-16 bg-white rounded-lg shadow-md"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex justify-center mb-6"
            >
              <ImageIcon size={80} className="text-pink-200" />
            </motion.div>
            <p className="text-lg text-gray-500">No photos added yet.</p>
            {isLoggedIn && (
              <motion.p
                className="mt-2 text-romance-primary"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Click "Add Gallery" to create your first gallery!
              </motion.p>
            )}
          </motion.div>
        ) : (
          <div ref={galleryRef} className="space-y-16">
            {Object.entries(groupedItems).map(
              ([monthYear, items], groupIndex) => (
                <motion.div
                  key={monthYear}
                  ref={(el) => (monthRefs.current[monthYear] = el)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: groupIndex * 0.1 }}
                  id={`month-${monthYear.replace(" ", "-")}`}
                >
                  <motion.div
                    className="flex items-center mb-6"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{
                      delay: groupIndex * 0.1 + 0.1,
                      duration: 0.6,
                    }}
                  >
                    <div className="bg-romance-primary/10 p-3 rounded-full mr-3 shadow-md">
                      <Calendar size={24} className="text-romance-primary" />
                    </div>
                    <h3 className="text-2xl text-romance-secondary font-bold">
                      {monthYear}
                    </h3>
                  </motion.div>

                  <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ staggerChildren: 0.1 }}
                  >
                    {items.map((item, index) => (
                      <motion.div
                        key={item.id}
                        className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 100,
                          damping: 10,
                          delay: index * 0.05,
                        }}
                      >
                        <div className="p-5">
                          <div className="flex justify-between items-start mb-3">
                            <time className="text-sm text-romance-secondary font-medium flex items-center bg-pink-50 px-2 py-1 rounded-full">
                              <Calendar size={14} className="mr-1" />
                              {format(
                                new Date(item.monthsary_date),
                                "MMMM d, yyyy",
                              )}
                              <span className="ml-2 opacity-60 bg-white px-1.5 py-0.5 rounded-full text-xs">
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
                                      className="h-8 w-8 p-0 hover:bg-pink-50 hover:text-pink-500 transition-colors rounded-full"
                                      onClick={() => {
                                        setSelectedItem(item);
                                        setIsEditing(true);
                                      }}
                                    >
                                      <Edit
                                        size={14}
                                        className="text-pink-400 hover:text-pink-600"
                                      />
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
                                  className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-500 transition-colors rounded-full"
                                  onClick={() => confirmDelete(item.id)}
                                >
                                  <Trash2
                                    size={14}
                                    className="text-red-400 hover:text-red-600"
                                  />
                                </Button>
                              </div>
                            )}
                          </div>

                          <motion.h4
                            className="text-xl font-bold text-romance-primary mb-3"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            whileHover={{ scale: 1.01 }}
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

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Gallery"
        description="Are you sure you want to delete this gallery? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="delete"
      />
    </div>
  );
};

export default Gallery;
