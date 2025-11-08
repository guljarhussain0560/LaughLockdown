'use client';

import { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import imageCompression from 'browser-image-compression';

interface CompressedFile {
  file: File;
  preview: string;
  type: 'image' | 'video' | 'gif';
  size: number;
  originalSize: number;
  title: string;
  id: string;
}

export default function UploadMemePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [compressedFiles, setCompressedFiles] = useState<CompressedFile[]>([]);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redirect if not authenticated
  if (status === 'unauthenticated') {
    router.push('/auth/login');
    return null;
  }

  const getFileType = (file: File): 'image' | 'video' | 'gif' => {
    if (file.type.includes('gif')) return 'gif';
    if (file.type.includes('video')) return 'video';
    return 'image';
  };

  const compressImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 0.095, // 95KB to leave room for metadata
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: file.type,
      initialQuality: 0.8,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      console.error('Compression error:', error);
      throw new Error('Failed to compress image');
    }
  };

  const compressGif = async (file: File): Promise<File> => {
    // For GIFs, we'll use a similar approach but with different settings
    const options = {
      maxSizeMB: 0.29, // 290KB
      maxWidthOrHeight: 800,
      useWebWorker: true,
      fileType: 'image/gif',
      initialQuality: 0.7,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      console.error('GIF compression error:', error);
      throw new Error('Failed to compress GIF');
    }
  };

  const compressVideo = async (file: File): Promise<File> => {
    // For video compression, we need to ensure it's under 1MB
    // This is a simplified check - in production, you'd use FFmpeg.wasm or server-side compression
    if (file.size <= 1024 * 1024) {
      return file; // Already under 1MB
    }

    // If video is too large, we'll reject it and ask user to compress it externally
    throw new Error('Video is too large. Please compress to under 1MB before uploading.');
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError('');
    setProgress(0);

    const newCompressedFiles: CompressedFile[] = [];
    const fileArray = Array.from(files);

    try {
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        const fileType = getFileType(file);
        const originalSize = file.size;
        let compressed: File;

        setProgress(Math.round(((i + 0.5) / fileArray.length) * 100));

        // Compress based on file type
        if (fileType === 'gif') {
          compressed = await compressGif(file);
          if (compressed.size > 300 * 1024) {
            setError(`GIF "${file.name}" is still too large after compression. Skipped.`);
            continue;
          }
        } else if (fileType === 'video') {
          compressed = await compressVideo(file);
          if (compressed.size > 1024 * 1024) {
            setError(`Video "${file.name}" exceeds 1MB limit. Skipped.`);
            continue;
          }
        } else {
          compressed = await compressImage(file);
          if (compressed.size > 100 * 1024) {
            setError(`Image "${file.name}" is still too large after compression. Skipped.`);
            continue;
          }
        }

        // Create preview
        const preview = URL.createObjectURL(compressed);

        newCompressedFiles.push({
          id: `${Date.now()}-${i}`,
          file: compressed,
          preview,
          type: fileType,
          size: compressed.size,
          originalSize,
          title: '',
        });
      }

      setCompressedFiles(prev => [...prev, ...newCompressedFiles]);
      setProgress(100);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Failed to process files');
      console.error('File processing error:', err);
    }
  };

  const handleUpload = async () => {
    if (compressedFiles.length === 0 || !session?.user?.email) return;

    setUploading(true);
    setError('');

    let successCount = 0;
    let failCount = 0;

    try {
      // Upload each file
      for (const compressedFile of compressedFiles) {
        try {
          setUploadProgress(prev => ({ ...prev, [compressedFile.id]: 0 }));

          // Create form data
          const formData = new FormData();
          formData.append('file', compressedFile.file);
          formData.append('type', compressedFile.type);
          if (compressedFile.title) formData.append('title', compressedFile.title);

          // Upload to API
          const response = await fetch('/api/memes', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Upload failed');
          }

          await response.json();
          successCount++;
          setUploadProgress(prev => ({ ...prev, [compressedFile.id]: 100 }));
        } catch (err) {
          failCount++;
          console.error(`Upload error for file ${compressedFile.id}:`, err);
        }
      }

      // Show results
      if (successCount === compressedFiles.length) {
        alert(`All ${successCount} meme(s) uploaded successfully! 🎉`);
      } else if (successCount > 0) {
        alert(`${successCount} meme(s) uploaded successfully, ${failCount} failed.`);
      } else {
        throw new Error('All uploads failed');
      }
      
      // Success! Redirect to meme library
      router.push('/meme-library');
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Upload failed');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  };

  const updateFileTitle = (id: string, title: string) => {
    setCompressedFiles(prev =>
      prev.map(file => (file.id === id ? { ...file, title } : file))
    );
  };

  const removeFile = (id: string) => {
    setCompressedFiles(prev => prev.filter(file => file.id !== id));
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i)) + ' ' + sizes[i];
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="max-w-4xl px-3 sm:px-4 py-6 sm:py-8 mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Upload Meme
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Share funny content for laugh challenges
            </p>
          </div>

          {/* Size Guidelines */}
          <div className="p-3 sm:p-4 mb-4 sm:mb-6 border border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 rounded-lg sm:rounded-xl">
            <h3 className="mb-2 text-sm sm:text-base font-semibold text-blue-900 dark:text-blue-300">File Size Limits:</h3>
            <ul className="space-y-1 text-xs sm:text-sm text-blue-800 dark:text-blue-300">
              <li>• Images: Maximum 100 KB (auto-compressed)</li>
              <li>• GIFs: Maximum 300 KB (auto-compressed)</li>
              <li>• Videos: Maximum 1 MB</li>
            </ul>
            <p className="mt-2 text-[10px] sm:text-xs text-blue-700 dark:text-blue-400">
              Files will be automatically compressed while maintaining quality
            </p>
          </div>

          {/* Upload Form */}
          <div className="p-6 bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-lg">
            {/* File Upload Area */}
            <div className="mb-6">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*,.gif"
                onChange={handleFileSelect}
                multiple
                className="hidden"
              />
              
              {compressedFiles.length === 0 ? (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-12 border-2 border-dashed border-gray-300 rounded-xl dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors group"
                >
                  <div className="text-center">
                    <svg
                      className="w-16 h-16 mx-auto mb-4 text-gray-400 group-hover:text-blue-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <p className="mb-2 text-lg font-semibold text-gray-700 dark:text-gray-300">
                      Click to upload
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Images, GIFs, or Videos
                    </p>
                  </div>
                </button>
              ) : (
                <div className="space-y-4">
                  {/* File Grid */}
                  <div className="grid gap-4 md:grid-cols-2">
                    {compressedFiles.map((file) => (
                      <div key={file.id} className="p-4 border border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 rounded-xl">
                        {/* Preview */}
                        <div className="mb-3 overflow-hidden border border-gray-200 rounded-lg dark:border-gray-700">
                          {file.type === 'video' ? (
                            <video
                              src={file.preview}
                              controls
                              className="w-full max-h-48 object-cover"
                            />
                          ) : (
                            <Image
                              src={file.preview}
                              alt="Preview"
                              width={400}
                              height={300}
                              className="object-cover w-full max-h-48"
                            />
                          )}
                        </div>

                        {/* Title Input */}
                        <div className="mb-3">
                          <input
                            type="text"
                            value={file.title}
                            onChange={(e) => updateFileTitle(file.id, e.target.value)}
                            placeholder="Title (optional)..."
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            maxLength={100}
                          />
                        </div>

                        {/* File Info */}
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Type:</span>
                            <span className="px-2 py-0.5 text-xs font-semibold text-blue-600 uppercase bg-blue-100 rounded dark:bg-blue-900/30 dark:text-blue-400">
                              {file.type}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Size:</span>
                            <span className="font-medium text-green-600 dark:text-green-400">
                              {formatBytes(file.size)}
                            </span>
                          </div>
                          {file.originalSize > file.size && (
                            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                              <p className="text-green-600 dark:text-green-400">
                                ✓ Saved {Math.round(((file.originalSize - file.size) / file.originalSize) * 100)}%
                              </p>
                            </div>
                          )}
                          
                          {/* Upload Progress */}
                          {uploading && uploadProgress[file.id] !== undefined && (
                            <div className="pt-2">
                              <div className="w-full h-1.5 bg-gray-200 rounded-full dark:bg-gray-700">
                                <div
                                  className="h-1.5 bg-blue-600 rounded-full transition-all"
                                  style={{ width: `${uploadProgress[file.id]}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeFile(file.id)}
                          disabled={uploading}
                          className="w-full mt-3 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add More Files Button */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full px-4 py-3 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    + Add More Files
                  </button>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            {progress > 0 && progress < 100 && (
              <div className="mb-6">
                <div className="w-full h-2 bg-gray-200 rounded-full dark:bg-gray-700">
                  <div
                    className="h-2 transition-all bg-blue-600 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-2 text-sm text-center text-gray-600 dark:text-gray-400">
                  Processing... {progress}%
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-4 mb-6 border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 rounded-xl">
                <p className="text-sm font-medium text-red-600 dark:text-red-400">
                  {error}
                </p>
              </div>
            )}

            {/* Upload Button */}
            <button
              onClick={handleUpload}
              disabled={compressedFiles.length === 0 || uploading}
              className="w-full py-3 font-bold text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Uploading {compressedFiles.length} file(s)...
                </span>
              ) : (
                `Upload ${compressedFiles.length} Meme${compressedFiles.length !== 1 ? 's' : ''}`
              )}
            </button>
          </div>

          {/* Tips */}
          <div className="p-6 mt-6 bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-lg">
            <h3 className="mb-3 text-lg font-bold text-gray-900 dark:text-white">
              Tips for Best Results
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Use high-quality, funny images or videos</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Keep content appropriate and safe for all audiences</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Compression is automatic - just select your file</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>For videos over 1MB, compress them externally first</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
