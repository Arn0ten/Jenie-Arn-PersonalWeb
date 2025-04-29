"use client";

import { useState, useEffect, useRef } from "react";
import {
  getGalleryItems,
  type GalleryItem,
  deleteGalleryItem,
  subscribeToGalleryChanges,
} from "../lib/supabase";
import { format, getYear, parse } from "date-fns";
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
  Heart,
  Filter,
  X,
  ArrowUp,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ImageGallery from "./ImageGallery";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmDialog from "./ConfirmDialog";
import { useLikes } from "../contexts/LikesContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { RealtimeChannel } from "@supabase/supabase-js";

const Gallery = () => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeMonthYear, setActiveMonthYear] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const monthRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const { isLoggedIn, userName } = useAuth();
  const { toast } = useToast();
  const { refreshLikesForImages, getLikeCount } = useLikes();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [monthFilter, setMonthFilter] = useState<string>("all");
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [availableMonths, setAvailableMonths] = useState<
    { value: string; label: string }[]
  >([]);
  const [isButtonsSticky, setIsButtonsSticky] = useState(false);
  const [subscription, setSubscription] = useState<RealtimeChannel | null>(
    null,
  );
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);

  // Refs for scroll animations
  const galleryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchGalleryItems();

    // Add scroll event listener for scroll-to-top button and sticky buttons
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
      setIsButtonsSticky(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const setupRealtime = () => {
      // Clean up any existing subscription
      if (subscription) {
        subscription.unsubscribe();
      }

      // Create a new subscription
      const newSubscription = subscribeToGalleryChanges((payload) => {
        console.log("Gallery change received:", payload);

        // Handle different types of changes
        if (payload.eventType === "INSERT") {
          // A new item was added
          const newItem = payload.new as GalleryItem;
          setGalleryItems((prevItems) => {
            // Check if the item already exists to avoid duplicates
            if (prevItems.some((item) => item.id === newItem.id)) {
              return prevItems;
            }
            // Add the new item and sort
            const updatedItems = [...prevItems, newItem];
            const sortedItems = updatedItems.sort(
              (a, b) =>
                new Date(b.monthsary_date).getTime() -
                new Date(a.monthsary_date).getTime(),
            );

            // Show a toast notification for new items
            if (!isLoading) {
              toast({
                title: "New gallery added",
                description: `"${newItem.title}" was just added to the gallery`,
                variant: "default",
              });
            }

            return sortedItems;
          });
        } else if (payload.eventType === "UPDATE") {
          // An item was updated
          const updatedItem = payload.new as GalleryItem;
          setGalleryItems((prevItems) => {
            const updated = prevItems.map((item) =>
              item.id === updatedItem.id ? updatedItem : item,
            );

            // Show a toast notification for updates
            if (!isLoading) {
              toast({
                title: "Gallery updated",
                description: `"${updatedItem.title}" was just updated`,
                variant: "default",
              });
            }

            return updated;
          });
        } else if (payload.eventType === "DELETE") {
          // An item was deleted
          const deletedItem = payload.old as GalleryItem;
          setGalleryItems((prevItems) => {
            // Show a toast notification for deletions
            if (
              !isLoading &&
              prevItems.some((item) => item.id === deletedItem.id)
            ) {
              toast({
                title: "Gallery removed",
                description: `"${deletedItem.title}" was removed`,
                variant: "default",
              });
            }

            return prevItems.filter((item) => item.id !== deletedItem.id);
          });
        }
      });

      setSubscription(newSubscription);
    };

    setupRealtime();

    // Clean up subscription when component unmounts
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
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
      // Filtered items will be updated by the useEffect that watches galleryItems

      // Set the first month as active
      if (sortedItems.length > 0) {
        const firstDate = new Date(sortedItems[0].monthsary_date);
        setActiveMonthYear(format(firstDate, "MMMM yyyy"));
      }

      // Extract available years and months for filtering
      const years = new Set<string>();
      const months = new Set<string>();

      sortedItems.forEach((item) => {
        const date = new Date(item.monthsary_date);
        years.add(date.getFullYear().toString());
        months.add(format(date, "MM")); // Store month number (01-12)
      });

      setAvailableYears(
        Array.from(years).sort(
          (a, b) => Number.parseInt(b) - Number.parseInt(a),
        ),
      );

      // Create month options with proper labels
      const monthOptions = Array.from(months)
        .map((month) => {
          const monthDate = parse(month, "MM", new Date());
          return {
            value: month,
            label: format(monthDate, "MMMM"), // Month name
          };
        })
        .sort((a, b) => Number.parseInt(a.value) - Number.parseInt(b.value));

      setAvailableMonths(monthOptions);
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

  // Apply filters
  useEffect(() => {
    if (galleryItems.length === 0) return;

    let filtered = [...galleryItems];

    // Filter by year
    if (yearFilter !== "all") {
      filtered = filtered.filter((item) => {
        const itemYear = getYear(new Date(item.monthsary_date)).toString();
        return itemYear === yearFilter;
      });
    }

    // Filter by month
    if (monthFilter !== "all") {
      filtered = filtered.filter((item) => {
        const itemMonth = format(new Date(item.monthsary_date), "MM");
        return itemMonth === monthFilter;
      });
    }

    setFilteredItems(filtered);

    // Update active month year if needed
    if (filtered.length > 0) {
      const firstDate = new Date(filtered[0].monthsary_date);
      setActiveMonthYear(format(firstDate, "MMMM yyyy"));
    }

    // Collect all image URLs to fetch like counts
    const allImageUrls = filtered.flatMap((item) => item.images || []);
    if (allImageUrls.length > 0) {
      refreshLikesForImages(allImageUrls);
    }
  }, [galleryItems, yearFilter, monthFilter]);

  // Reset filters
  const resetFilters = () => {
    setYearFilter("all");
    setMonthFilter("all");
    setIsFilterDialogOpen(false); // Close the dialog when resetting filters
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
      setFilteredItems(
        filteredItems.filter((item) => item.id !== itemToDelete),
      );
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

    filteredItems.forEach((item) => {
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

  // Calculate total likes for a gallery item
  const getEntryTotalLikes = (entry: GalleryItem) => {
    if (!entry.images || entry.images.length === 0) return 0;
    return entry.images.reduce(
      (total, imageUrl) => total + getLikeCount(imageUrl),
      0,
    );
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
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
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.7, 1, 0.7],
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

  return (
    <div className="py-12 min-h-[50vh]">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex justify-between items-center mb-8 flex-wrap"
        >
          <motion.h2
            className="text-3xl md:text-5xl text-romance-primary font-bold cursive w-full sm:w-auto relative"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Our Gallery
            <motion.div
              className="absolute -bottom-2 left-0 h-1 bg-gradient-to-r from-pink-500 to-transparent"
              initial={{ width: 0 }}
              animate={{ width: "80%" }}
              transition={{ duration: 0.8, delay: 0.6 }}
            />
          </motion.h2>

          <div></div>
        </motion.div>

        {/* Filter Panel */}
        <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-romance-primary">
                Filter Galleries
              </DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div>
                <label className="block text-sm font-medium mb-1">Year</label>
                <Select value={yearFilter} onValueChange={setYearFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {availableYears.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Month</label>
                <Select value={monthFilter} onValueChange={setMonthFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Months</SelectItem>
                    {availableMonths.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-2">
              <Button variant="outline" size="sm" onClick={resetFilters}>
                Reset
              </Button>
              <Button
                size="sm"
                className="bg-romance-primary hover:bg-romance-secondary"
                onClick={() => setIsFilterDialogOpen(false)}
              >
                Apply Filters
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        {/* Filter summary badges */}
        {(yearFilter !== "all" || monthFilter !== "all") && (
          <div className="flex flex-wrap gap-2 mb-4">
            {yearFilter !== "all" && (
              <Badge
                className="bg-romance-primary/20 text-romance-primary hover:bg-romance-primary/30 cursor-pointer"
                onClick={() => setYearFilter("all")}
              >
                Year: {yearFilter} <X size={14} className="ml-1" />
              </Badge>
            )}
            {monthFilter !== "all" && (
              <Badge
                className="bg-romance-primary/20 text-romance-primary hover:bg-romance-primary/30 cursor-pointer"
                onClick={() => setMonthFilter("all")}
              >
                Month:{" "}
                {availableMonths.find((m) => m.value === monthFilter)?.label}{" "}
                <X size={14} className="ml-1" />
              </Badge>
            )}
            <Badge
              variant="outline"
              className="border-romance-primary text-romance-primary hover:bg-romance-primary/10 cursor-pointer"
              onClick={resetFilters}
            >
              Clear All
            </Badge>
          </div>
        )}
        {/* Month navigation bar */}
        {/* {monthYears.length > 0 && (
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
        )} */}
        {!isLoading && Object.keys(groupedItems).length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center py-16 bg-white rounded-lg shadow-md"
          >
            {galleryItems.length === 0 ? (
              <>
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
              </>
            ) : (
              <>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="flex justify-center mb-6"
                >
                  <Filter size={80} className="text-pink-200" />
                </motion.div>
                <p className="text-lg text-gray-500">
                  No galleries match your filters.
                </p>
                <motion.p
                  className="mt-2 text-romance-primary"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Button
                    variant="link"
                    className="text-romance-primary p-0"
                    onClick={resetFilters}
                  >
                    Clear filters
                  </Button>{" "}
                  to see all galleries.
                </motion.p>
              </>
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
                    {items.map((item, index) => {
                      const totalLikes = getEntryTotalLikes(item);
                      return (
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
                          <div className="p-5 relative">
                            <div className="flex justify-between items-start mb-3 flex-wrap">
                              <time className="text-sm text-romance-secondary font-medium flex items-center bg-pink-50 px-2 py-1 rounded-full mr-2 mb-2">
                                <Calendar size={14} className="mr-1" />
                                {format(
                                  new Date(item.monthsary_date),
                                  "MMMM d, yyyy",
                                )}
                              </time>

                              {/* <span className="text-xs bg-white px-1.5 py-0.5 rounded-full border border-pink-100 text-pink-400 ml-auto mr-2">
                                {index + 1}/{items.length}
                              </span> */}

                              {/* Total likes badge - moved to top right and made more prominent */}
                              {totalLikes > 0 && (
                                <motion.div
                                  className="flex items-center bg-pink-100 text-pink-500 px-2 py-1 rounded-full text-sm font-medium absolute top-2 right-2"
                                  initial={{ scale: 0.9 }}
                                  animate={{ scale: 1 }}
                                  whileHover={{ scale: 1.1 }}
                                >
                                  <Heart
                                    size={14}
                                    className="mr-1 fill-pink-500"
                                  />
                                  <span>{totalLikes}</span>
                                </motion.div>
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
                            <p className="text-gray-700 mb-6 line-clamp-2">
                              {item.description}
                            </p>

                            {/* Edit/Delete buttons - made larger and more visible */}
                            {isLoggedIn && (
                              <div className="flex space-x-2 absolute top-14 right-2">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-8 w-8 p-0 bg-pink-50 hover:bg-pink-100 hover:text-pink-600 border-pink-200 transition-colors rounded-full"
                                      onClick={() => {
                                        setSelectedItem(item);
                                        setIsEditing(true);
                                      }}
                                    >
                                      <Edit
                                        size={16}
                                        className="text-pink-500"
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
                                  className="h-8 w-8 p-0 bg-red-50 hover:bg-red-100 hover:text-red-600 border-red-200 transition-colors rounded-full"
                                  onClick={() => confirmDelete(item.id)}
                                >
                                  <Trash2 size={16} className="text-red-500" />
                                </Button>
                              </div>
                            )}
                          </div>

                          {item.images && item.images.length > 0 && (
                            <div className="mb-3 px-2">
                              <ImageGallery images={item.images} />
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </motion.div>
              ),
            )}
          </div>
        )}
      </div>

      {/* Scroll to top button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            className="fixed bottom-20 right-4 bg-romance-primary text-white rounded-full p-3 shadow-lg z-50"
            onClick={scrollToTop}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ArrowUp size={20} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Floating action buttons */}
      <div className="fixed bottom-20 left-4 z-50 flex flex-col gap-2">
        {isLoggedIn && (
          <Dialog>
            <DialogTrigger asChild>
              <motion.button
                className="p-4 bg-romance-primary text-white rounded-full shadow-lg"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Plus size={20} />
              </motion.button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto pb-20 sm:pb-6">
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

        <motion.button
          className="p-4 bg-white border border-romance-primary text-romance-primary rounded-full shadow-lg relative"
          onClick={() => setIsFilterDialogOpen(true)}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Filter size={20} />
          {(yearFilter !== "all" || monthFilter !== "all") && (
            <Badge className="absolute -top-2 -right-2 bg-romance-primary text-white">
              {(yearFilter !== "all" ? 1 : 0) + (monthFilter !== "all" ? 1 : 0)}
            </Badge>
          )}
        </motion.button>
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
