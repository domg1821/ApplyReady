import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export default function PrivacyPolicyPage() {
  const lastUpdated = "June 7, 2026";

  return (
    <div className="fixed inset-0 flex flex-col animate-page-in" style={{ backgroundColor: "rgb(var(--bg))" }}>
      {/* Header */}
      <div className="border-b flex-shrink-0" style={{ backgroundColor: "rgb(var(--surface))", borderColor: "rgb(var(--border))", paddingTop: "max(1.25rem, env(safe-area-inset-top))" }}>
        <div className="max-w-2xl mx-auto px-5 pb-4 flex items-center gap-3">
          <Link href="/settings" className="p-1.5 rounded-xl transition-colors" style={{ color: "rgb(var(--text-muted))" }}>
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(147,97,253,0.1)" }}>
            <Shield className="w-4 h-4" style={{ color: "#a855f7" }} />
          </div>
          <h1 className="text-xl font-bold" style={{ color: "rgb(var(--text-primary))" }}>Privacy Policy</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
      <div className="max-w-2xl mx-auto px-5 pb-16 space-y-6 text-sm leading-relaxed" style={{ color: "rgb(var(--text-secondary))" }}>
        <p className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>Last updated: {lastUpdated}</p>

        <section>
          <h2 className="font-bold text-base mb-2" style={{ color: "rgb(var(--text-primary))" }}>1. Introduction</h2>
          <p>
            ApplyReady (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains
            how we collect, use, and protect your personal information when you use the ApplyReady app and related services.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2" style={{ color: "rgb(var(--text-primary))" }}>2. Information We Collect</h2>
          <p className="mb-2"><strong>Account Information:</strong> When you sign up, we collect your email address and optionally your full name.</p>
          <p className="mb-2"><strong>Resume Data:</strong> The resume content you provide — including work history, education, skills, and contact information — is stored securely to power our AI features.</p>
          <p className="mb-2"><strong>Usage Data:</strong> We may collect anonymous analytics data such as feature usage and crash reports to improve the app.</p>
          <p><strong>Device Information:</strong> Basic device identifiers may be collected for fraud prevention and app improvement purposes.</p>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2" style={{ color: "rgb(var(--text-primary))" }}>3. How We Use Your Information</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>To generate and improve your resumes using AI</li>
            <li>To provide AI-powered tools (cover letters, LinkedIn bios, interview prep)</li>
            <li>To manage your account and subscription</li>
            <li>To improve app features and fix bugs</li>
            <li>To send important product updates (you may opt out at any time)</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2" style={{ color: "rgb(var(--text-primary))" }}>4. AI Processing</h2>
          <p>
            Your resume data is sent to Anthropic&apos;s Claude AI to generate content. Anthropic does not use your data to train AI models.
            We do not sell or share your resume content with third parties for advertising purposes.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2" style={{ color: "rgb(var(--text-primary))" }}>5. Data Storage & Security</h2>
          <p>
            Your data is stored securely using Supabase with encryption at rest and in transit. We follow industry-standard
            security practices to protect your personal information. However, no method of transmission over the internet is 100% secure.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2" style={{ color: "rgb(var(--text-primary))" }}>6. Data Retention</h2>
          <p>
            We retain your data for as long as your account is active. You may delete your account at any time from Settings,
            which will permanently remove all your data within 30 days.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2" style={{ color: "rgb(var(--text-primary))" }}>7. Your Rights</h2>
          <p className="mb-2">You have the right to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Access the personal data we hold about you</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Export your data in a portable format</li>
          </ul>
          <p className="mt-2">To exercise these rights, contact us at <strong>domgbp21@gmail.com</strong>.</p>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2" style={{ color: "rgb(var(--text-primary))" }}>8. Third-Party Services</h2>
          <p className="mb-2">We use the following third-party services:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Supabase</strong> — database and authentication</li>
            <li><strong>Anthropic (Claude)</strong> — AI content generation</li>
            <li><strong>Apple App Store</strong> — app distribution and in-app purchases</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2" style={{ color: "rgb(var(--text-primary))" }}>9. Children&apos;s Privacy</h2>
          <p>
            ApplyReady is not directed at children under 13. We do not knowingly collect personal information from children under 13.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2" style={{ color: "rgb(var(--text-primary))" }}>10. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of significant changes via the app or email.
            Continued use of ApplyReady after changes constitutes acceptance of the updated policy.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2" style={{ color: "rgb(var(--text-primary))" }}>11. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at{" "}
            <a href="mailto:domgbp21@gmail.com" className="font-semibold underline" style={{ color: "#a855f7" }}>
              domgbp21@gmail.com
            </a>.
          </p>
        </section>
      </div>
      </div>
    </div>
  );
}
