export default function LoadingDots() {
  return (
    <span className="inline-flex items-center justify-center gap-1.5 animate-pulse-dots h-5">
      <span className="w-2 h-2 bg-current rounded-full" />
      <span className="w-2 h-2 bg-current rounded-full" />
      <span className="w-2 h-2 bg-current rounded-full" />
    </span>
  )
}
