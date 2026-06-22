// client/src/utils/imageOptimizer.ts
/**
 * Client-Side Image Optimization Utility
 * Uses browser Canvas API for high-quality image resizing and compression
 * Preserves aspect ratio while reducing file size
 * NO DEPENDENCIES REQUIRED - Pure browser API
 */

// ==================== CONFIGURATION ====================

export interface ImageOptimizationOptions {
  maxDimension?: number;  // Longest side limit (default: 2048)
  quality?: number;       // JPEG quality 0-1 (default: 0.92)
  format?: 'image/jpeg' | 'image/webp';
  preserveOriginalIfSmaller?: boolean; // Don't optimize if already small
}

/**
 * Default configuration for defect images
 * Optimized for: High quality + Significant size reduction
 */
export const DEFAULT_IMAGE_OPTIONS: ImageOptimizationOptions = {
  maxDimension: 2048,   // 2048px longest side - excellent for A4 printing
  quality: 0.92,        // 92% quality - near-lossless for human eye
  format: 'image/jpeg', // JPEG for best compatibility
  preserveOriginalIfSmaller: true
};

/**
 * Thumbnail configuration
 */
export const THUMBNAIL_OPTIONS: ImageOptimizationOptions = {
  maxDimension: 400,
  quality: 0.85,
  format: 'image/jpeg',
  preserveOriginalIfSmaller: false
};

// ==================== OPTIMIZATION FUNCTIONS ====================

/**
 * Optimize image while preserving aspect ratio
 * @param file Original image file
 * @param options Optimization options
 * @returns Promise<OptimizationResult>
 */
export async function optimizeImage(
  file: File,
  options: ImageOptimizationOptions = DEFAULT_IMAGE_OPTIONS
): Promise<OptimizationResult> {
  const {
    maxDimension = 2048,
    quality = 0.92,
    format = 'image/jpeg',
    preserveOriginalIfSmaller = true
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Failed to get canvas context'));
      return;
    }

    img.onload = () => {
      try {
        const originalWidth = img.width;
        const originalHeight = img.height;
        const originalSize = file.size;

        console.log('📸 Original image:', {
          width: originalWidth,
          height: originalHeight,
          size: `${(originalSize / 1024 / 1024).toFixed(2)} MB`,
          type: file.type
        });

        // Calculate new dimensions preserving aspect ratio
        let targetWidth = originalWidth;
        let targetHeight = originalHeight;
        const longestSide = Math.max(originalWidth, originalHeight);

        if (longestSide > maxDimension) {
          const scaleFactor = maxDimension / longestSide;
          targetWidth = Math.round(originalWidth * scaleFactor);
          targetHeight = Math.round(originalHeight * scaleFactor);
        }

        console.log('🎯 Target dimensions:', {
          width: targetWidth,
          height: targetHeight,
          aspectRatio: `${(targetWidth / targetHeight).toFixed(2)}:1`
        });

        // Set canvas size
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        // Enable high quality rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw resized image
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        // Convert to blob with specified quality
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create blob'));
              return;
            }

            const optimizedSize = blob.size;
            const reduction = ((originalSize - optimizedSize) / originalSize) * 100;

            console.log('✅ Optimized image:', {
              width: targetWidth,
              height: targetHeight,
              size: `${(optimizedSize / 1024).toFixed(2)} KB`,
              reduction: `${reduction.toFixed(1)}%`,
              format: format
            });

            // If optimized file is larger or reduction is minimal, use original
            if (preserveOriginalIfSmaller && (optimizedSize >= originalSize || reduction < 5)) {
              console.log('ℹ️ Using original file (optimization not beneficial)');

              resolve({
                file: file,
                blob: file,
                wasOptimized: false,
                metadata: {
                  originalWidth,
                  originalHeight,
                  optimizedWidth: originalWidth,
                  optimizedHeight: originalHeight,
                  originalSize,
                  optimizedSize: originalSize,
                  reduction: 0,
                  format: file.type as 'image/jpeg' | 'image/webp'
                }
              });
            } else {
              // Create new File from optimized Blob
              const optimizedFile = new File([blob], file.name, {
                type: format,
                lastModified: Date.now()
              });

              resolve({
                file: optimizedFile,
                blob: blob,
                wasOptimized: true,
                metadata: {
                  originalWidth,
                  originalHeight,
                  optimizedWidth: targetWidth,
                  optimizedHeight: targetHeight,
                  originalSize,
                  optimizedSize,
                  reduction,
                  format: format
                }
              });
            }

            // Cleanup
            URL.revokeObjectURL(img.src);
          },
          format,
          quality
        );
      } catch (error) {
        URL.revokeObjectURL(img.src);
        reject(error);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image'));
    };

    // Load image
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Batch optimize multiple images
 * @param files Array of image files
 * @param options Optimization options
 * @returns Promise<OptimizationResult[]>
 */
