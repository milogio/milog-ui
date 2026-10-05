"use client";

import { useId, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDialogFocus } from "@/hooks/use-dialog-focus";

type DrawerSide = "left" | "right";

export function Drawer({
  open,
  side,
  title,
  eyebrow,
  topOffsetClassName = "top-0",
  onClose,
  children,
}: {
  open: boolean;
  side: DrawerSide;
  title: string;
  eyebrow?: string;
  topOffsetClassName?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const dialogRef = useRef<HTMLElement>(null);
  const titleId = useId();
  useDialogFocus({ open, dialogRef, onClose });

  if (!open) return null;

  return (
    <div className={cn("fixed inset-x-0 bottom-0 z-40", topOffsetClassName)}>
      <div
        className="absolute inset-0 cursor-default bg-transparent backdrop-blur-sm"
        aria-hidden="true"
        onClick={onClose}
      />
      <aside
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          "absolute top-0 flex h-full w-full max-w-[420px] flex-col border-border bg-card shadow-soft outline-none sm:w-[420px]",
          side === "left" ? "left-0 border-r" : "right-0 border-l",
        )}
      >
        <header className="flex items-start justify-between gap-4 border-b border-border px-4 py-4">
          <div>
            {eyebrow ? (
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gradient-brand">{eyebrow}</p>
            ) : null}
            <h2 id={titleId} className="mt-1 text-base font-semibold tracking-normal text-foreground">{title}</h2>
          </div>
          <button
            type="button"
            className="btn btn-secondary px-2 py-2"
            onClick={onClose}
            aria-label={`Close ${title}`}
            data-dialog-initial-focus
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </header>
        <div className="flex-1 overflow-auto p-4 scrollbar-thin">{children}</div>
      </aside>
    </div>
  );
}
