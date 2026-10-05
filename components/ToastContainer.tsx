"use client";

import React from "react";
import { CheckCircle2, Info, AlertTriangle, X } from "lucide-react";
import { usePixora } from "@/lib/context/PixoraContext";

export function ToastContainer() {
  const { toasts, removeToast } = usePixora();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
      {toasts.map((toast) => {
        const isSuccess = toast.type === "success";
        const isInfo = toast.type === "info";
        const isWarning = toast.type === "warning";

        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-start gap-3 p-4 rounded-2xl bg-[#150F2E] text-[#F3F0FF] shadow-2xl shadow-purple-950/50 border border-[#8B5CF6]/30 backdrop-blur-xl animate-in slide-in-from-bottom-3 duration-200"
          >
            <div className="shrink-0 mt-0.5">
              {isSuccess && <CheckCircle2 className="w-4 h-4 text-[#22D3EE]" />}
              {isInfo && <Info className="w-4 h-4 text-[#8B5CF6]" />}
              {isWarning && <AlertTriangle className="w-4 h-4 text-amber-400" />}
            </div>

            <div className="flex-1 min-w-0">
              <h5 className="text-xs font-semibold text-white">{toast.title}</h5>
              {toast.description && (
                <p className="text-[11px] text-[#A59ECA] mt-0.5 leading-snug">
                  {toast.description}
                </p>
              )}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 p-1 rounded-lg text-[#A59ECA] hover:text-white hover:bg-[#8B5CF6]/20 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
