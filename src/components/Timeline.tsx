import React, { useState, useEffect } from "react";
import { useInView } from "framer-motion";
import {
  getTimelineEntries,
  TimelineEntry,
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
import { Trash2, Edit, Plus, Calendar, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ImageGallery from "./ImageGallery";
import { motion } from "framer-motion";

const Timeline = () => {
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<TimelineEntry | null>(
    null,
  );
  const [isEditing, setIsEditing] = useState(false);
  const { isLoggedIn, userName } = useAuth();
  const { toast } = useToast();

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

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      try {
        await deleteTimelineEntry(id);
        setEntries(entries.filter((entry) => entry.id !== id));
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
      }
    }
  };

  const handleEditSuccess = () => {
    fetchTimelineEntries();
    setIsEditing(false);
    setSelectedEntry(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <img
            src="/load-timeline.png"
            alt="Loading"
            className="animate-pulse mb-4"
            style={{ width: 96, height: 96 }}
          />
          <div className="animate-pulse text-romance-primary text-lg">
            Loading your journey...
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
        staggerChildren: 0.2,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

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
          className="flex justify-between items-center mb-12 flex-wrap"
        >
          <h2 className="text-3xl md:text-4xl text-romance-primary font-bold cursive w-full sm:w-auto">
            Our Journey Together
          </h2>

          {isLoggedIn && (
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-romance-primary hover:bg-romance-secondary text-white">
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
          )}
        </motion.div>

        {entries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <p className="text-lg text-gray-500">No memories added yet.</p>
            {isLoggedIn && (
              <p className="mt-2 text-romance-primary">
                Click "Add Memory" to create your first entry!
              </p>
            )}
          </motion.div>
        ) : (
          <motion.div
            className="relative timeline-container"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {entries.map((entry, index) => (
              <motion.div
                key={entry.id}
                className="timeline-item mb-16 relative"
                variants={item}
              >
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${getTimelineColor(index)}`}
                ></div>

                <div className="absolute left-[-10px] top-0 w-5 h-5 rounded-full bg-romance-primary border-4 border-white shadow-sm"></div>

                <div className="ml-8 bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow relative">
                  {entry.is_monthsary && (
                    <div className="absolute -top-3 -right-3 bg-romance-primary text-white rounded-full p-2">
                      <Heart className="h-4 w-4 fill-white" />
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-3 flex-wrap">
                    <time className="text-sm text-romance-secondary font-medium flex items-center">
                      {format(new Date(entry.date), "MMMM d, yyyy")}
                      {entry.is_monthsary && (
                        <span className="ml-2 text-xs bg-romance-accent text-romance-primary px-2 py-0.5 rounded-full">
                          Monthsary
                        </span>
                      )}
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
                                setSelectedEntry(entry);
                                setIsEditing(true);
                              }}
                            >
                              <Edit size={14} />
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
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive-foreground hover:bg-destructive"
                          onClick={() => handleDelete(entry.id)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-romance-primary mb-2">
                    {entry.title}
                  </h3>
                  <p className="text-gray-700 mb-4 whitespace-pre-line">
                    {entry.description}
                  </p>

                  {entry.images && entry.images.length > 0 && (
                    <div className="mt-4">
                      <ImageGallery images={entry.images} />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Timeline;
