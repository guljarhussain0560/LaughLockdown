export default function GameSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 animate-pulse">
      <div className="flex justify-center">
        <div className="w-full max-w-[1280px] flex">
          {/* Left Sidebar Skeleton */}
          <div className="hidden lg:flex lg:flex-col lg:w-[275px] xl:w-[350px] border-r border-gray-200 dark:border-gray-800">
            <div className="flex-1 px-4 py-6 space-y-6">
              <div>
                <div className="w-48 h-6 mb-2 bg-gray-200 rounded dark:bg-gray-800"></div>
                <div className="w-full h-4 bg-gray-200 rounded dark:bg-gray-800"></div>
              </div>

              <div className="p-4 bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-xl">
                <div className="w-24 h-5 mb-3 bg-gray-200 rounded dark:bg-gray-800"></div>
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex gap-2">
                      <div className="w-4 h-4 bg-gray-200 rounded dark:bg-gray-800"></div>
                      <div className="flex-1 h-4 bg-gray-200 rounded dark:bg-gray-800"></div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-xl">
                <div className="w-20 h-5 mb-2 bg-gray-200 rounded dark:bg-gray-800"></div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-gray-200 rounded-full dark:bg-gray-800"></div>
                  <div className="w-16 h-3 bg-gray-200 rounded dark:bg-gray-800"></div>
                </div>
                <div className="w-32 h-3 bg-gray-200 rounded dark:bg-gray-800"></div>
              </div>
            </div>
          </div>

          {/* Center Column - Game Area Skeleton */}
          <div className="flex-1 max-w-[900px]">
            <div className="min-h-screen bg-white border-gray-200 dark:bg-gray-900 border-x dark:border-gray-800">
              {/* Game Header */}
              <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="w-32 h-6 mb-2 bg-gray-200 rounded dark:bg-gray-800"></div>
                    <div className="w-24 h-4 bg-gray-200 rounded dark:bg-gray-800"></div>
                  </div>
                  <div className="w-20 h-7 bg-gray-200 rounded-full dark:bg-gray-800"></div>
                </div>
              </div>

              {/* Loading Banner */}
              <div className="p-4 mx-4 mt-4 border border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-blue-200 rounded-full dark:bg-blue-800"></div>
                  <div>
                    <div className="w-32 h-4 mb-1 bg-blue-200 rounded dark:bg-blue-800"></div>
                    <div className="w-64 h-3 bg-blue-200 rounded dark:bg-blue-800"></div>
                  </div>
                </div>
              </div>

              {/* Main Game Layout */}
              <div className="p-4 space-y-4">
                {/* Meme Display Skeleton */}
                <div className="w-full overflow-hidden bg-gray-200 border border-gray-300 aspect-video dark:bg-gray-800 rounded-xl dark:border-gray-700"></div>

                {/* Webcam Display Skeleton */}
                <div className="w-full overflow-hidden bg-gray-200 border border-gray-300 aspect-video dark:bg-gray-800 rounded-xl dark:border-gray-700"></div>

                {/* Game HUD Skeleton */}
                <div className="p-4 bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="w-24 h-8 bg-gray-200 rounded dark:bg-gray-800"></div>
                    <div className="flex gap-2">
                      <div className="w-20 h-10 bg-gray-200 rounded-lg dark:bg-gray-800"></div>
                      <div className="w-20 h-10 bg-gray-200 rounded-lg dark:bg-gray-800"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar Skeleton */}
          <div className="hidden xl:block xl:w-[350px] px-4">
            <div className="sticky py-4 space-y-4 top-20">
              <div className="overflow-hidden bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-2xl">
                <div className="h-6 px-4 py-3 bg-gray-200 dark:bg-gray-800"></div>
                <div className="px-4 pb-4 space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="w-24 h-3 bg-gray-200 rounded dark:bg-gray-800"></div>
                      <div className="w-16 h-3 bg-gray-200 rounded dark:bg-gray-800"></div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="overflow-hidden bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-2xl">
                <div className="h-6 px-4 py-3 bg-gray-200 dark:bg-gray-800"></div>
                <div className="px-4 pb-4 space-y-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-full h-3 bg-gray-200 rounded dark:bg-gray-800"></div>
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
