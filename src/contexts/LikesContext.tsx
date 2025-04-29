"use client";

import type React from "react";
import {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  useRef,
} from "react";
import {
  getVisitorIpAddress,
  getLikedImages,
  toggleImageLike,
  getAllImageLikesCounts,
} from "../lib/supabase";

interface LikesContextType {
  likedImages: Set<string>;
  likeCounts: Record<string, number>;
  isLoading: boolean;
  toggleLike: (imageUrl: string) => Promise<void>;
  isLiked: (imageUrl: string) => boolean;
  getLikeCount: (imageUrl: string) => number;
  refreshLikesForImages: (imageUrls: string[]) => Promise<void>;
}

const LikesContext = createContext<LikesContextType>({
  likedImages: new Set(),
  likeCounts: {},
  isLoading: true,
  toggleLike: async () => {},
  isLiked: () => false,
  getLikeCount: () => 0,
  refreshLikesForImages: async () => {},
});

export const useLikes = () => useContext(LikesContext);

interface LikesProviderProps {
  children: React.ReactNode;
}

export const LikesProvider: React.FC<LikesProviderProps> = ({ children }) => {
  const [likedImages, setLikedImages] = useState<Set<string>>(new Set());
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [visitorIp, setVisitorIp] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Track in-progress toggle operations to prevent race conditions
  const pendingToggles = useRef<Set<string>>(new Set());

  // Fetch visitor IP on mount
  useEffect(() => {
    const fetchIp = async () => {
      try {
        const ip = await getVisitorIpAddress();
        setVisitorIp(ip);

        // Once we have the IP, fetch the images this visitor has liked
        const likedImageUrls = await getLikedImages(ip);
        setLikedImages(new Set(likedImageUrls));
      } catch (error) {
        console.error("Error initializing likes system:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchIp();
  }, []);

  // Function to toggle like status for an image
  const toggleLike = useCallback(
    async (imageUrl: string) => {
      if (!visitorIp) return;

      // Prevent multiple simultaneous toggle operations for the same image
      if (pendingToggles.current.has(imageUrl)) {
        console.log("Toggle operation already in progress for", imageUrl);
        return;
      }

      try {
        pendingToggles.current.add(imageUrl);

        // Optimistically update UI before API call completes
        const wasLiked = likedImages.has(imageUrl);
        const optimisticLikeCount = likeCounts[imageUrl] || 0;

        // Optimistic UI update
        setLikedImages((prev) => {
          const newSet = new Set(prev);
          if (wasLiked) {
            newSet.delete(imageUrl);
          } else {
            newSet.add(imageUrl);
          }
          return newSet;
        });

        setLikeCounts((prev) => ({
          ...prev,
          [imageUrl]: optimisticLikeCount + (wasLiked ? -1 : 1),
        }));

        // Make the actual API call
        const isNowLiked = await toggleImageLike(imageUrl, visitorIp);

        // If the server response doesn't match our optimistic update, correct it
        setLikedImages((prev) => {
          const newSet = new Set(prev);
          if (isNowLiked) {
            newSet.add(imageUrl);
          } else {
            newSet.delete(imageUrl);
          }
          return newSet;
        });

        // Update like count based on the actual server response
        setLikeCounts((prev) => ({
          ...prev,
          [imageUrl]:
            (prev[imageUrl] || 0) - (wasLiked ? 1 : 0) + (isNowLiked ? 1 : 0),
        }));
      } catch (error) {
        console.error("Error toggling like:", error);

        // Revert optimistic updates on error
        setLikedImages((prev) => {
          const newSet = new Set(prev);
          if (likedImages.has(imageUrl)) {
            newSet.delete(imageUrl);
          } else {
            newSet.add(imageUrl);
          }
          return newSet;
        });

        // Also revert the count
        const wasLiked = likedImages.has(imageUrl);
        setLikeCounts((prev) => ({
          ...prev,
          [imageUrl]: prev[imageUrl] + (wasLiked ? 1 : -1),
        }));
      } finally {
        pendingToggles.current.delete(imageUrl);
      }
    },
    [visitorIp, likedImages, likeCounts],
  );

  // Function to check if an image is liked
  const isLiked = useCallback(
    (imageUrl: string) => {
      return likedImages.has(imageUrl);
    },
    [likedImages],
  );

  // Function to get like count for an image
  const getLikeCount = useCallback(
    (imageUrl: string) => {
      return likeCounts[imageUrl] || 0;
    },
    [likeCounts],
  );

  // Function to refresh likes for a set of images
  const refreshLikesForImages = useCallback(async (imageUrls: string[]) => {
    if (!imageUrls.length) return;

    try {
      const counts = await getAllImageLikesCounts(imageUrls);
      setLikeCounts((prev) => ({
        ...prev,
        ...counts,
      }));
    } catch (error) {
      console.error("Error refreshing image likes:", error);
    }
  }, []);

  return (
    <LikesContext.Provider
      value={{
        likedImages,
        likeCounts,
        isLoading,
        toggleLike,
        isLiked,
        getLikeCount,
        refreshLikesForImages,
      }}
    >
      {children}
    </LikesContext.Provider>
  );
};
