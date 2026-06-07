import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardSidebar } from "@/components/dashboard/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="fixed inset-0 flex" style={{ backgroundColor: "rgb(var(--bg))" }}>
      {/* Sidebar — desktop only */}
      <div className="hidden lg:block flex-shrink-0">
        <DashboardSidebar profile={profile} />
      </div>

      {/* Main content — scrollable */}
      <main
        className="flex-1 min-w-0 lg:pl-60 overflow-y-auto"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div
          className="flex flex-col"
          style={{
            paddingTop: "max(1.25rem, env(safe-area-inset-top))",
            paddingBottom: "max(5rem, calc(env(safe-area-inset-bottom) + 4rem))",
            paddingLeft: "max(1.25rem, calc(env(safe-area-inset-left) + 0.25rem))",
            paddingRight: "max(1.25rem, env(safe-area-inset-right))",
          }}
        >
          {/* Desktop spacer only */}
          <div className="hidden lg:block h-4 flex-shrink-0" />
          <div className="flex-1 max-w-2xl w-full mx-auto lg:max-w-3xl lg:px-4">
            {children}
          </div>
        </div>
      </main>

      {/* Bottom nav — mobile only */}
      <BottomNav />
    </div>
  );
}
