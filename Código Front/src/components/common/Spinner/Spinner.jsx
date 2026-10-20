export default function Spinner({ size = 14 }) {
  return (
    <span
      style={{ width: size, height: size }}
      className="inline-block border border-current border-t-transparent rounded-full animate-spin align-middle"
      aria-hidden
    />
  )
}
