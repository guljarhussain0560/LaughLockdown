export default function LeaderboardSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 animate-pulse">
      <div className="max-w-6xl px-4 py-8 mx-auto">
        {/* Header Skeleton */}
        <div className="mb-6 text-center">
          <div className="w-64 h-10 mx-auto mb-2 bg-gray-200 rounded dark:bg-gray-800"></div>
          <div className="w-96 h-6 mx-auto bg-gray-200 rounded dark:bg-gray-800"></div>
        </div>

        {/* Tabs Skeleton */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-800">
          <div className="w-40 h-12 bg-gray-200 rounded-t dark:bg-gray-800"></div>
          <div className="w-40 h-12 bg-gray-200 rounded-t dark:bg-gray-800"></div>
        </div>

        {/* Table Skeleton */}
        <div className="overflow-hidden bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <th key={i} className="px-4 py-3">
                      <div className="w-16 h-3 bg-gray-200 rounded dark:bg-gray-700"></div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-4">
                      <div className="w-8 h-8 mx-auto bg-gray-200 rounded-full dark:bg-gray-700"></div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full dark:bg-gray-700"></div>
                        <div>
                          <div className="w-24 h-4 mb-1 bg-gray-200 rounded dark:bg-gray-700"></div>
                          <div className="w-20 h-3 bg-gray-200 rounded dark:bg-gray-700"></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="w-12 h-6 mx-auto bg-gray-200 rounded dark:bg-gray-700"></div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="w-8 h-4 mx-auto bg-gray-200 rounded dark:bg-gray-700"></div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="w-8 h-4 mx-auto bg-gray-200 rounded dark:bg-gray-700"></div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-12 h-4 bg-gray-200 rounded dark:bg-gray-700"></div>
                        <div className="w-16 h-2 bg-gray-200 rounded-full dark:bg-gray-700"></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