export async function batchOptimizeImages(
  files: File[],
  options: ImageOptimizationOptions = DEFAULT_IMAGE_OPTIONS
): Promise<OptimizationResult[]> {
  console.log(`📦 Batch optimizing ${files.length} images...`);

  const startTime = Date.now();

  // Optimize all images in parallel
  const optimizationPromises = files.map(file => optimizeImage(file, options));
  const results = await Promise.all(optimizationPromises);

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  const totalOriginalSize = results.reduce((sum, r) => sum + r.metadata.originalSize, 0);
  const totalOptimizedSize = results.reduce((sum, r) => sum + r.metadata.optimizedSize, 0);
  const totalReduction = ((totalOriginalSize - totalOptimizedSize) / totalOriginalSize) * 100;

  console.log(`✅ Batch optimization complete:`, {
    count: files.length,
    duration: `${duration}s`,
    originalSize: `${(totalOriginalSize / 1024 / 1024).toFixed(2)} MB`,
    optimizedSize: `${(totalOptimizedSize / 1024 / 1024).toFixed(2)} MB`,
    reduction: `${totalReduction.toFixed(1)}%`
  });

  return results;
}

/**
 * Generate thumbnail from image file
 * @param file Image file
 * @param size Thumbnail size (default: 400px)
 * @returns Promise<Blob>
 */
export async function generateThumbnail(
  file: File,
  size: number = 400
): Promise<Blob> {
  const result = await optimizeImage(file, {
    maxDimension: size,
    quality: 0.85,
    format: 'image/jpeg',
    preserveOriginalIfSmaller: false
  });

  return result.blob;
}

/**
 * Validate if file is a valid image
 * @param file File to validate
 * @returns Promise<boolean>
 */
export async function validateImage(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(img.src);
      resolve(true);
    };

    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      resolve(false);
    };

    img.src = URL.createObjectURL(file);
  });
}

/**
 * Get image dimensions without loading full image
 * @param file Image file
 * @returns Promise<{ width: number; height: number }>
 */
export async function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      const dimensions = {
        width: img.width,
        height: img.height
      };
      URL.revokeObjectURL(img.src);
      resolve(dimensions);
    };

    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image'));
    };

    img.src = URL.createObjectURL(file);
  });
}

// ==================== TYPES ====================

export interface ImageMetadata {
  originalWidth: number;
  originalHeight: number;
  optimizedWidth: number;
  optimizedHeight: number;
  originalSize: number;      // in bytes
  optimizedSize: number;     // in bytes
  reduction: number;         // percentage
  format: 'image/jpeg' | 'image/webp';
}

export interface OptimizationResult {
  file: File;                // Optimized file ready to upload
  blob: Blob;                // Raw blob (for preview URLs)
  wasOptimized: boolean;     // True if optimization was applied
  metadata: ImageMetadata;   // Optimization statistics
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Create preview URL from blob
 * Remember to revoke URL when done: URL.revokeObjectURL(url)
 */
export function createPreviewURL(blob: Blob): string {
  return URL.createObjectURL(blob);
}
