"use client";

import { useEffect, useState } from "react";
import { Copy, Share2 } from "lucide-react";
import type { TimelineFilters } from "@/lib/types";
import { createShareLink } from "@/lib/milogApi";
import { useToast } from "@/providers/toast-provider";

export function ShareModal({
  open,
  onClose,
  filters,
}: {
  open: boolean;
  onClose: () => void;
  filters: TimelineFilters;
}) {
  const { pushToast } = useToast();
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    if (!open) return;
    void createShareLink(filters).then(setShareUrl);
  }, [filters, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="panel w-full max-w-xl rounded-3xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Share2 className="size-4 text-primary" />
              <h3 className="text-lg font-semibold">Share this timeline</h3>
            </div>
            <p className="mt-2 text-sm text-muted">
              Generate a read-only MiLog timeline URL from the current filter state.
            </p>
          </div>
          <button className="text-sm text-muted hover:text-foreground" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <label className="space-y-2 text-sm">
            <span className="text-muted">Generated URL</span>
            <input className="input" readOnly value={shareUrl} />
          </label>
          <label className="space-y-2 text-sm">
            <span className="text-muted">Expiry</span>
            <input className="input opacity-60" disabled value="Coming soon" />
          </label>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            className="btn btn-primary"
            onClick={async () => {
              await navigator.clipboard.writeText(shareUrl);
              pushToast({ title: "Share URL copied to clipboard.", tone: "success" });
            }}
          >
            <Copy className="size-4" />
            Copy link
          </button>
        </div>
      </div>
    </div>
  );
}
