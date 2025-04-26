
import React, { useState, useEffect } from 'react';
import { getTimelineEntries, TimelineEntry, deleteTimelineEntry } from '../lib/supabase';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import TimelineForm from './TimelineForm';
import { Trash2, Edit, Plus, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ImageGallery from './ImageGallery';

const Timeline = () => {
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<TimelineEntry | null>(null);
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
      // Sort entries by date (newest first)
      const sortedEntries = [...data].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setEntries(sortedEntries);
    } catch (error) {
      console.error('Error fetching timeline entries:', error);
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
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        await deleteTimelineEntry(id);
        setEntries(entries.filter(entry => entry.id !== id));
        toast({
          title: "Entry deleted",
          description: "Timeline entry has been removed",
        });
      } catch (error) {
        console.error('Error deleting entry:', error);
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
        <div className="animate-pulse text-romance-primary">Loading timeline...</div>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl md:text-4xl text-romance-primary font-bold cursive">Our Journey Together</h2>
          
          {isLoggedIn && (
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-romance-primary hover:bg-romance-secondary text-white">
                  <Plus size={16} className="mr-1" /> Add Memory
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Add New Memory</DialogTitle>
                </DialogHeader>
                <TimelineForm onSuccess={handleEditSuccess} userName={userName || ''} />
              </DialogContent>
            </Dialog>
          )}
        </div>

        {entries.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg text-gray-500">No memories added yet.</p>
            {isLoggedIn && (
              <p className="mt-2 text-romance-primary">Click "Add Memory" to create your first entry!</p>
            )}
          </div>
        ) : (
          <div className="relative timeline-container">
            {entries.map((entry, index) => (
              <div 
                key={entry.id} 
                className={`timeline-item mb-12 animate-fade-in`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="timeline-dot"></div>
                <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow relative">
                  {entry.is_monthsary && (
                    <div className="absolute -top-3 -right-3 bg-romance-primary text-white rounded-full p-2">
                      <Calendar size={18} />
                    </div>
                  )}
                  
                  <div className="flex justify-between items-start mb-3">
                    <time className="text-sm text-romance-secondary font-medium flex items-center">
                      {format(new Date(entry.date), 'MMMM d, yyyy')}
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
                          <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                              <DialogTitle>Edit Memory</DialogTitle>
                            </DialogHeader>
                            {selectedEntry && isEditing && (
                              <TimelineForm 
                                entry={selectedEntry} 
                                onSuccess={handleEditSuccess} 
                                userName={userName || ''}
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
                  
                  <h3 className="text-xl font-bold text-romance-primary mb-2">{entry.title}</h3>
                  <p className="text-gray-700 mb-4 whitespace-pre-line">{entry.description}</p>
                  
                  {entry.images && entry.images.length > 0 && (
                    <ImageGallery images={entry.images} />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Timeline;
