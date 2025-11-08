'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Meme {
  id: string;
  title: string | null;
  url: string;
  type: string;
  views: number;
  usageCount: number;
  createdAt: string;
}

interface YourMemesWidgetProps {
  limit?: number;
  showViewAll?: boolean;
}

export default function YourMemesWidget({ limit = 3, showViewAll = true }: YourMemesWidgetProps) {
  const [memes, setMemes] = useState<Meme[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyMemes();
  }, []);

  const fetchMyMemes = async () => {
    try {
      const res = await fetch(`/api/memes/my?limit=${limit}`);
      if (res.ok) {
        const data = await res.json();
        setMemes(data.memes || []);
      }
    } catch (error) {
      console.error('Error fetching memes:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="w-32 h-6 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
          <div className="w-16 h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Your Memes</h3>
        {showViewAll && (
          <Link
            href="/meme-library?filter=my"
            className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            View All
          </Link>
        )}
      </div>

      {memes.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
            No memes uploaded yet
          </p>
          <Link
            href="/upload-meme"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Upload First Meme
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {memes.map((meme) => (
              <Link
                key={meme.id}
                href="/meme-library?filter=my"
                className="group relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
              >
                {meme.type === 'video' ? (
                  <video
                    src={meme.url}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                  />
                ) : (
                  <Image
                    src={meme.url}
                    alt={meme.title || 'Meme'}
                    fill
                    className="object-cover"
                    sizes="120px"
                  />
                )}
                
                {/* Type Badge */}
                <div className="absolute top-1 right-1 px-1.5 py-0.5 bg-black bg-opacity-70 text-white text-xs rounded uppercase font-semibold">
                  {meme.type === 'gif' ? 'GIF' : meme.type === 'video' ? 'VID' : 'IMG'}
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-3 text-white text-xs">
                      <span>{meme.views} views</span>
                      <span>•</span>
                      <span>{meme.usageCount} uses</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Stats Summary */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
              <span>{memes.length} meme{memes.length !== 1 ? 's' : ''}</span>
              <span>•</span>
              <span>
                {memes.reduce((sum, m) => sum + m.views, 0)} total views
              </span>
            </div>
            <Link
              href="/upload-meme"
              className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline"
            >
              + Add More
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
