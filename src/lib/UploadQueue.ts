import { optimizeImage } from "./imageOptimizer";
import { uploadImage as supabaseUploadImage } from "./supabase";

interface QueueItem {
  file: File;
  path: string;
  priority: number;
  onProgress?: (progress: number) => void;
  onComplete?: (url: string) => void;
  onError?: (error: Error) => void;
}

class UploadQueue {
  private queue: QueueItem[] = [];
  private isProcessing = false;
  private concurrentUploads = 3; // Number of concurrent uploads
  private activeUploads = 0;
  private abortControllers: Map<string, AbortController> = new Map();

  constructor() {
    // Adjust concurrent uploads based on device capabilities
    this.adjustConcurrency();

    // Listen for online/offline events to pause/resume queue
    window.addEventListener("online", () => this.resumeQueue());
    window.addEventListener("offline", () => this.pauseQueue());
  }

  private adjustConcurrency(): void {
    // Use hardware concurrency if available
    if (navigator.hardwareConcurrency) {
      // Use half of available cores, but at least 2 and at most 4
      this.concurrentUploads = Math.max(
        2,
        Math.min(4, Math.floor(navigator.hardwareConcurrency / 2)),
      );
    }

    // Adjust based on connection type if available
    const connection = (navigator as any).connection;
    if (connection) {
      const { effectiveType } = connection;
      if (effectiveType === "4g") {
        this.concurrentUploads = Math.min(4, this.concurrentUploads);
      } else if (effectiveType === "3g") {
        this.concurrentUploads = 2;
      } else {
        this.concurrentUploads = 1;
      }
    }
  }

  /**
   * Add a file to the upload queue
   */
  public enqueue(
    file: File,
    path: string,
    priority = 0,
    onProgress?: (progress: number) => void,
    onComplete?: (url: string) => void,
    onError?: (error: Error) => void,
  ): void {
    this.queue.push({ file, path, priority, onProgress, onComplete, onError });

    // Sort queue by priority (higher number = higher priority)
    this.queue.sort((a, b) => b.priority - a.priority);

    // Start processing if not already running
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  /**
   * Process the upload queue
   */
  private async processQueue(): Promise<void> {
    if (
      this.queue.length === 0 ||
      this.activeUploads >= this.concurrentUploads
    ) {
      return;
    }

    this.isProcessing = true;

    // Process multiple uploads concurrently
    while (
      this.queue.length > 0 &&
      this.activeUploads < this.concurrentUploads
    ) {
      const item = this.queue.shift();
      if (item) {
        this.activeUploads++;
        this.processItem(item).finally(() => {
          this.activeUploads--;
          this.processQueue();
        });
      }
    }

    this.isProcessing = this.activeUploads > 0;
  }

  /**
   * Process a single upload item
   */
  private async processItem(item: QueueItem): Promise<void> {
    const { file, path, onProgress, onComplete, onError } = item;

    try {
      // Create an AbortController for this upload
      const controller = new AbortController();
      const uploadId = `${file.name}-${Date.now()}`;
      this.abortControllers.set(uploadId, controller);

      // Optimize the image before uploading
      const optimizedFile = await optimizeImage(file);

      // Upload the optimized file
      const imageUrl = await supabaseUploadImage(optimizedFile, path);

      // Remove the controller once upload is complete
      this.abortControllers.delete(uploadId);

      // Call the completion callback
      if (onComplete) {
        onComplete(imageUrl);
      }
    } catch (error) {
      console.error("Upload failed:", error);
      if (onError) {
        onError(error as Error);
      }
    }
  }

  /**
   * Pause the upload queue (e.g., when offline)
   */
  public pauseQueue(): void {
    this.isProcessing = false;
    console.log("Upload queue paused - device is offline");
  }

  /**
   * Resume the upload queue (e.g., when back online)
   */
  public resumeQueue(): void {
    if (!this.isProcessing && this.queue.length > 0) {
      console.log("Upload queue resumed - device is online");
      this.processQueue();
    }
  }

  /**
   * Cancel all pending uploads
   */
  public cancelAll(): void {
    this.queue = [];

    // Abort all active uploads
    this.abortControllers.forEach((controller) => {
      controller.abort();
    });

    this.abortControllers.clear();
    this.activeUploads = 0;
    this.isProcessing = false;
  }
}

// Create a singleton instance
export const uploadQueue = new UploadQueue();

/**
 * Enhanced upload function that uses the queue system
 */
export async function uploadImageOptimized(
  file: File,
  path: string,
  priority = 0,
  onProgress?: (progress: number) => void,
): Promise<string> {
  return new Promise((resolve, reject) => {
    uploadQueue.enqueue(
      file,
      path,
      priority,
      onProgress,
      (url) => resolve(url),
      (error) => reject(error),
    );
  });
}

/**
 * Upload multiple images with optimization and queuing
 */
export async function uploadMultipleImagesOptimized(
  files: File[],
  basePath: string,
  onProgress?: (overallProgress: number) => void,
): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const urls: string[] = [];
    let completed = 0;

    // If no files, return empty array immediately
    if (files.length === 0) {
      resolve(urls);
      return;
    }

    files.forEach((file, index) => {
      const timestamp = new Date().getTime();
      const path = `${basePath}/${timestamp}_${file.name}`;

      // Set priority based on index (first images have higher priority)
      const priority = files.length - index;

      uploadQueue.enqueue(
        file,
        path,
        priority,
        (progress) => {
          if (onProgress) {
            // Calculate overall progress
            const individualProgress = progress / 100;
            const overallProgress =
              ((completed + individualProgress) / files.length) * 100;
            onProgress(overallProgress);
          }
        },
        (url) => {
          urls.push(url);
          completed++;

          // If all uploads are complete, resolve the promise
          if (completed === files.length) {
            resolve(urls);
          }
        },
        (error) => {
          reject(error);
        },
      );
    });
  });
}
