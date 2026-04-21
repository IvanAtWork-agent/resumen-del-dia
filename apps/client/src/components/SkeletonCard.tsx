export default function SkeletonCard() {
  return (
    <div className="bg-[#FFFFFF] dark:bg-[#1E1D1B] border border-[#E5E2DC] dark:border-[#2E2D2A] rounded-lg overflow-hidden animate-pulse">
      <div className="w-full aspect-video bg-[#E5E2DC] dark:bg-[#2E2D2A]" />
      <div className="p-4">
        <div className="flex gap-2 mb-2">
          <div className="h-4 w-16 bg-[#E5E2DC] dark:bg-[#2E2D2A] rounded" />
        </div>
        <div className="h-3 w-24 bg-[#E5E2DC] dark:bg-[#2E2D2A] rounded mb-2" />
        <div className="h-5 bg-[#E5E2DC] dark:bg-[#2E2D2A] rounded mb-1" />
        <div className="h-5 w-3/4 bg-[#E5E2DC] dark:bg-[#2E2D2A] rounded mb-3" />
        <div className="h-4 bg-[#E5E2DC] dark:bg-[#2E2D2A] rounded mb-1" />
        <div className="h-4 bg-[#E5E2DC] dark:bg-[#2E2D2A] rounded mb-1" />
        <div className="h-4 w-2/3 bg-[#E5E2DC] dark:bg-[#2E2D2A] rounded mb-3" />
        <div className="h-4 w-16 bg-[#E5E2DC] dark:bg-[#2E2D2A] rounded" />
      </div>
    </div>
  )
}
