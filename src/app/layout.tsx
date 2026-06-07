import type { Metadata, Viewport } from "next";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { OfflineIndicator } from "@/components/layout/OfflineIndicator";
import "./globals.css";

export const metadata: Metadata = {
  title: "ApplyReady — AI Resume Builder",
  description: "Turn your resume into a job-winning professional resume in minutes.",
  keywords: ["resume builder", "AI resume", "ATS optimization"],
  appleWebApp: { capable: true, statusBarStyle: "default", title: "ApplyReady" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover", // required for env(safe-area-inset-*) to work
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <ThemeProvider>
          <OfflineIndicator />
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: "rgb(var(--surface))",
                color: "rgb(var(--text-primary))",
                borderRadius: "12px",
                border: "1px solid rgb(var(--border))",
                boxShadow: "0 4px 20px rgb(0 0 0 / 0.12)",
                fontSize: "14px",
                fontWeight: "500",
              },
              success: { iconTheme: { primary: "#6366f1", secondary: "#fff" } },
              error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
