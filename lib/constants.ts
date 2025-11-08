/**
 * List of meme files in the public/memes folder
 * Add your meme images/videos here
 * 
 * To get started quickly:
 * 1. Open http://localhost:3000/meme-generator.html in your browser
 * 2. Click "Generate & Download Placeholder Memes"
 * 3. Move the downloaded files to public/memes/ folder
 * 
 * Or add your own funny memes!
 */
export const MEME_FILES = [
  '/memes/meme1.svg',
  '/memes/meme2.svg',
  '/memes/meme3.svg',
  '/memes/meme4.svg',
  '/memes/meme5.svg',
  '/memes/meme6.svg',
  '/memes/meme7.svg',
  '/memes/meme8.svg',
  '/memes/meme9.svg',
  '/memes/meme10.svg',
];

/**
 * Meme rotation interval in milliseconds
 */
export const MEME_ROTATION_INTERVAL = 5000; // 5 seconds

/**
 * Smile detection sensitivity (0-1)
 * Higher = more sensitive
 */
export const SMILE_DETECTION_THRESHOLD = 0.6;

/**
 * Webcam configuration - Mobile-optimized
 * Uses lower resolution on mobile for better performance and compatibility
 */
export const WEBCAM_CONFIG = typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  ? {
      width: { ideal: 640, max: 1280 },
      height: { ideal: 480, max: 720 },
      facingMode: 'user',
      frameRate: { ideal: 20, max: 30 }, // Lower frame rate on mobile saves battery
    }
  : {
      width: { ideal: 1280 },
      height: { ideal: 720 },
      facingMode: 'user',
      frameRate: { ideal: 30 },
    };
