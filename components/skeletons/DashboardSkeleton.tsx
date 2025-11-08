export default function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 animate-pulse">
      <div className="flex justify-center">
        <div className="flex w-full max-w-[1280px]">
          {/* Left Sidebar Skeleton */}
          <div className="hidden lg:block lg:w-[275px] xl:w-[350px]">
            <div className="sticky px-4 py-4 top-20">
              {/* Quick Stats Card */}
              <div className="overflow-hidden bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-2xl">
                <div className="h-8 px-4 py-3 bg-gray-200 dark:bg-gray-800 rounded-t-2xl"></div>
                <div className="px-4 pb-4 space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="w-20 h-4 bg-gray-200 rounded dark:bg-gray-800"></div>
                      <div className="w-12 h-4 bg-gray-200 rounded dark:bg-gray-800"></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions Card */}
              <div className="mt-4 overflow-hidden bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-2xl">
                <div className="h-8 px-4 py-3 bg-gray-200 dark:bg-gray-800"></div>
                <div className="px-4 pb-4 space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-full h-10 bg-gray-200 rounded-full dark:bg-gray-800"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Center Column Skeleton */}
          <div className="flex-1 max-w-[600px] border-x border-gray-200 dark:border-gray-800">
            {/* Header */}
            <div className="px-4 py-4 border-b border-gray-200 bg-white/80 dark:bg-gray-950/80 dark:border-gray-800">
              <div className="w-48 h-6 mb-2 bg-gray-200 rounded dark:bg-gray-800"></div>
              <div className="w-32 h-4 bg-gray-200 rounded dark:bg-gray-800"></div>
            </div>

            {/* Stats Cards */}
            <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-800">
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="p-4 bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-2xl">
                    <div className="w-16 h-3 mb-2 bg-gray-200 rounded dark:bg-gray-800"></div>
                    <div className="w-12 h-8 bg-gray-200 rounded dark:bg-gray-800"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Win/Loss Record */}
            <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-800">
              <div className="w-32 h-6 mb-3 bg-gray-200 rounded dark:bg-gray-800"></div>
              <div className="p-4 bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-2xl">
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i}>
                      <div className="flex justify-between mb-2">
                        <div className="w-16 h-3 bg-gray-200 rounded dark:bg-gray-800"></div>
                        <div className="w-8 h-3 bg-gray-200 rounded dark:bg-gray-800"></div>
                      </div>
                      <div className="w-full h-3 bg-gray-200 rounded-full dark:bg-gray-800"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Games */}
            <div className="px-4 py-4">
              <div className="w-32 h-6 mb-3 bg-gray-200 rounded dark:bg-gray-800"></div>
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-2xl">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-24 h-3 bg-gray-200 rounded dark:bg-gray-800"></div>
                      <div className="w-12 h-5 bg-gray-200 rounded-full dark:bg-gray-800"></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="w-16 h-4 bg-gray-200 rounded dark:bg-gray-800"></div>
                      <div className="w-20 h-4 bg-gray-200 rounded dark:bg-gray-800"></div>
                      <div className="w-8 h-4 bg-gray-200 rounded dark:bg-gray-800"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar Skeleton */}
          <div className="hidden xl:block xl:w-[350px] px-4">
            <div className="sticky py-4 space-y-4 top-20">
              {/* Performance Card */}
              <div className="overflow-hidden bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-2xl">
                <div className="h-8 px-4 py-3 bg-gray-200 dark:bg-gray-800"></div>
                <div className="px-4 pb-4 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="w-24 h-3 bg-gray-200 rounded dark:bg-gray-800"></div>
                      <div className="w-16 h-3 bg-gray-200 rounded dark:bg-gray-800"></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Players Card */}
              <div className="overflow-hidden bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-2xl">
                <div className="h-8 px-4 py-3 bg-gray-200 dark:bg-gray-800"></div>
                <div className="px-4 pb-4 space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                      <div className="flex items-center justify-center w-6 h-6 bg-gray-200 rounded-full dark:bg-gray-700"></div>
                      <div className="flex-1">
                        <div className="w-20 h-3 mb-1 bg-gray-200 rounded dark:bg-gray-700"></div>
                        <div className="w-24 h-3 bg-gray-200 rounded dark:bg-gray-700"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
