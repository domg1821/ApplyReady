"use client";

/**
 * PageTransition — wraps any page content with a smooth enter animation.
 * Because Next.js App Router re-mounts page components on navigation,
 * the CSS animation fires automatically on every route change.
 */
export function PageTransition({
  children,
  className = "",
  variant = "up",
}: {
  children: React.ReactNode;
  className?: string;
  /** "up" = fade + translateY (default), "fade" = fade only */
  variant?: "up" | "fade";
}) {
  const animClass = variant === "fade" ? "animate-page-in-fade" : "animate-page-in";
  return (
    <div className={`${animClass} ${className}`}>
      {children}
    </div>
  );
}
