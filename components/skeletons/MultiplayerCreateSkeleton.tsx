export default function MultiplayerCreateSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 animate-pulse">
      <div className="max-w-6xl px-4 py-8 mx-auto">
        {/* Header Skeleton */}
        <div className="mb-8 text-center">
          <div className="w-64 h-10 mx-auto mb-2 bg-gray-200 rounded dark:bg-gray-800"></div>
          <div className="w-96 h-6 mx-auto bg-gray-200 rounded dark:bg-gray-800"></div>
        </div>

        {/* Two Column Layout */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content - Left Side */}
          <div className="space-y-6 lg:col-span-2">
            {/* Challenge Name Card */}
            <div className="p-6 bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-2xl">
              <div className="w-32 h-5 mb-2 bg-gray-200 rounded dark:bg-gray-800"></div>
              <div className="w-full h-12 bg-gray-200 rounded-lg dark:bg-gray-800"></div>
            </div>

            {/* Player Selection Card */}
            <div className="p-6 bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-2xl">
              <div className="w-40 h-6 mb-4 bg-gray-200 rounded dark:bg-gray-800"></div>
              
              {/* Player Cards */}
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-4 border-2 border-gray-200 dark:border-gray-800 rounded-xl"
                  >
                    {/* Checkbox */}
                    <div className="w-5 h-5 bg-gray-200 rounded dark:bg-gray-800"></div>
                    
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-gray-200 rounded-full dark:bg-gray-800"></div>
                    
                    {/* User Info */}
                    <div className="flex-1">
                      <div className="w-32 h-4 mb-2 bg-gray-200 rounded dark:bg-gray-800"></div>
                      <div className="w-24 h-3 bg-gray-200 rounded dark:bg-gray-800"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Create Button */}
            <div className="w-full h-12 bg-gray-200 rounded-lg dark:bg-gray-800"></div>
          </div>

          {/* Sidebar - Right Side */}
          <div className="space-y-6">
            {/* How It Works Card */}
            <div className="p-6 bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-2xl">
              <div className="w-32 h-6 mb-4 bg-gray-200 rounded dark:bg-gray-800"></div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-6 h-6 bg-gray-200 rounded-full dark:bg-gray-800 flex-shrink-0"></div>
                    <div className="flex-1 space-y-2">
                      <div className="w-full h-3 bg-gray-200 rounded dark:bg-gray-800"></div>
                      <div className="w-4/5 h-3 bg-gray-200 rounded dark:bg-gray-800"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Challenge Summary Card */}
            <div className="p-6 bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-2xl">
              <div className="w-40 h-6 mb-4 bg-gray-200 rounded dark:bg-gray-800"></div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="w-24 h-3 bg-gray-200 rounded dark:bg-gray-800"></div>
                    <div className="w-16 h-4 bg-gray-200 rounded dark:bg-gray-800"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
