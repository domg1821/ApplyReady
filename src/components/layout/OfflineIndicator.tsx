"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export function OfflineIndicator() {
  const [offline, setOffline] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Set initial state
    setOffline(!navigator.onLine);

    const handleOffline = () => {
      setOffline(true);
      setVisible(true);
    };
    const handleOnline = () => {
      setOffline(false);
      // Keep visible briefly with "back online" state then hide
      setTimeout(() => setVisible(false), 2500);
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (!visible && !offline) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[200] flex items-center justify-center gap-2 py-2.5 text-xs font-semibold transition-all duration-300"
      style={{
        backgroundColor: offline ? "#ef4444" : "#10b981",
        color: "#fff",
        paddingTop: "max(0.625rem, calc(env(safe-area-inset-top) + 0.25rem))",
      }}
    >
      {offline ? (
        <>
          <WifiOff className="w-3.5 h-3.5" />
          No internet connection
        </>
      ) : (
        <>
          ✓ Back online
        </>
      )}
    </div>
  );
}
