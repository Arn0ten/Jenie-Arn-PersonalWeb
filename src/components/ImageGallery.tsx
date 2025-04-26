import React, { useState, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "./ui/button";
import { motion, AnimatePresence } from "framer-motion";

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

  const nextImage = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setCurrentIndex((prev) => (prev + 1) % images.length);
    },
    [images],
  );

  const prevImage = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    },
    [images],
  );

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
        <DialogContent className="flex items-center justify-center bg-black/80 p-0 border-0 shadow-none">
          <div className="relative w-full h-full max-w-5xl max-h-[calc(100vh-4rem)] flex items-center justify-center my-8">
            {/* Close Button */}
            <Button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 z-50 rounded-full w-10 h-10 p-0 bg-black/50 hover:bg-black/70 text-white"
            >
              <X size={20} />
            </Button>

            {/* Swipeable Image Area */}
            <AnimatePresence initial={false} mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={(e, info) => {
                  if (info.offset.x < -100) {
                    nextImage({
                      stopPropagation: () => {},
                    } as React.MouseEvent); // swipe left
                  } else if (info.offset.x > 100) {
                    prevImage({
                      stopPropagation: () => {},
                    } as React.MouseEvent); // swipe right
                  }
                }}
                className="relative flex items-center justify-center w-full h-full"
              >
                {/* Left Button */}
                {images.length > 1 && (
                  <Button
                    onClick={prevImage}
                    className="absolute left-4 z-40 rounded-full w-10 h-10 p-0 bg-black/50 hover:bg-black/70 text-white"
                  >
                    <ChevronLeft size={24} />
                  </Button>
                )}

                {/* Image without zooming */}
                <div className="flex items-center justify-center max-w-full max-h-full p-4">
                  <img
                    src={images[currentIndex]}
                    alt={`Gallery image ${currentIndex + 1}`}
                    className="object-scale-down max-w-full max-h-[75vh] rounded-lg shadow-md"
                  />
                </div>

                {/* Right Button */}
                {images.length > 1 && (
                  <Button
                    onClick={nextImage}
                    className="absolute right-4 z-40 rounded-full w-10 h-10 p-0 bg-black/50 hover:bg-black/70 text-white"
                  >
                    <ChevronRight size={24} />
                  </Button>
                )}

                {/* Image Counter */}
                {images.length > 1 && (
                  <div className="absolute bottom-4 w-full text-center text-white text-xs tracking-wide">
                    {currentIndex + 1} / {images.length}
                  </div>
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
