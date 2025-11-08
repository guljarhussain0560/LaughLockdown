export default function HomeSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 animate-pulse">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome Header Skeleton */}
        <div className="mb-8">
          <div className="w-64 h-9 bg-gray-200 rounded dark:bg-gray-800 mb-2"></div>
          <div className="w-48 h-5 bg-gray-200 rounded dark:bg-gray-800"></div>
        </div>

        {/* Quick Actions Grid Skeleton */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
                <div className="w-5 h-5 bg-gray-200 dark:bg-gray-800 rounded"></div>
              </div>
              <div className="w-32 h-6 bg-gray-200 rounded dark:bg-gray-800 mb-2"></div>
              <div className="w-full h-4 bg-gray-200 rounded dark:bg-gray-800"></div>
            </div>
          ))}
        </div>

        {/* Two Column Layout Skeleton */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content - Recent Activity & Leaderboard */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Activity Card */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
              <div className="w-32 h-6 bg-gray-200 rounded dark:bg-gray-800 mb-4"></div>
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded-full mx-auto mb-4"></div>
                <div className="w-32 h-4 bg-gray-200 rounded dark:bg-gray-800 mx-auto mb-4"></div>
                <div className="w-24 h-4 bg-gray-200 rounded dark:bg-gray-800 mx-auto"></div>
              </div>
            </div>

            {/* Leaderboard Preview Card */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-24 h-6 bg-gray-200 rounded dark:bg-gray-800"></div>
                <div className="w-16 h-4 bg-gray-200 rounded dark:bg-gray-800"></div>
              </div>
              <div className="text-center py-8">
                <div className="w-48 h-4 bg-gray-200 rounded dark:bg-gray-800 mx-auto"></div>
              </div>
            </div>
          </div>

          {/* Sidebar - Quick Links & Tips */}
          <div className="space-y-6">
            {/* Quick Links Card */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
              <div className="w-24 h-5 bg-gray-200 rounded dark:bg-gray-800 mb-4"></div>
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-gray-200 rounded dark:bg-gray-800"></div>
                    <div className="w-20 h-4 bg-gray-200 rounded dark:bg-gray-800"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pro Tip Card */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
              <div className="w-16 h-5 bg-blue-200 rounded dark:bg-blue-800 mb-2"></div>
              <div className="space-y-2">
                <div className="w-full h-3 bg-blue-200 rounded dark:bg-blue-800"></div>
                <div className="w-full h-3 bg-blue-200 rounded dark:bg-blue-800"></div>
                <div className="w-3/4 h-3 bg-blue-200 rounded dark:bg-blue-800"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
