"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Copy, Share2 } from "lucide-react";
import type { TimelineFilters } from "@/lib/types";
import { createShareLink } from "@/lib/milogApi";
import { useToast } from "@/providers/toast-provider";
import { useDialogFocus } from "@/hooks/use-dialog-focus";

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
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useDialogFocus({ open, dialogRef, onClose });

  useEffect(() => {
    if (!open) return;
    void createShareLink(filters).then(setShareUrl);
  }, [filters, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4 backdrop-blur-sm">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="w-full max-w-xl rounded-lg border border-border bg-card p-5 shadow-soft outline-none"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Share2 className="size-4 text-brand" aria-hidden="true" />
              <h2 id={titleId} className="text-lg font-semibold">Share this filtered view</h2>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Generate a read-only filter link. Recipients must sign in to the same MiLog tenant to view its events.
            </p>
          </div>
          <button
            type="button"
            className="font-mono text-xs text-muted-foreground hover:text-foreground"
            onClick={onClose}
            data-dialog-initial-focus
          >
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
            type="button"
            className="btn btn-primary"
            disabled={!shareUrl}
            onClick={async () => {
              await navigator.clipboard.writeText(shareUrl);
              pushToast({ title: "Share URL copied to clipboard.", tone: "success" });
            }}
          >
            <Copy className="size-4" aria-hidden="true" />
            Copy link
          </button>
        </div>
      </div>
    </div>
  );
}
