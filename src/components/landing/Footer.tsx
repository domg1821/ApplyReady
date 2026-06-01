import Link from "next/link";
import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-gray-900">ApplyReady</span>
          </Link>

          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link href="/privacy" className="hover:text-gray-900 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-gray-900 transition-colors">Terms</Link>
            <Link href="/login" className="hover:text-gray-900 transition-colors">Login</Link>
            <Link href="/signup" className="hover:text-gray-900 transition-colors">Sign up</Link>
          </div>

          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} ApplyReady. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
