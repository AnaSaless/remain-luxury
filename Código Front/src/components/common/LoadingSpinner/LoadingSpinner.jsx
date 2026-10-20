export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-6 h-6 border border-[#0a0a0a] border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
