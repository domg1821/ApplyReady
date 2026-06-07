"use client";

import { Crown, Infinity, CheckCircle2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useSubscription } from "@/hooks/useSubscription";

const PRO_FEATURES = [
  "Full AI resume rewrite",
  "5 premium templates",
  "PDF export & download",
  "Editable resume sections",
  "Unlimited analyses",
  "All future features included",
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
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-4">
          <Crown className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">
          Get Lifetime Access
        </h2>
        <p className="text-3xl font-bold text-gray-900 mb-1">$15</p>
        <p className="text-sm text-emerald-600 font-semibold mb-4">One payment. Pro forever.</p>
        <p className="text-gray-500 text-sm mb-6">
          Get your fully rewritten, ATS-optimized resume and never pay again.
        </p>

        <div className="text-left space-y-2.5 mb-6">
          {PRO_FEATURES.map((f) => (
            <div key={f} className="flex items-center gap-2.5 text-sm text-gray-700">
              <CheckCircle2 className="w-4 h-4 text-amber-500 flex-shrink-0" />
              {f}
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <Button
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 border-0 shadow-md"
            loading={loading}
            onClick={() => checkout(process.env.NEXT_PUBLIC_STRIPE_LIFETIME_PRICE_ID ?? "", "payment")}
            icon={<Infinity className="w-4 h-4" />}
          >
            Get Lifetime Access — $15
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
