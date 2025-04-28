"use client";

import { useState, useEffect, useRef } from "react";
import {
  getTimelineEntries,
  type TimelineEntry,
  deleteTimelineEntry,
} from "../lib/supabase";
import { format, parse, getYear } from "date-fns";
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
import { Checkbox } from "@/components/ui/checkbox";
// Add imports for real-time functionality
import { subscribeToTimelineChanges } from "../lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";

const Timeline = () => {
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<TimelineEntry[]>([]);
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
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [monthFilter, setMonthFilter] = useState<string>("all");
  const [onlyMonthsary, setOnlyMonthsary] = useState(false);
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [availableMonths, setAvailableMonths] = useState<
    { value: string; label: string }[]
  >([]);
  const [isButtonsSticky, setIsButtonsSticky] = useState(false);
  // Add state for subscription
  const [subscription, setSubscription] = useState<RealtimeChannel | null>(
    null,
  );
  // Add a new state for filter dialog
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);

  // Refs for scroll animations
  const timelineRef = useRef<HTMLDivElement>(null);
  const [visibleEntries, setVisibleEntries] = useState<number[]>([]);

  useEffect(() => {
    fetchTimelineEntries();

    // Add scroll event listener for scroll-to-top button and sticky buttons
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
      setIsButtonsSticky(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Set up real-time subscription when component mounts
  useEffect(() => {
    const setupRealtime = () => {
      // Clean up any existing subscription
      if (subscription) {
        subscription.unsubscribe();
      }

      // Create a new subscription
      const newSubscription = subscribeToTimelineChanges((payload) => {
        console.log("Timeline change received:", payload);

        // Handle different types of changes
        if (payload.eventType === "INSERT") {
          // A new entry was added
          const newEntry = payload.new as TimelineEntry;
          setEntries((prevEntries) => {
            // Check if the entry already exists to avoid duplicates
            if (prevEntries.some((entry) => entry.id === newEntry.id)) {
              return prevEntries;
            }
            // Add the new entry and sort
            const updatedEntries = [...prevEntries, newEntry];
            const sortedEntries = updatedEntries.sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
            );

            // Show a toast notification for new entries
            if (!isLoading) {
              toast({
                title: "New memory added",
                description: `"${newEntry.title}" was just added to the timeline`,
                variant: "default",
              });
            }

            return sortedEntries;
          });
        } else if (payload.eventType === "UPDATE") {
          // An entry was updated
          const updatedEntry = payload.new as TimelineEntry;
          setEntries((prevEntries) => {
            const updated = prevEntries.map((entry) =>
              entry.id === updatedEntry.id ? updatedEntry : entry,
            );

            // Show a toast notification for updates
            if (!isLoading) {
              toast({
                title: "Memory updated",
                description: `"${updatedEntry.title}" was just updated`,
                variant: "default",
              });
            }

            return updated;
          });
        } else if (payload.eventType === "DELETE") {
          // An entry was deleted
          const deletedEntry = payload.old as TimelineEntry;
          setEntries((prevEntries) => {
            // Show a toast notification for deletions
            if (
              !isLoading &&
              prevEntries.some((entry) => entry.id === deletedEntry.id)
            ) {
              toast({
                title: "Memory removed",
                description: `"${deletedEntry.title}" was removed from the timeline`,
                variant: "default",
              });
            }

            return prevEntries.filter((entry) => entry.id !== deletedEntry.id);
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

  // Modify the fetchTimelineEntries function to not set filtered entries directly
  const fetchTimelineEntries = async () => {
    setIsLoading(true);
    try {
      const data = await getTimelineEntries();
      console.log("Timeline entries fetched:", data);

      const sortedEntries = [...data].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
      setEntries(sortedEntries);
      // Filtered entries will be updated by the useEffect that watches entries

      // Extract available years and months for filtering
      const years = new Set<string>();
      const months = new Set<string>();

      sortedEntries.forEach((entry) => {
        const date = new Date(entry.date);
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

  // Update the filtered entries whenever entries change
  useEffect(() => {
    if (entries.length === 0) return;

    let filtered = [...entries];

    // Filter by year
    if (yearFilter !== "all") {
      filtered = filtered.filter((entry) => {
        const entryYear = getYear(new Date(entry.date)).toString();
        return entryYear === yearFilter;
      });
    }

    // Filter by month
    if (monthFilter !== "all") {
      filtered = filtered.filter((entry) => {
        const entryMonth = format(new Date(entry.date), "MM");
        return entryMonth === monthFilter;
      });
    }

    // Filter monthsaries
    if (onlyMonthsary) {
      filtered = filtered.filter((entry) => entry.is_monthsary);
    }

    setFilteredEntries(filtered);

    // Collect all image URLs to fetch like counts
    const allImageUrls = filtered.flatMap((entry) => entry.images || []);
    if (allImageUrls.length > 0) {
      refreshLikesForImages(allImageUrls);
    }
  }, [entries, yearFilter, monthFilter, onlyMonthsary]);

  // Reset filters
  const resetFilters = () => {
    setYearFilter("all");
    setMonthFilter("all");
    setOnlyMonthsary(false);
    setIsFilterDialogOpen(false); // Close the dialog when resetting filters
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
  }, [isLoading, filteredEntries, visibleEntries]);

  const confirmDelete = (id: number) => {
    setEntryToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (entryToDelete === null) return;

    try {
      await deleteTimelineEntry(entryToDelete);
      setEntries(entries.filter((entry) => entry.id !== entryToDelete));
      setFilteredEntries(
        filteredEntries.filter((entry) => entry.id !== entryToDelete),
      );
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
          <motion.img
            src="/load-timeline.png"
            alt="Loading"
            className="mb-4"
            style={{ width: 96, height: 96 }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.7, 1, 0.7],
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
          className="flex justify-between items-center mb-8 flex-wrap"
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

          <div></div>
        </motion.div>

        {/* Filter Panel */}
        <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-romance-primary">
                Filter Memories
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

              <div className="flex items-center space-x-2 mt-2">
                <Checkbox
                  id="monthsary-only"
                  checked={onlyMonthsary}
                  onCheckedChange={(checked) =>
                    setOnlyMonthsary(checked as boolean)
                  }
                />
                <label
                  htmlFor="monthsary-only"
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  Monthsary only
                </label>
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
        {(yearFilter !== "all" || monthFilter !== "all" || onlyMonthsary) && (
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
            {onlyMonthsary && (
              <Badge
                className="bg-romance-primary/20 text-romance-primary hover:bg-romance-primary/30 cursor-pointer"
                onClick={() => setOnlyMonthsary(false)}
              >
                Monthsary Only <X size={14} className="ml-1" />
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

        {filteredEntries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center py-16 bg-white rounded-lg shadow-md"
          >
            {entries.length === 0 ? (
              <>
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
              </>
            ) : (
              <>
                <p className="text-lg text-gray-500">
                  No memories match your filters.
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
                  to see all memories.
                </motion.p>
              </>
            )}
          </motion.div>
        ) : (
          <motion.div
            ref={timelineRef}
            className="relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Mobile Timeline */}
            <div className="md:hidden space-y-6">
              {filteredEntries.map((entry, index) => {
                const totalLikes = getEntryTotalLikes(entry);
                return (
                  <motion.div
                    key={entry.id}
                    data-entry-id={entry.id}
                    className="timeline-entry bg-white rounded-lg shadow-lg overflow-hidden"
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
                    {/* Decorative top gradient bar */}
                    <div
                      className={`h-2 w-full bg-gradient-to-r ${getTimelineColor(index)}`}
                    ></div>

                    <div className="p-5">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center space-x-2">
                          <div className="bg-romance-primary/10 p-2 rounded-full">
                            <Calendar
                              size={18}
                              className="text-romance-primary"
                            />
                          </div>
                          <time className="text-sm text-romance-secondary font-medium">
                            {format(new Date(entry.date), "MMMM d, yyyy")}
                          </time>
                        </div>

                        <div className="flex items-center space-x-2">
                          {entry.is_monthsary && (
                            <span className="text-xs bg-romance-accent text-romance-primary px-2 py-0.5 rounded-full">
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
                      </div>

                      <motion.div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => toggleExpand(entry.id)}
                      >
                        <motion.h3
                          className="text-xl font-bold text-romance-primary"
                          whileHover={{ scale: 1.01 }}
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
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleExpand(entry.id);
                                  }}
                                  className="text-sm text-pink-500 hover:text-pink-600 font-medium mb-4 flex items-center"
                                >
                                  Read more{" "}
                                  <ChevronDown size={14} className="ml-1" />
                                </button>
                              )}

                            {expandedEntry === entry.id && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleExpand(entry.id);
                                }}
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

                      {isLoggedIn && (
                        <div className="flex justify-end space-x-2 mt-4">
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
                  </motion.div>
                );
              })}
            </div>

            {/* Desktop Timeline */}
            <div className="hidden md:block relative">
              {/* Timeline central line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-pink-500 via-pink-300 to-pink-100 transform -translate-x-1/2 z-0">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-pink-500 shadow-lg shadow-pink-300/50"></div>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-4 h-4 rounded-full bg-pink-300 shadow-lg shadow-pink-200/50"></div>
              </div>

              {filteredEntries.map((entry, index) => {
                const totalLikes = getEntryTotalLikes(entry);
                const isLeft = index % 2 === 0;

                return (
                  <motion.div
                    key={entry.id}
                    data-entry-id={entry.id}
                    className={`timeline-entry mb-16 relative w-[calc(50%-20px)] ${isLeft ? "mr-auto" : "ml-auto"}`}
                    initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
                    animate={
                      visibleEntries.includes(entry.id)
                        ? { opacity: 1, x: 0 }
                        : { opacity: 0, x: isLeft ? -30 : 30 }
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
                    {/* Timeline dot */}
                    <motion.div
                      className="absolute top-6 w-6 h-6 rounded-full border-4 border-white shadow-xl z-10"
                      style={{
                        left: isLeft ? "auto" : "-12px",
                        right: isLeft ? "-12px" : "auto",
                        background: `linear-gradient(135deg, #F472B6, #FECDD3)`,
                      }}
                      whileHover={{ scale: 1.3, rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    />

                    {/* Date bubble */}
                    <motion.div
                      className={`absolute top-6 items-center ${
                        isLeft
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
                                <Heart
                                  size={12}
                                  className="mr-1 fill-pink-500"
                                />
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
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleExpand(entry.id);
                                    }}
                                    className="text-sm text-pink-500 hover:text-pink-600 font-medium mb-4 flex items-center"
                                  >
                                    Read more{" "}
                                    <ChevronDown size={14} className="ml-1" />
                                  </button>
                                )}

                              {expandedEntry === entry.id && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleExpand(entry.id);
                                  }}
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
            </div>
          </motion.div>
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
      <div className="fixed bottom-24 left-4 z-50 flex flex-col gap-2">
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
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto pb-20 sm:pb-6">
              <DialogHeader>
                <DialogTitle>Add New Memory</DialogTitle>
              </DialogHeader>
              <TimelineForm
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
          {(yearFilter !== "all" || monthFilter !== "all" || onlyMonthsary) && (
            <Badge className="absolute -top-2 -right-2 bg-romance-primary text-white">
              {(yearFilter !== "all" ? 1 : 0) +
                (monthFilter !== "all" ? 1 : 0) +
                (onlyMonthsary ? 1 : 0)}
            </Badge>
          )}
        </motion.button>
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
