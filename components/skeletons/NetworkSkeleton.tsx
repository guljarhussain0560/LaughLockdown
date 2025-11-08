export default function NetworkSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 animate-pulse">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header Skeleton */}
        <div className="text-center mb-8">
          <div className="w-48 h-10 bg-gray-200 rounded dark:bg-gray-800 mx-auto mb-2"></div>
          <div className="w-96 h-6 bg-gray-200 rounded dark:bg-gray-800 mx-auto"></div>
        </div>

        {/* Tabs Skeleton */}
        <div className="flex gap-2 mb-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-1 h-10 bg-gray-200 rounded-xl dark:bg-gray-800"></div>
          ))}
        </div>

        {/* Content Card Skeleton */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
          <div className="p-6">
            <div className="w-32 h-6 bg-gray-200 rounded dark:bg-gray-800 mb-4"></div>
            
            {/* User List Skeleton */}
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
                >
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                  
                  {/* User Info */}
                  <div className="flex-1">
                    <div className="w-32 h-4 bg-gray-200 rounded dark:bg-gray-700 mb-2"></div>
                    <div className="w-24 h-3 bg-gray-200 rounded dark:bg-gray-700"></div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <div className="w-20 h-8 bg-gray-200 rounded-lg dark:bg-gray-700"></div>
                    <div className="w-20 h-8 bg-gray-200 rounded-lg dark:bg-gray-700"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
