/**
 * Template component for dashboard pages
 * Re-renders on navigation (unlike layout which persists)
 * Useful for page transitions and animations
 */
export default function DashboardTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="animate-fadeIn">{children}</div>;
}
