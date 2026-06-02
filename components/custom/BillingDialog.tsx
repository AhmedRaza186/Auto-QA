"use client";

import React, { useContext, useMemo, useState } from "react";
import axios from "axios";
import { UserContext } from "@/context/userContext";
import { C } from "@/app/lib/theme";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, CreditCard, AlertCircle } from "lucide-react";

type Plan = {
  label: string;
  priceId: string | undefined;
  creditsLabel: string;
  note?: string;
};

export default function BillingDialog({ triggerText = "Buy credits" }: { triggerText?: string }) {
  const { userDetail } = useContext(UserContext);
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const plans: Plan[] = useMemo(
    () => [
      {
        label: "Starter Plan",
        priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER,
        creditsLabel: "+1000 credits",
        note: "Subscription via Stripe Checkout",
      },
    ],
    []
  );

  const startCheckout = async (priceId: string | undefined) => {
    setError(null);
    if (!userDetail?.id) {
      setError("You must be signed in to purchase credits.");
      return;
    }
    if (!priceId) {
      setError("Missing Stripe price id. Set NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER in your env.");
      return;
    }

    setLoadingPriceId(priceId);
    try {
      const res = await axios.post("/api/checkout/stripe", { priceId, userId: userDetail.id });
      const url = res?.data?.url as string | undefined;
      if (!url) throw new Error("Stripe session url not returned");
      
      window.location.href = url;
    } catch (e: any) {
      setError(e?.response?.data?.error || e?.message || "Failed to start checkout.");
    } finally {
      setLoadingPriceId(null);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className="font-sans font-semibold text-[13px] py-2 px-4 rounded-xl transition-all shadow-sm active:scale-[0.98] border cursor-pointer"
          style={{
            borderColor: C.primaryMid,
            background: C.primaryBg,
            color: C.primary,
          }}
        >
          {triggerText}
        </button>
      </DialogTrigger>

      <DialogContent 
        className="sm:max-w-[420px] p-6 rounded-2xl shadow-xl border"
        style={{ background: C.surface, borderColor: C.border, color: C.ink }}
      >
        <DialogHeader className="pb-4 border-b" style={{ borderColor: C.border }}>
          <DialogTitle className="font-sans font-bold text-lg flex items-center gap-2">
            <CreditCard className="w-5 h-5" style={{ color: C.primary }} />
            Billing & Plans
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 flex flex-col gap-3">
          {plans.map((p) => {
            const isLoading = loadingPriceId === p.priceId;
            return (
              <div
                key={p.label}
                className="border rounded-xl p-4 flex items-center justify-between gap-4 transition-all hover:opacity-90"
                style={{
                  borderColor: C.border,
                  background: C.surfaceAlt,
                }}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-sans font-bold text-lg" style={{ color: C.ink }}>
                    {p.label}
                  </span>
                  <span className="font-sans font-semibold text-sm" style={{ color: C.primary }}>
                    {p.creditsLabel}
                  </span>
                  {p.note && (
                    <span className="font-sans text-[12px] mt-1 " style={{ color: C.muted }}>
                      {p.note}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => startCheckout(p.priceId)}
                  disabled={isLoading}
                  className="font-sans font-semibold text-xs py-2.5 px-4 rounded-xl transition-all disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
                  style={{
                    background: isLoading ? C.border : `linear-gradient(135deg, ${C.primaryDark}, ${C.primary})`,
                    color: "#fff",
                    opacity: isLoading ? 0.6 : 1,
                  }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Redirecting...
                    </>
                  ) : (
                    "Checkout"
                  )}
                </button>
              </div>
            );
          })}

          {error && (
            <div 
              className="flex items-start gap-2.5 border rounded-xl p-3 font-sans text-xs leading-relaxed"
              style={{
                borderColor: "#ef444433",
                background: "#2d0a0a",
                color: "#f87171",
              }}
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}