"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AppLogo } from "@/components/ui/AppLogo";

export default function SplashPage() {
  const router = useRouter();
  const [splashOut, setSplashOut] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setSplashOut(true);
      setTimeout(async () => {
        // Check if already logged in
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          router.replace("/dashboard");
        } else {
          router.replace("/login");
        }
      }, 650);
    }, 2400);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <div className="screen overflow-hidden">
      <div
        className="absolute inset-0 z-20 flex flex-col items-center justify-center"
        style={{
          background: "linear-gradient(145deg, #4f46e5 0%, #7c3aed 55%, #9333ea 100%)",
          transition: "opacity 0.65s cubic-bezier(0.4,0,0.2,1), transform 0.65s cubic-bezier(0.4,0,0.2,1)",
          opacity: splashOut ? 0 : 1,
          transform: splashOut ? "scale(1.06) translateY(-8px)" : "scale(1) translateY(0)",
        }}
      >
        {/* Background shimmer rings */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-white/10 animate-ping" style={{ animationDuration: "3s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full border border-white/15" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full bg-white/5" />
        </div>

        {/* Center content */}
        <div className="relative flex flex-col items-center gap-5" style={{ animation: "splashReveal 0.7s cubic-bezier(0.34,1.56,0.64,1) both" }}>
          <div className="w-24 h-24 rounded-[32px] bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-2xl border border-white/30">
            <AppLogo size={72} className="rounded-2xl" />
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-black text-white tracking-tight" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.2)" }}>
              ApplyReady
            </h1>
            <p className="text-white/70 mt-2 text-base font-medium tracking-wide">
              Land your dream job, faster.
            </p>
          </div>
        </div>

        {/* Bottom badge */}
        <div className="absolute bottom-14 flex items-center gap-2" style={{ animation: "splashReveal 0.9s 0.3s cubic-bezier(0.34,1.56,0.64,1) both" }}>
          <div className="w-1.5 h-1.5 rounded-full bg-white/50 animate-pulse" />
          <span className="text-white/50 text-xs font-semibold uppercase tracking-widest">AI Resume Builder</span>
          <div className="w-1.5 h-1.5 rounded-full bg-white/50 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
