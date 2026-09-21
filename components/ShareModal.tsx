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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-lg border border-border bg-card p-5 shadow-soft">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Share2 className="size-4 text-brand" />
              <h3 className="text-lg font-semibold">Share this filtered view</h3>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Generate a read-only filter link. Recipients must sign in to the same MiLog tenant to view its events.
            </p>
          </div>
          <button className="font-mono text-xs text-muted-foreground hover:text-foreground" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <label className="space-y-2 text-sm">
            <span className="text-muted-foreground">Generated URL</span>
            <input className="input" readOnly value={shareUrl} />
          </label>
          <p className="rounded-md border border-border bg-background px-3 py-2 text-xs leading-5 text-muted-foreground">
            This link contains filter values only. It does not contain credentials or grant access to timeline data.
          </p>
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
