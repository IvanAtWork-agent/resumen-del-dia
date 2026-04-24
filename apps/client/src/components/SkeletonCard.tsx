export default function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-[#161514] rounded overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:ring-1 dark:ring-[#252320] animate-pulse">
      <div className="aspect-[4/3] bg-[#EDEAE5] dark:bg-[#252320]" />
      <div className="p-4 space-y-2.5">
        <div className="h-2 w-20 bg-[#EDEAE5] dark:bg-[#252320] rounded-full" />
        <div className="space-y-1.5">
          <div className="h-3.5 bg-[#EDEAE5] dark:bg-[#252320] rounded" />
          <div className="h-3.5 w-4/5 bg-[#EDEAE5] dark:bg-[#252320] rounded" />
        </div>
        <div className="space-y-1">
          <div className="h-2.5 bg-[#EDEAE5] dark:bg-[#252320] rounded" />
          <div className="h-2.5 bg-[#EDEAE5] dark:bg-[#252320] rounded" />
          <div className="h-2.5 w-2/3 bg-[#EDEAE5] dark:bg-[#252320] rounded" />
        </div>
        <div className="h-2.5 w-14 bg-[#EDEAE5] dark:bg-[#252320] rounded" />
      </div>
    </div>
  )
}
