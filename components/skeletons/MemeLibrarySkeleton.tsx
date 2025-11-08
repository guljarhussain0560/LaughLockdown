export default function MemeLibrarySkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl px-4 py-8 mx-auto">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="h-9 bg-gray-200 rounded-lg w-64 dark:bg-gray-800 animate-pulse mb-2"></div>
              <div className="w-48 h-6 bg-gray-200 rounded-lg dark:bg-gray-800 animate-pulse"></div>
            </div>
            <div className="w-40 h-12 bg-gray-200 rounded-lg dark:bg-gray-800 animate-pulse"></div>
          </div>
        </div>

        {/* Meme Grid Skeleton */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden"
            >
              {/* Image Skeleton */}
              <div className="relative bg-gray-200 dark:bg-gray-800 aspect-square animate-pulse">
                <div className="absolute top-2 right-2 w-16 h-6 bg-gray-300 dark:bg-gray-700 rounded-md animate-pulse"></div>
              </div>

              {/* Info Skeleton */}
              <div className="p-4">
                {/* Title Skeleton */}
                <div className="h-5 mb-2 bg-gray-200 rounded-lg dark:bg-gray-800 animate-pulse"></div>

                {/* User Info Skeleton */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 bg-gray-200 rounded-full dark:bg-gray-800 animate-pulse"></div>
                  <div className="w-24 h-4 bg-gray-200 rounded dark:bg-gray-800 animate-pulse"></div>
                </div>

                {/* Stats Skeleton */}
                <div className="flex items-center justify-between mb-2">
                  <div className="w-16 h-3 bg-gray-200 rounded dark:bg-gray-800 animate-pulse"></div>
                  <div className="w-20 h-3 bg-gray-200 rounded dark:bg-gray-800 animate-pulse"></div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="w-16 h-3 bg-gray-200 rounded dark:bg-gray-800 animate-pulse"></div>
                  <div className="w-16 h-3 bg-gray-200 rounded dark:bg-gray-800 animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
