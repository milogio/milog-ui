"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Braces, ChevronDown, Download, FileSpreadsheet, LoaderCircle } from "lucide-react";

export function ExportMenu({
  onExportCsv,
  onExportJson,
  loading,
}: {
  onExportCsv: () => void;
  onExportJson: () => void;
  loading: boolean;
}) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    if (!open) return;

    function closeWhenOutside(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }

    document.addEventListener("pointerdown", closeWhenOutside);
    return () => document.removeEventListener("pointerdown", closeWhenOutside);
  }, [open]);

  function openMenu(itemIndex = 0) {
    setOpen(true);
    window.requestAnimationFrame(() => itemRefs.current[itemIndex]?.focus());
  }

  function closeMenu({ returnFocus = false } = {}) {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  }

  function runExport(handler: () => void) {
    closeMenu({ returnFocus: true });
    handler();
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        className="btn btn-secondary"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        disabled={loading}
        onClick={() => (open ? closeMenu() : openMenu())}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            openMenu(0);
          }
          if (event.key === "ArrowUp") {
            event.preventDefault();
            openMenu(1);
          }
        }}
      >
        {loading ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <Download className="size-4" aria-hidden="true" />}
        {loading ? "Exporting…" : "Export"}
        {!loading ? <ChevronDown className="size-3.5 text-muted-foreground" aria-hidden="true" /> : null}
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label="Export format"
          className="panel absolute right-0 top-[calc(100%+0.375rem)] z-50 min-w-44 overflow-hidden p-1"
          onKeyDown={(event) => {
            const currentIndex = itemRefs.current.indexOf(document.activeElement as HTMLButtonElement);
            if (event.key === "Escape") {
              event.preventDefault();
              closeMenu({ returnFocus: true });
            } else if (event.key === "ArrowDown") {
              event.preventDefault();
              itemRefs.current[(currentIndex + 1) % itemRefs.current.length]?.focus();
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              itemRefs.current[(currentIndex - 1 + itemRefs.current.length) % itemRefs.current.length]?.focus();
            } else if (event.key === "Tab") {
              closeMenu();
            }
          }}
        >
          <button
            ref={(node) => { itemRefs.current[0] = node; }}
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-foreground hover:bg-accent"
            onClick={() => runExport(onExportCsv)}
          >
            <FileSpreadsheet className="size-4 text-muted-foreground" aria-hidden="true" />
            Export CSV
          </button>
          <button
            ref={(node) => { itemRefs.current[1] = node; }}
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-foreground hover:bg-accent"
            onClick={() => runExport(onExportJson)}
          >
            <Braces className="size-4 text-muted-foreground" aria-hidden="true" />
            Export JSON
          </button>
        </div>
      ) : null}
    </div>
  );
}
