"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Settings, Wand2, Plus } from "lucide-react";

const LEFT_TABS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Home"    },
  { href: "/resumes",   icon: FileText,         label: "Resumes" },
] as const;

const RIGHT_TABS = [
  { href: "/tools",    icon: Wand2,    label: "Tools"    },
  { href: "/settings", icon: Settings, label: "Settings" },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && href !== "/resumes" && pathname.startsWith(href));

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
      style={{
        background: "rgba(8,8,20,0.96)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(30,30,62,0.8)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div className="flex items-stretch h-[60px]">
        {/* Left tabs */}
        {LEFT_TABS.map(({ href, icon: Icon, label }) => (
          <NavTab key={href} href={href} icon={Icon} label={label} active={isActive(href)} />
        ))}

        {/* Center FAB */}
        <div className="flex-1 flex items-center justify-center">
          <Link
            href="/assessment"
            className="relative flex items-center justify-center"
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            <div
              className="absolute inset-0 rounded-2xl opacity-40 animate-pulse-glow"
              style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)" }}
            />
            <div
              className="relative w-13 h-13 rounded-2xl flex items-center justify-center shadow-lg -mt-4 active:scale-90"
              style={{
                width: 52,
                height: 52,
                background: "linear-gradient(135deg, #a855f7 0%, #7c3aed 50%, #6d28d9 100%)",
                boxShadow: "0 4px 20px rgba(147,97,253,0.5), 0 0 0 1px rgba(147,97,253,0.3)",
              }}
            >
              <Plus className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
          </Link>
        </div>

        {/* Right tabs */}
        {RIGHT_TABS.map(({ href, icon: Icon, label }) => (
          <NavTab key={href} href={href} icon={Icon} label={label} active={isActive(href)} />
        ))}
      </div>
    </nav>
  );
}

function NavTab({
  href, icon: Icon, label, active,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex-1 flex flex-col items-center justify-center gap-0.5 relative active:scale-90 select-none"
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      {/* Active indicator line at top */}
      <span
        className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full"
        style={{
          width: active ? "2rem" : "0",
          background: active ? "linear-gradient(90deg, #a855f7, #7c3aed)" : "transparent",
          boxShadow: active ? "0 0 8px rgba(147,97,253,0.8)" : "none",
        }}
      />

      {/* Icon */}
      <div
        className="flex items-center justify-center w-9 h-6 rounded-xl"
        style={{ backgroundColor: active ? "rgba(147,97,253,0.15)" : "transparent" }}
      >
        <Icon
          className="w-5 h-5"
          style={{
            color: active ? "#a855f7" : "rgb(90,90,118)",
            transform: active ? "scale(1.1)" : "scale(1)",
          }}
        />
      </div>

      {/* Label */}
      <span
        className="text-[10px] font-semibold leading-none"
        style={{ color: active ? "#a855f7" : "rgb(90,90,118)" }}
      >
        {label}
      </span>
    </Link>
  );
}
