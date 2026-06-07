import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export default function TermsPage() {
  const lastUpdated = "June 7, 2026";

  return (
    <div className="min-h-screen animate-page-in" style={{ backgroundColor: "rgb(var(--bg))", paddingTop: "max(1.25rem, env(safe-area-inset-top))" }}>
      {/* Header */}
      <div className="border-b mb-6" style={{ backgroundColor: "rgb(var(--surface))", borderColor: "rgb(var(--border))" }}>
        <div className="max-w-2xl mx-auto px-5 pb-4 flex items-center gap-3">
          <Link href="/settings" className="p-1.5 rounded-xl transition-colors" style={{ color: "rgb(var(--text-muted))" }}>
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(147,97,253,0.1)" }}>
            <FileText className="w-4 h-4" style={{ color: "#a855f7" }} />
          </div>
          <h1 className="text-xl font-bold" style={{ color: "rgb(var(--text-primary))" }}>Terms of Service</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 pb-16 space-y-6 text-sm leading-relaxed" style={{ color: "rgb(var(--text-secondary))" }}>
        <p className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>Last updated: {lastUpdated}</p>

        <section>
          <h2 className="font-bold text-base mb-2" style={{ color: "rgb(var(--text-primary))" }}>1. Acceptance of Terms</h2>
          <p>
            By using ApplyReady, you agree to these Terms of Service. If you do not agree, please do not use the app.
            These terms apply to all users of the ApplyReady mobile app and web application.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2" style={{ color: "rgb(var(--text-primary))" }}>2. Description of Service</h2>
          <p>
            ApplyReady is an AI-powered resume builder and job application assistant. Features include AI resume creation,
            resume analysis, cover letter generation, LinkedIn bio writing, interview preparation, and job application tracking.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2" style={{ color: "rgb(var(--text-primary))" }}>3. User Accounts</h2>
          <p className="mb-2">You are responsible for:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Maintaining the confidentiality of your account credentials</li>
            <li>All activities that occur under your account</li>
            <li>Providing accurate and truthful information in your resume</li>
            <li>Notifying us immediately of any unauthorized use of your account</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2" style={{ color: "rgb(var(--text-primary))" }}>4. Purchases & Subscriptions</h2>
          <p className="mb-2">
            ApplyReady offers a one-time Lifetime Access purchase. All purchases are processed through the Apple App Store
            and are subject to Apple&apos;s terms and conditions.
          </p>
          <p className="mb-2"><strong>Refund Policy:</strong> In-app purchases are subject to Apple&apos;s refund policy. To request a refund, contact Apple support directly.</p>
          <p>Free features remain available indefinitely. Pro features require a Lifetime Access purchase.</p>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2" style={{ color: "rgb(var(--text-primary))" }}>5. Acceptable Use</h2>
          <p className="mb-2">You agree not to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Use ApplyReady for any illegal or unauthorized purpose</li>
            <li>Submit false or misleading resume information</li>
            <li>Attempt to reverse-engineer or hack the app</li>
            <li>Share your account with others</li>
            <li>Use automated means to access the service</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2" style={{ color: "rgb(var(--text-primary))" }}>6. AI-Generated Content</h2>
          <p>
            AI-generated content (resumes, cover letters, etc.) is provided as a starting point and may require editing.
            You are solely responsible for reviewing, verifying, and taking ownership of any content before submitting it
            to employers. ApplyReady does not guarantee employment outcomes.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2" style={{ color: "rgb(var(--text-primary))" }}>7. Intellectual Property</h2>
          <p>
            The ApplyReady app, its design, and all non-user-generated content are owned by ApplyReady. You retain ownership
            of the resume content you create. By using the app, you grant us a limited license to process your content
            for the purpose of providing our services.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2" style={{ color: "rgb(var(--text-primary))" }}>8. Disclaimer of Warranties</h2>
          <p>
            ApplyReady is provided "as is" without warranties of any kind. We do not guarantee that the service will be
            error-free, uninterrupted, or that AI-generated content will be suitable for any specific job application.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2" style={{ color: "rgb(var(--text-primary))" }}>9. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, ApplyReady shall not be liable for any indirect, incidental, special,
            or consequential damages arising from your use of the app, including but not limited to loss of employment opportunities.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2" style={{ color: "rgb(var(--text-primary))" }}>10. Termination</h2>
          <p>
            We reserve the right to suspend or terminate accounts that violate these terms. You may delete your account
            at any time from the Settings page.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2" style={{ color: "rgb(var(--text-primary))" }}>11. Changes to Terms</h2>
          <p>
            We may update these terms periodically. Continued use of ApplyReady after changes constitutes acceptance.
            We will notify you of material changes via the app.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2" style={{ color: "rgb(var(--text-primary))" }}>12. Contact</h2>
          <p>
            For questions about these Terms, contact us at{" "}
            <a href="mailto:domgbp21@gmail.com" className="font-semibold underline" style={{ color: "#a855f7" }}>
              domgbp21@gmail.com
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
}
