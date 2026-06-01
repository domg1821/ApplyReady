import {
  Brain,
  BarChart3,
  FileText,
  Download,
  Layers,
  Shield,
  Zap,
  Target,
} from "lucide-react";

const FEATURES = [
  {
    icon: Brain,
    title: "Claude AI Analysis",
    description:
      "Powered by Anthropic's Claude — the most accurate AI for understanding context, tone, and recruiter expectations.",
    color: "bg-violet-50 text-violet-600",
  },
  {
    icon: Target,
    title: "ATS Score & Optimization",
    description:
      "Get your ATS compatibility score and see exactly which keywords are missing for your target role.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: FileText,
    title: "Full Resume Rewrite",
    description:
      "Your entire resume rewritten with powerful action verbs, quantified achievements, and recruiter-quality wording.",
    color: "bg-indigo-50 text-indigo-600",
  },
  {
    icon: BarChart3,
    title: "Detailed Feedback",
    description:
      "Line-by-line feedback on weak bullet points, missing metrics, formatting issues, and more.",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: Layers,
    title: "5 Premium Templates",
    description:
      "Modern, Executive, Minimal, Student, and Tech templates — all ATS-safe and beautifully designed.",
    color: "bg-amber-50 text-amber-600",
  },
  {
    icon: Download,
    title: "PDF Export",
    description:
      "Export a print-ready, ATS-safe PDF with clean typography that stands out in any applicant pool.",
    color: "bg-rose-50 text-rose-600",
  },
  {
    icon: Zap,
    title: "Instant Results",
    description:
      "Get your full analysis in under 30 seconds. No waiting. No back-and-forth.",
    color: "bg-orange-50 text-orange-600",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description:
      "Your resume data is encrypted and never used to train AI models. Your career is yours.",
    color: "bg-teal-50 text-teal-600",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything you need to land the job
          </h2>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Not just a spell-checker. A full AI career coach that rewrites, optimizes,
            and prepares your resume to beat modern hiring systems.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((feat) => (
            <div
              key={feat.title}
              className="card p-5 hover:shadow-card-hover transition-shadow duration-200"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${feat.color}`}>
                <feat.icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{feat.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{feat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
