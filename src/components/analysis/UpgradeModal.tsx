"use client";

import { Crown, Sparkles, FileDown, CheckCircle2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useSubscription } from "@/hooks/useSubscription";

const PRO_FEATURES = [
  "Full AI resume rewrite",
  "5 premium templates",
  "PDF export & download",
  "Editable resume sections",
  "Unlimited analyses",
];

export function UpgradeModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { checkout, loading } = useSubscription();

  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl gradient-brand flex items-center justify-center mx-auto mb-4">
          <Crown className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Upgrade to Pro
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Get your fully rewritten, ATS-optimized resume and start getting more interviews.
        </p>

        <div className="text-left space-y-2.5 mb-6">
          {PRO_FEATURES.map((f) => (
            <div key={f} className="flex items-center gap-2.5 text-sm text-gray-700">
              <CheckCircle2 className="w-4 h-4 text-indigo-500 flex-shrink-0" />
              {f}
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <Button
            className="w-full"
            loading={loading}
            onClick={() => checkout(process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID ?? "")}
            icon={<Sparkles className="w-4 h-4" />}
          >
            Start Pro — $19/month
          </Button>
          <Button
            variant="secondary"
            className="w-full"
            loading={loading}
            onClick={() => checkout(process.env.NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID ?? "")}
            icon={<FileDown className="w-4 h-4" />}
          >
            Annual — $12/month · Save 37%
          </Button>
          <button
            onClick={onClose}
            className="w-full text-sm text-gray-400 hover:text-gray-600 py-2 transition-colors"
          >
            Maybe later
          </button>
        </div>
      </div>
    </Modal>
  );
}
