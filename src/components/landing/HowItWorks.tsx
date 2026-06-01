import { Upload, Brain, Sparkles, Download } from "lucide-react";

const STEPS = [
  {
    number: "01",
    icon: Upload,
    title: "Upload or paste your resume",
    description:
      "Upload your existing PDF resume or paste your text. You can also start from scratch using our guided builder.",
  },
  {
    number: "02",
    icon: Brain,
    title: "AI analyzes every section",
    description:
      "Claude AI scores your resume on 20+ criteria — ATS compatibility, bullet strength, keyword density, and more.",
  },
  {
    number: "03",
    icon: Sparkles,
    title: "Get a fully rewritten resume",
    description:
      "Upgrade to Pro and receive a complete professional rewrite — stronger bullets, better summary, optimized formatting.",
  },
  {
    number: "04",
    icon: Download,
    title: "Export and apply",
    description:
      "Download your polished resume as a PDF, choose your template, and start applying with confidence.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            From upload to job-ready in 4 steps
          </h2>
          <p className="text-xl text-gray-500 max-w-xl mx-auto">
            No templates to fill out for hours. Just upload and let the AI do the work.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step, i) => (
            <div key={step.number} className="relative">
              {i < STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-[calc(100%-8px)] w-full h-px bg-gradient-to-r from-indigo-200 to-transparent z-0" />
              )}
              <div className="card p-6 relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-bold text-indigo-400 tracking-wider">
                    {step.number}
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
                    <step.icon className="w-5 h-5 text-indigo-600" />
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
