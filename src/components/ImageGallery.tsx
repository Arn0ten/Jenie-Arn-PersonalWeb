"use client";

import type React from "react";
import { useState, useCallback, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X, ZoomIn, Heart } from "lucide-react";
import { Button } from "./ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useLikes } from "../contexts/LikesContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type ImageGalleryProps = {
  images: string[];
};

const ImageGallery: React.FC<ImageGalleryProps> = ({ images }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const {
    isLiked,
    toggleLike,
    getLikeCount,
    refreshLikesForImages,
    isLoading: likesLoading,
  } = useLikes();
  const [showHeartAnimation, setShowHeartAnimation] = useState<boolean>(false);
  const heartAnimationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track if we're in the middle of a like operation to prevent race conditions
  const likeInProgressRef = useRef<{ [key: string]: boolean }>({});

  // Load like counts for all images when component mounts
  useEffect(() => {
    if (images.length > 0) {
      refreshLikesForImages(images);
    }
  }, [images, refreshLikesForImages]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (heartAnimationTimeoutRef.current) {
        clearTimeout(heartAnimationTimeoutRef.current);
      }
    };
  }, []);

  const openGallery = useCallback((index: number) => {
    setCurrentIndex(index);
    setIsOpen(true);
    setLoading(true);
  }, []);

  const nextImage = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setCurrentIndex((prev) => {
        const next = (prev + 1) % images.length;
        setLoading(true);
        return next;
      });
    },
    [images],
  );

  const prevImage = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setCurrentIndex((prev) => {
        const next = (prev - 1 + images.length) % images.length;
        setLoading(true);
        return next;
      });
    },
    [images],
  );

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "ArrowRight") {
        setCurrentIndex((prev) => {
          const next = (prev + 1) % images.length;
          setLoading(true);
          return next;
        });
      } else if (e.key === "ArrowLeft") {
        setCurrentIndex((prev) => {
          const next = (prev - 1 + images.length) % images.length;
          setLoading(true);
          return next;
        });
      } else if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, images.length]);

  // Helper for grid images
  const [gridLoading, setGridLoading] = useState<{ [key: number]: boolean }>(
    {},
  );
  const handleGridLoad = (index: number) => {
    setGridLoading((prev) => ({ ...prev, [index]: false }));
  };

  const handleToggleLike = async (imageUrl: string, e: React.MouseEvent) => {
    e.stopPropagation();

    // Prevent multiple rapid clicks from causing race conditions
    if (likeInProgressRef.current[imageUrl]) {
      return;
    }

    // Mark this image as having a like operation in progress
    likeInProgressRef.current[imageUrl] = true;

    const wasLiked = isLiked(imageUrl);

    // Trigger animation and optimistic UI update immediately
    if (!wasLiked) {
      setShowHeartAnimation(true);

      if (heartAnimationTimeoutRef.current) {
        clearTimeout(heartAnimationTimeoutRef.current);
      }
      heartAnimationTimeoutRef.current = setTimeout(() => {
        setShowHeartAnimation(false);
      }, 1000);
    }

    // Fire the async call and wait for it to complete
    await toggleLike(imageUrl);

    // Clear the in-progress flag
    likeInProgressRef.current[imageUrl] = false;
  };

  // Calculate total likes for this gallery
  const totalLikes = images.reduce(
    (total, image) => total + getLikeCount(image),
    0,
  );

  const renderGalleryGrid = () => {
    if (images.length === 0) return null;

    if (images.length === 1) {
      return (
        <motion.div
          className="w-full h-48 md:h-64 cursor-pointer overflow-hidden rounded-lg relative group"
          whileHover={{ scale: 1.02 }}
          onClick={() => openGallery(0)}
        >
          <img
            src={gridLoading[0] === false ? images[0] : "/load-gallery.png"}
            alt="Gallery item"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onLoad={() => handleGridLoad(0)}
            onError={() => handleGridLoad(0)}
            style={{ display: "block" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileHover={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="text-white flex items-center"
            >
              <ZoomIn size={16} className="mr-1" />
              <span className="text-sm font-medium">View Image</span>
            </motion.div>
          </div>
          <LikeButton
            imageUrl={images[0]}
            isLiked={isLiked(images[0])}
            likeCount={getLikeCount(images[0])}
            onToggleLike={(e) => handleToggleLike(images[0], e)}
            position="top-right"
          />
        </motion.div>
      );
    }

    if (images.length === 2) {
      return (
        <div className="grid grid-cols-2 gap-2 h-48 md:h-64 relative">
          {images.map((image, index) => (
            <motion.div
              key={index}
              className="overflow-hidden rounded-lg cursor-pointer relative group"
              whileHover={{ scale: 1.02 }}
              onClick={() => openGallery(index)}
              onMouseEnter={() => setHoverIndex(index)}
              onMouseLeave={() => setHoverIndex(null)}
            >
              <img
                src={gridLoading[index] === false ? image : "/load-gallery.png"}
                alt={`Gallery item ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                onLoad={() => handleGridLoad(index)}
                onError={() => handleGridLoad(index)}
                style={{ display: "block" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileHover={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-white flex items-center"
                >
                  <ZoomIn size={16} className="mr-1" />
                  <span className="text-sm font-medium">View Image</span>
                </motion.div>
              </div>
              <LikeButton
                imageUrl={image}
                isLiked={isLiked(image)}
                likeCount={getLikeCount(image)}
                onToggleLike={(e) => handleToggleLike(image, e)}
                position="top-right"
              />
            </motion.div>
          ))}
        </div>
      );
    }

    // Instagram-like grid for 3+ images
    // Custom layout: 1 large on the left, 2 stacked on the right, "X more" overlay on the last if more than 3 images
    return (
      <div className="grid grid-cols-3 gap-1 md:gap-2 relative h-60 md:h-80">
        {/* Large image on the left */}
        <motion.div
          className="col-span-2 row-span-2 h-full overflow-hidden rounded-lg cursor-pointer relative group flex"
          whileHover={{ scale: 1.01 }}
          onClick={() => openGallery(0)}
        >
          <div className="w-full h-full flex">
            <img
              src={gridLoading[0] === false ? images[0] : "/load-gallery.png"}
              alt="Gallery featured item"
              className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
              onLoad={() => handleGridLoad(0)}
              onError={() => handleGridLoad(0)}
              style={{ display: "block", aspectRatio: "2/3" }}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileHover={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="text-white flex items-center"
            >
              <ZoomIn size={18} className="mr-1" />
              <span className="text-sm font-medium">View Gallery</span>
            </motion.div>
          </div>
          <LikeButton
            imageUrl={images[0]}
            isLiked={isLiked(images[0])}
            likeCount={getLikeCount(images[0])}
            onToggleLike={(e) => handleToggleLike(images[0], e)}
            position="top-right"
          />
        </motion.div>

        {/* Two stacked images on the right */}
        <div className="col-span-1 flex flex-col gap-1 md:gap-2 h-full">
          {[1, 2].map((i) => {
            if (!images[i]) return null;
            const isLast = i === 2;
            return (
              <motion.div
                key={i}
                className="flex-1 overflow-hidden rounded-lg cursor-pointer relative group flex"
                whileHover={{ scale: 1.05 }}
                onClick={() => openGallery(i)}
                style={{ minHeight: 0 }}
              >
                <div className="w-full h-full flex">
                  <img
                    src={
                      gridLoading[i] === false ? images[i] : "/load-gallery.png"
                    }
                    alt={`Gallery item ${i + 1}`}
                    className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
                    onLoad={() => handleGridLoad(i)}
                    onError={() => handleGridLoad(i)}
                    style={{ display: "block", aspectRatio: "1/1" }}
                  />
                </div>
                {/* Show "more" overlay on the last visible image if there are more than 3 images */}
                {isLast && images.length > 3 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-white text-lg font-bold">
                      +{images.length - 3} more
                    </span>
                  </div>
                )}
                <LikeButton
                  imageUrl={images[i]}
                  isLiked={isLiked(images[i])}
                  likeCount={getLikeCount(images[i])}
                  onToggleLike={(e) => handleToggleLike(images[i], e)}
                  position="top-right"
                  size="small"
                />
              </motion.div>
            );
          })}
        </div>
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

            {/* Image container - removed animation for navigation */}
            <div className="relative flex items-center justify-center min-h-[50vh] bg-black/90 rounded-lg overflow-hidden mt-4 mb-4">
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center  bg-black/80">
                  <img
                    src="/load-gallery.png"
                    alt="Loading"
                    className="w-16 h-16 animate-pulse"
                  />
                </div>
              )}

              <img
                src={images[currentIndex]}
                alt={`Gallery image ${currentIndex + 1}`}
                className="max-h-[80vh] max-w-full object-contain"
                onLoad={() => setLoading(false)}
                onError={() => setLoading(false)}
                style={{
                  opacity: loading ? 0 : 1,
                }}
              />

              {/* Heart animation overlay */}
              <AnimatePresence>
                {showHeartAnimation && (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center pointer-events-none "
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1.5 }}
                    exit={{ opacity: 0, scale: 2 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  >
                    <Heart
                      size={120}
                      className="text-white fill-pink-500 drop-shadow-lg"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation arrows, only shown if more than 1 image */}
              {images.length > 1 && (
                <>
                  <Button
                    className="absolute left-4 rounded-full w-10 h-10 p-0 bg-black/40 hover:bg-black/60 text-white transform transition-transform hover:scale-110 "
                    onClick={prevImage}
                  >
                    <ChevronLeft size={24} />
                  </Button>
                  <Button
                    className="absolute right-4 rounded-full w-10 h-10 p-0 bg-black/40 hover:bg-black/60 text-white transform transition-transform hover:scale-110 "
                    onClick={nextImage}
                  >
                    <ChevronRight size={24} />
                  </Button>

                  {/* Image counter */}
                  <div className="absolute bottom-4 left-0 right-0 text-center">
                    <span className="bg-black/50 text-white text-sm px-3 py-1 rounded-full">
                      {currentIndex + 1} / {images.length}
                    </span>
                  </div>
                </>
              )}

              {/* Like button */}
              <LikeButton
                imageUrl={images[currentIndex]}
                isLiked={isLiked(images[currentIndex])}
                likeCount={getLikeCount(images[currentIndex])}
                onToggleLike={(e) => handleToggleLike(images[currentIndex], e)}
                position="bottom-left"
                size="large"
                showCount={true}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

interface LikeButtonProps {
  imageUrl: string;
  isLiked: boolean;
  likeCount: number;
  onToggleLike: (e: React.MouseEvent) => void;
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  size?: "small" | "medium" | "large";
  showCount?: boolean;
}

const LikeButton: React.FC<LikeButtonProps> = ({
  imageUrl,
  isLiked,
  likeCount,
  onToggleLike,
  position,
  size = "medium",
  showCount = false,
}) => {
  const positionClasses = {
    "top-left": "top-2 left-2",
    "top-right": "top-2 right-2",
    "bottom-left": "bottom-2 left-2",
    "bottom-right": "bottom-2 right-2",
  };

  const sizeClasses = {
    small: "h-6 w-6",
    medium: "h-8 w-8",
    large: "h-10 w-10",
  };

  const iconSizes = {
    small: 12,
    medium: 16,
    large: 20,
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            className={`absolute ${positionClasses[position]} `}
            initial={{ opacity: 0 }}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            animate={{ opacity: 1 }}
            style={{ pointerEvents: "auto" }}
          >
            <Button
              variant="ghost"
              size="icon"
              className={`rounded-full bg-black/20 hover:bg-black/40 ${sizeClasses[size]} flex items-center justify-center `}
              onClick={onToggleLike}
              style={{ zIndex: 10 }}
            >
              <Heart
                size={iconSizes[size]}
                className={isLiked ? "fill-red-500 text-red-500" : "text-white"}
              />
              {showCount && likeCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-medium">
                  {likeCount}
                </span>
              )}
            </Button>
          </motion.div>
        </TooltipTrigger>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ImageGallery;
