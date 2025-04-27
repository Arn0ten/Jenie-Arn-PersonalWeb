"use client";

import { useState, useEffect, useRef } from "react";
import {
  getTimelineEntries,
  type TimelineEntry,
  deleteTimelineEntry,
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
import TimelineForm from "./TimelineForm";
import {
  Trash2,
  Edit,
  Plus,
  Heart,
  Calendar,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ImageGallery from "./ImageGallery";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmDialog from "./ConfirmDialog";
import { useLikes } from "../contexts/LikesContext";

const Timeline = () => {
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<TimelineEntry | null>(
    null,
  );
  const [isEditing, setIsEditing] = useState(false);
  const [expandedEntry, setExpandedEntry] = useState<number | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<number | null>(null);
  const { isLoggedIn, userName } = useAuth();
  const { toast } = useToast();
  const { refreshLikesForImages, getLikeCount } = useLikes();

  // Refs for scroll animations
  const timelineRef = useRef<HTMLDivElement>(null);
  const [visibleEntries, setVisibleEntries] = useState<number[]>([]);

  useEffect(() => {
    fetchTimelineEntries();
  }, []);

  const fetchTimelineEntries = async () => {
    setIsLoading(true);
    try {
      const data = await getTimelineEntries();
      console.log("Timeline entries fetched:", data);

      const sortedEntries = [...data].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
      setEntries(sortedEntries);

      // Collect all image URLs to fetch like counts
      const allImageUrls = sortedEntries.flatMap((entry) => entry.images || []);
      if (allImageUrls.length > 0) {
        refreshLikesForImages(allImageUrls);
      }
    } catch (error) {
      console.error("Error fetching timeline entries:", error);
      toast({
        title: "Failed to load timeline",
        description: "Please try refreshing the page",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Setup intersection observer for animation
  useEffect(() => {
    if (isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = Number(entry.target.getAttribute("data-entry-id"));
            if (id && !visibleEntries.includes(id)) {
              setVisibleEntries((prev) => [...prev, id]);
            }
          }
        });
      },
      { threshold: 0.2 },
    );

    // Observe all timeline entries
    document.querySelectorAll(".timeline-entry").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [isLoading, entries, visibleEntries]);

  const confirmDelete = (id: number) => {
    setEntryToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (entryToDelete === null) return;

    try {
      await deleteTimelineEntry(entryToDelete);
      setEntries(entries.filter((entry) => entry.id !== entryToDelete));
      toast({
        title: "Entry deleted",
        description: "Timeline entry has been removed",
      });
    } catch (error) {
      console.error("Error deleting entry:", error);
      toast({
        title: "Delete failed",
        description: "Could not delete the entry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteConfirmOpen(false);
      setEntryToDelete(null);
    }
  };

  const handleEditSuccess = () => {
    fetchTimelineEntries();
    setIsEditing(false);
    setSelectedEntry(null);
  };

  const toggleExpand = (id: number) => {
    setExpandedEntry(expandedEntry === id ? null : id);
  };

  // Calculate total likes for a timeline entry
  const getEntryTotalLikes = (entry: TimelineEntry) => {
    if (!entry.images || entry.images.length === 0) return 0;
    return entry.images.reduce(
      (total, imageUrl) => total + getLikeCount(imageUrl),
      0,
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <motion.img
            src="/load-timeline.png"
            alt="Loading"
            className="mb-4"
            style={{ width: 96, height: 96 }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.7, 1, 0.7],
              rotate: [0, 10, 0, -10, 0],
            }}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
          <div className="text-romance-primary text-lg">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Loading your journey...
            </motion.span>
          </div>
        </div>
      </div>
    );
  }

  const getTimelineColor = (index: number) => {
    const colors = [
      "from-pink-500 to-romance-accent",
      "from-rose-400 to-pink-300",
      "from-fuchsia-500 to-pink-400",
      "from-romance-primary to-rose-300",
      "from-pink-300 to-romance-accent",
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="py-12 min-h-[50vh]">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex justify-between items-center mb-12 flex-wrap"
        >
          <motion.h2
            className="text-3xl md:text-5xl text-romance-primary font-bold cursive w-full sm:w-auto relative"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Our Journey Together
            <motion.div
              className="absolute -bottom-2 left-0 h-1 bg-gradient-to-r from-pink-500 to-transparent"
              initial={{ width: 0 }}
              animate={{ width: "80%" }}
              transition={{ duration: 0.8, delay: 0.6 }}
            />
          </motion.h2>

          {isLoggedIn && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-4 sm:mt-0 w-full sm:w-auto"
            >
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-romance-primary hover:bg-romance-secondary text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 w-full sm:w-auto">
                    <Plus size={16} className="mr-1" /> Add Memory
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Memory</DialogTitle>
                  </DialogHeader>
                  <TimelineForm
                    onSuccess={handleEditSuccess}
                    userName={userName || ""}
                  />
                </DialogContent>
              </Dialog>
            </motion.div>
          )}
        </motion.div>

        {entries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center py-16"
          >
            <p className="text-lg text-gray-500">No memories added yet.</p>
            {isLoggedIn && (
              <motion.p
                className="mt-2 text-romance-primary"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Click "Add Memory" to create your first entry!
              </motion.p>
            )}
          </motion.div>
        ) : (
          <motion.div
            ref={timelineRef}
            className="relative timeline-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Timeline central line - visible on desktop */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-pink-500 via-pink-300 to-pink-100 transform -translate-x-1/2 z-0">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-pink-500 shadow-lg shadow-pink-300/50"></div>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-4 h-4 rounded-full bg-pink-300 shadow-lg shadow-pink-200/50"></div>
            </div>

            {/* Timeline mobile line */}
            <div className="md:hidden absolute left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-pink-500 via-pink-300 to-pink-100 z-0">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-pink-500 shadow-lg shadow-pink-300/50"></div>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-4 h-4 rounded-full bg-pink-300 shadow-lg shadow-pink-200/50"></div>
            </div>

            {entries.map((entry, index) => {
              const totalLikes = getEntryTotalLikes(entry);
              return (
                <motion.div
                  key={entry.id}
                  data-entry-id={entry.id}
                  className={`timeline-entry mb-16 relative md:w-1/2 ${
                    index % 2 === 0 ? "md:pr-12 md:ml-0" : "md:pl-12 md:ml-auto"
                  } ml-16 pl-6 md:pl-0`}
                  initial={{ opacity: 0, y: 30 }}
                  animate={
                    visibleEntries.includes(entry.id)
                      ? { opacity: 1, y: 0 }
                      : { opacity: 0, y: 30 }
                  }
                  transition={{
                    duration: 0.7,
                    delay: 0.1,
                    type: "spring",
                    stiffness: 100,
                    damping: 12,
                  }}
                  whileHover={{ scale: 1.01 }}
                >
                  {/* Timeline dot - desktop */}
                  <motion.div
                    className="hidden md:block absolute top-6 w-6 h-6 rounded-full border-4 border-white shadow-xl z-10"
                    style={{
                      left: index % 2 === 0 ? "auto" : "-12px",
                      right: index % 2 === 0 ? "-12px" : "auto",
                      background: `linear-gradient(135deg, #F472B6, #FECDD3)`,
                    }}
                    whileHover={{ scale: 1.3, rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  />

                  {/* Timeline dot - mobile */}
                  <motion.div
                    className="md:hidden absolute left-[-30px] top-6 w-6 h-6 rounded-full border-4 border-white shadow-lg z-10"
                    style={{
                      background: `linear-gradient(135deg, #F472B6, #FECDD3)`,
                    }}
                    whileHover={{ scale: 1.3, rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  />

                  {/* Date bubble - desktop */}
                  <motion.div
                    className={`hidden md:flex absolute top-6 items-center ${
                      index % 2 === 0
                        ? "left-[calc(100%+20px)]"
                        : "right-[calc(100%+20px)]"
                    }`}
                    whileHover={{ scale: 1.1 }}
                  >
                    <div className="bg-white px-3 py-1 rounded-full shadow-md border border-pink-100 flex items-center">
                      <Calendar
                        size={14}
                        className="text-romance-primary mr-1"
                      />
                      <span className="text-xs font-medium text-romance-secondary">
                        {format(new Date(entry.date), "MMM d, yyyy")}
                      </span>
                    </div>
                  </motion.div>

                  <motion.div
                    className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow relative overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={
                      visibleEntries.includes(entry.id)
                        ? { opacity: 1, y: 0 }
                        : { opacity: 0, y: 20 }
                    }
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    {/* Decorative top gradient bar */}
                    <div
                      className={`h-2 w-full bg-gradient-to-r ${getTimelineColor(index)}`}
                    ></div>

                    <div className="p-6">
                      {entry.is_monthsary && (
                        <motion.div
                          className="absolute -top-3 -right-3 bg-romance-primary text-white rounded-full p-2 shadow-lg z-10"
                          whileHover={{ scale: 1.2, rotate: 10 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Heart className="h-4 w-4 fill-white" />
                        </motion.div>
                      )}

                      <div className="flex justify-between items-start mb-4 flex-wrap">
                        {/* Date - mobile only */}
                        <time className="md:hidden text-sm text-romance-secondary font-medium flex items-center mb-2">
                          <Calendar size={14} className="mr-1" />
                          {format(new Date(entry.date), "MMMM d, yyyy")}
                        </time>

                        <div className="flex items-center">
                          {entry.is_monthsary && (
                            <span className="mr-2 text-xs bg-romance-accent text-romance-primary px-2 py-0.5 rounded-full">
                              Monthsary
                            </span>
                          )}

                          {/* Total likes badge */}
                          {totalLikes > 0 && (
                            <motion.div
                              className="flex items-center bg-pink-50 text-pink-500 px-2 py-0.5 rounded-full text-xs"
                              initial={{ scale: 0.9 }}
                              animate={{ scale: 1 }}
                              whileHover={{ scale: 1.1 }}
                            >
                              <Heart size={12} className="mr-1 fill-pink-500" />
                              <span>{totalLikes}</span>
                            </motion.div>
                          )}
                        </div>

                        {isLoggedIn && (
                          <div className="flex space-x-2 ml-auto">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-pink-50 hover:text-pink-500 transition-colors rounded-full"
                                  onClick={() => {
                                    setSelectedEntry(entry);
                                    setIsEditing(true);
                                  }}
                                >
                                  <Edit
                                    size={14}
                                    className="text-pink-400 hover:text-pink-600"
                                  />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Edit Memory</DialogTitle>
                                </DialogHeader>
                                {selectedEntry && isEditing && (
                                  <TimelineForm
                                    entry={selectedEntry}
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
                              onClick={() => confirmDelete(entry.id)}
                            >
                              <Trash2
                                size={14}
                                className="text-red-400 hover:text-red-600"
                              />
                            </Button>
                          </div>
                        )}
                      </div>

                      <motion.div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => toggleExpand(entry.id)}
                      >
                        <motion.h3
                          className="text-xl font-bold text-romance-primary"
                          whileHover={{ scale: 1.01 }}
                          animate={
                            visibleEntries.includes(entry.id)
                              ? { x: 0 }
                              : { x: -20 }
                          }
                        >
                          {entry.title}
                        </motion.h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-romance-primary hover:bg-pink-50"
                        >
                          {expandedEntry === entry.id ? (
                            <ChevronUp size={18} />
                          ) : (
                            <ChevronDown size={18} />
                          )}
                        </Button>
                      </motion.div>

                      <AnimatePresence>
                        {(expandedEntry === entry.id ||
                          expandedEntry === null) && (
                          <motion.div
                            initial={
                              expandedEntry !== null
                                ? { height: 0, opacity: 0 }
                                : false
                            }
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="mt-3"
                          >
                            <p
                              className={`text-gray-700 mb-4 whitespace-pre-line ${expandedEntry === null ? "line-clamp-3" : ""}`}
                            >
                              {entry.description}
                            </p>

                            {expandedEntry === null &&
                              entry.description.length > 150 && (
                                <button
                                  onClick={() => toggleExpand(entry.id)}
                                  className="text-sm text-pink-500 hover:text-pink-600 font-medium mb-4 flex items-center"
                                >
                                  Read more{" "}
                                  <ChevronDown size={14} className="ml-1" />
                                </button>
                              )}

                            {expandedEntry === entry.id && (
                              <button
                                onClick={() => toggleExpand(entry.id)}
                                className="text-sm text-pink-500 hover:text-pink-600 font-medium mb-4 flex items-center"
                              >
                                Show less{" "}
                                <ChevronUp size={14} className="ml-1" />
                              </button>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {entry.images && entry.images.length > 0 && (
                        <motion.div
                          className="mt-4"
                          initial={{ opacity: 0, y: 10 }}
                          animate={
                            visibleEntries.includes(entry.id)
                              ? { opacity: 1, y: 0 }
                              : { opacity: 0, y: 10 }
                          }
                          transition={{ delay: 0.2 }}
                        >
                          <ImageGallery images={entry.images} />
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Memory"
        description="Are you sure you want to delete this memory? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="delete"
      />
    </div>
  );
};

export default Timeline;
