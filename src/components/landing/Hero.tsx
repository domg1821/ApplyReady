import Link from "next/link";
import { ArrowRight, CheckCircle2, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";

const SOCIAL_PROOF = ["2,400+ resumes optimized", "4.9★ average rating", "3x more interviews"];

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/60 via-white to-white pointer-events-none" />
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Social proof strip */}
        <div className="flex items-center justify-center gap-6 mb-8 flex-wrap">
          {SOCIAL_PROOF.map((item) => (
            <div key={item} className="flex items-center gap-1.5 text-sm text-gray-600">
              <CheckCircle2 className="w-4 h-4 text-indigo-500 flex-shrink-0" />
              {item}
            </div>
          ))}
        </div>

        {/* Headline */}
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full text-sm font-medium text-indigo-700 mb-6">
            <Zap className="w-3.5 h-3.5" />
            AI-Powered · ATS-Optimized · Recruiter-Approved
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-[1.08] tracking-tight text-balance mb-6">
            Turn Your Resume Into a{" "}
            <span className="gradient-text">Job-Winning</span>{" "}
            Resume in Minutes
          </h1>

          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 text-balance">
            Upload your resume and get an instant AI analysis with your ATS score,
            detailed feedback, and a fully rewritten professional version — ready to send.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="gap-2 shadow-premium">
                Analyze my resume free
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button variant="secondary" size="lg">
                See how it works
              </Button>
            </Link>
          </div>

          <p className="mt-4 text-sm text-gray-400">
            Free analysis · No credit card required
          </p>
        </div>

        {/* Before/After preview */}
        <div className="mt-20 grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          <ResumePreviewCard
            label="Before"
            labelColor="text-red-500 bg-red-50 border-red-100"
            score={42}
            scoreColor="text-red-500"
            items={[
              { text: "Responsible for managing team projects", strike: true },
              { text: "Helped with customer support tickets", strike: true },
              { text: "Worked on improving sales numbers", strike: true },
            ]}
          />
          <ResumePreviewCard
            label="After — AI Rewritten"
            labelColor="text-emerald-600 bg-emerald-50 border-emerald-100"
            score={91}
            scoreColor="text-emerald-600"
            badge="Pro"
            items={[
              { text: "Led cross-functional team of 8, delivering 3 projects 15% under budget", strike: false },
              { text: "Resolved 200+ support tickets/month, achieving 97% CSAT score", strike: false },
              { text: "Drove $420K revenue increase through targeted sales funnel optimization", strike: false },
            ]}
          />
        </div>

        {/* Stars */}
        <div className="mt-12 flex flex-col items-center gap-2">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-gray-700">Loved by job seekers</span> at Google, Meta, Amazon & more
          </p>
        </div>
      </div>
    </section>
  );
}

function ResumePreviewCard({
  label,
  labelColor,
  score,
  scoreColor,
  badge,
  items,
}: {
  label: string;
  labelColor: string;
  score: number;
  scoreColor: string;
  badge?: string;
  items: { text: string; strike: boolean }[];
}) {
  return (
    <div className="card p-6 relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${labelColor}`}>
          {label}
        </span>
        <div className="flex items-center gap-2">
          {badge && (
            <span className="text-xs font-bold px-2 py-0.5 gradient-brand text-white rounded-full">
              {badge}
            </span>
          )}
          <span className={`text-2xl font-bold ${scoreColor}`}>{score}</span>
          <span className="text-xs text-gray-400">/ 100</span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="h-2 bg-gray-200 rounded w-1/3" />
        <div className="h-2 bg-gray-100 rounded w-1/2" />
        <div className="mt-4 space-y-2.5">
          {items.map((item, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <span className="mt-0.5 text-gray-400">•</span>
              <span className={item.strike ? "line-through text-gray-400" : "text-gray-700"}>
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
