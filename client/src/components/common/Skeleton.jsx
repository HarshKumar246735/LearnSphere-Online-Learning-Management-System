export default function Skeleton({ width = '100%', height = 16, radius, style }) {
  return <span className="skeleton" aria-hidden="true" style={{ width, height, borderRadius: radius, ...style }} />;
}
