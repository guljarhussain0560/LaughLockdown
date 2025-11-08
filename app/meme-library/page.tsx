'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import MemeLibrarySkeleton from '@/components/skeletons/MemeLibrarySkeleton';

interface Meme {
  id: string;
  title: string | null;
  url: string;
  type: string;
  fileSize: number;
  width: number | null;
  height: number | null;
  views: number;
  usageCount: number;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    username: string | null;
    image: string | null;
  };
}

export default function MemeLibraryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [memes, setMemes] = useState<Meme[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchMemes = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/memes');
      if (res.ok) {
        const data = await res.json();
        setMemes(data.memes);
      }
    } catch (error) {
      console.error('Error fetching memes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch memes when auth status changes
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated') {
      fetchMemes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, router]);

  const handleDelete = async (memeId: string) => {
    if (!confirm('Are you sure you want to delete this meme?')) return;

    try {
      setDeleteId(memeId);
      const res = await fetch(`/api/memes?id=${memeId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setMemes(memes.filter((m) => m.id !== memeId));
      } else {
        alert('Failed to delete meme');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete meme');
    } finally {
      setDeleteId(null);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading || status === 'loading') {
    return (
      <>
        <Navbar />
        <MemeLibrarySkeleton />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl px-3 sm:px-4 py-6 sm:py-8 mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  All Uploaded Memes
                </h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  Browse {memes.length} community meme{memes.length !== 1 ? 's' : ''}
                </p>
              </div>
              <Link
                href="/upload-meme"
                className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm sm:text-base font-semibold rounded-lg transition-colors touch-manipulation whitespace-nowrap"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Upload Meme
              </Link>
            </div>
          </div>

          {/* Meme Grid */}
          {memes.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-8 sm:p-12">
              <div className="text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                  No memes available
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">
                  Be the first to upload a meme!
                </p>
                <Link
                  href="/upload-meme"
                  className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm sm:text-base font-semibold rounded-lg transition-colors touch-manipulation"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Upload Meme
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {memes.map((meme) => (
                <div
                  key={meme.id}
                  className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 rounded-lg overflow-hidden transition-colors group"
                >
                  {/* Media Preview */}
                  <div className="relative bg-gray-100 dark:bg-gray-800 aspect-square">
                    {meme.type === 'video' ? (
                      <video
                        src={meme.url}
                        className="object-cover w-full h-full"
                        controls
                        playsInline
                      />
                    ) : (
                      <Image
                        src={meme.url}
                        alt={meme.title || 'Meme'}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      />
                    )}
                    
                    {/* Type Badge */}
                    <div className="absolute top-2 right-2 px-2 py-1 text-xs font-semibold text-white uppercase bg-black bg-opacity-70 rounded-md">
                      {meme.type}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    {meme.title && (
                      <h3 className="mb-2 font-semibold text-gray-900 truncate dark:text-white">
                        {meme.title}
                      </h3>
                    )}
                    
                    <div className="flex items-center gap-2 mb-3">
                      {meme.user.image ? (
                        <Image
                          src={meme.user.image}
                          alt={meme.user.name || 'User'}
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-6 h-6 text-xs font-semibold text-white rounded-full bg-blue-600">
                          {meme.user.name?.charAt(0) || '?'}
                        </div>
                      )}
                      <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        @{meme.user.username || 'user'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                      <span>{formatBytes(meme.fileSize)}</span>
                      <span>{formatDate(meme.createdAt)}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>{meme.views} views</span>
                      <span>{meme.usageCount} uses</span>
                    </div>

                    {/* Actions */}
                    {session?.user?.email === meme.user.id && (
                      <div className="mt-4">
                        <button
                          onClick={() => handleDelete(meme.id)}
                          disabled={deleteId === meme.id}
                          className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deleteId === meme.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
