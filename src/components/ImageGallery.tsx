
import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'framer-motion';

type ImageGalleryProps = {
  images: string[];
};

const ImageGallery: React.FC<ImageGalleryProps> = ({ images }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const openGallery = useCallback((index: number) => {
    setCurrentIndex(index);
    setIsOpen(true);
  }, []);
  
  const nextImage = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images]);
  
  const prevImage = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images]);

  const renderGalleryGrid = () => {
    if (images.length === 0) return null;
    
    if (images.length === 1) {
      return (
        <motion.div 
          className="w-full h-48 md:h-64 cursor-pointer overflow-hidden rounded-md"
          whileHover={{ scale: 1.05 }}
          onClick={() => openGallery(0)}
        >
          <img 
            src={images[0]} 
            alt="Gallery item" 
            className="w-full h-full object-cover transition-transform duration-300" 
          />
        </motion.div>
      );
    }
    
    if (images.length === 2) {
      return (
        <div className="grid grid-cols-2 gap-2 h-48 md:h-64">
          {images.map((image, index) => (
            <motion.div 
              key={index}
              className="overflow-hidden rounded-md cursor-pointer"
              whileHover={{ scale: 1.05 }}
              onClick={() => openGallery(index)}
            >
              <img 
                src={image} 
                alt={`Gallery item ${index + 1}`} 
                className="w-full h-full object-cover" 
              />
            </motion.div>
          ))}
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-3 gap-2">
        {/* First large image */}
        <motion.div 
          className="col-span-2 row-span-2 h-48 md:h-64 overflow-hidden rounded-md cursor-pointer"
          whileHover={{ scale: 1.05 }}
          onClick={() => openGallery(0)}
        >
          <img 
            src={images[0]} 
            alt="Gallery featured item" 
            className="w-full h-full object-cover" 
          />
        </motion.div>
        
        {/* Additional images */}
        <div className="space-y-2">
          {images.slice(1, 3).map((image, index) => (
            <motion.div 
              key={index}
              className="h-[calc(24rem/4)] md:h-[calc(16rem/2)] overflow-hidden rounded-md cursor-pointer"
              whileHover={{ scale: 1.05 }}
              onClick={() => openGallery(index + 1)}
            >
              <img 
                src={image} 
                alt={`Gallery item ${index + 2}`}
                className="w-full h-full object-cover" 
              />
            </motion.div>
          ))}
        </div>
        
        {/* "View all" button if more than 3 images */}
        {images.length > 3 && (
          <div 
            className="col-span-3 h-12 mt-2 bg-romance-primary/10 rounded-md flex items-center justify-center cursor-pointer"
            onClick={() => openGallery(0)}
          >
            <span className="text-romance-primary font-medium">
              View all {images.length} photos
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {renderGalleryGrid()}
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-5xl w-[calc(100%-2rem)] p-0 bg-transparent border-0 shadow-none">
          <div className="relative w-full">
            {/* Close button */}
            <Button
              className="absolute top-4 right-4 rounded-full w-8 h-8 p-0 z-50 bg-black/40 hover:bg-black/60 text-white"
              onClick={() => setIsOpen(false)}
            >
              <X size={18} />
            </Button>
            
            {/* Image container with animation */}
            <AnimatePresence mode="wait">
              <motion.div 
                key={currentIndex}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="relative flex items-center justify-center min-h-[50vh] bg-black/90 rounded-lg overflow-hidden"
              >
                <img
                  src={images[currentIndex]}
                  alt={`Gallery image ${currentIndex + 1}`}
                  className="max-h-[80vh] max-w-full object-contain"
                />
                
                {/* Navigation arrows, only shown if more than 1 image */}
                {images.length > 1 && (
                  <>
                    <Button
                      className="absolute left-4 rounded-full w-10 h-10 p-0 bg-black/40 hover:bg-black/60 text-white"
                      onClick={prevImage}
                    >
                      <ChevronLeft size={24} />
                    </Button>
                    <Button
                      className="absolute right-4 rounded-full w-10 h-10 p-0 bg-black/40 hover:bg-black/60 text-white"
                      onClick={nextImage}
                    >
                      <ChevronRight size={24} />
                    </Button>
                    
                    {/* Image counter */}
                    <div className="absolute bottom-4 left-0 right-0 text-center text-white text-sm">
                      {currentIndex + 1} / {images.length}
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ImageGallery;
