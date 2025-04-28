import compress from "browser-image-compression";

interface OptimizationOptions {
  maxSizeMB: number;
  maxWidthOrHeight: number;
  useWebWorker: boolean;
  maxIteration?: number;
  fileType?: string;
}

/**
 * Optimizes an image for faster upload and better storage efficiency
 *
 * @param imageFile - The original image file to optimize
 * @param customOptions - Optional custom optimization options
 * @returns A promise that resolves to the optimized image file
 */
export async function optimizeImage(
  imageFile: File,
  customOptions?: Partial<OptimizationOptions>,
): Promise<File> {
  try {
    // Default optimization options
    const defaultOptions: OptimizationOptions = {
      maxSizeMB: 1, // Compress to maximum 1MB
      maxWidthOrHeight: 1920, // Limit dimensions to 1920px
      useWebWorker: true, // Use web worker for better performance
      maxIteration: 10, // Maximum compression iterations
      fileType: imageFile.type, // Maintain original file type
    };

    // Merge default options with any custom options
    const options = { ...defaultOptions, ...customOptions };

    // Skip optimization for small images (less than 500KB)
    if (imageFile.size < 500 * 1024) {
      console.log("Image is already small, skipping optimization");
      return imageFile;
    }

    console.log(
      "Original image size:",
      (imageFile.size / 1024 / 1024).toFixed(2) + "MB",
    );

    // Compress the image
    const compressedFile = await compress(imageFile, options);

    console.log(
      "Compressed image size:",
      (compressedFile.size / 1024 / 1024).toFixed(2) + "MB",
    );
    console.log(
      "Compression ratio:",
      (imageFile.size / compressedFile.size).toFixed(2) + "x",
    );

    return compressedFile;
  } catch (error) {
    console.error("Error optimizing image:", error);
    // Return original file if optimization fails
    return imageFile;
  }
}

/**
 * Optimizes multiple images in parallel for faster upload
 *
 * @param imageFiles - Array of image files to optimize
 * @param customOptions - Optional custom optimization options
 * @returns A promise that resolves to an array of optimized image files
 */
export async function optimizeMultipleImages(
  imageFiles: File[],
  customOptions?: Partial<OptimizationOptions>,
): Promise<File[]> {
  try {
    // Process all images in parallel for better performance
    const optimizationPromises = imageFiles.map((file) =>
      optimizeImage(file, customOptions),
    );
    return await Promise.all(optimizationPromises);
  } catch (error) {
    console.error("Error optimizing multiple images:", error);
    // Return original files if optimization fails
    return imageFiles;
  }
}

/**
 * Calculates the optimal chunk size for uploading based on connection speed
 *
 * @returns The optimal chunk size in bytes
 */
export function calculateOptimalChunkSize(): number {
  // Use navigator.connection if available to determine network speed
  const connection = (navigator as any).connection;

  if (connection) {
    const { effectiveType, downlink } = connection;

    // Adjust chunk size based on connection type
    if (effectiveType === "4g" || downlink > 5) {
      return 5 * 1024 * 1024; // 5MB chunks for fast connections
    } else if (effectiveType === "3g" || downlink > 1) {
      return 2 * 1024 * 1024; // 2MB chunks for medium connections
    } else {
      return 512 * 1024; // 512KB chunks for slow connections
    }
  }

  // Default chunk size if connection info is not available
  return 2 * 1024 * 1024; // 2MB
}
