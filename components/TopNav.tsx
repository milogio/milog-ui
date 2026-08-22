"use client";

import { Bell, Download, Filter, LogOut, RefreshCcw, Search, Share2, ToggleLeft, ToggleRight } from "lucide-react";
import { LogoMark } from "@/components/LogoMark";
import { ExportMenu } from "@/components/ExportMenu";

export function TopNav({
  tenantName,
  message,
  onMessageChange,
  onFiltersToggle,
  onRefresh,
  autoRefresh,
  onAutoRefreshChange,
  onShare,
  onAlerts,
  onExportCsv,
  onExportJson,
  exportLoading,
  onLogout,
  lastUpdated,
  readOnly = false,
}: {
  tenantName?: string;
  message: string;
  onMessageChange: (value: string) => void;
  onFiltersToggle?: () => void;
  onRefresh?: () => void;
  autoRefresh?: boolean;
  onAutoRefreshChange?: () => void;
  onShare?: () => void;
  onAlerts?: () => void;
  onExportCsv?: () => void;
  onExportJson?: () => void;
  exportLoading?: boolean;
  onLogout?: () => void;
  lastUpdated?: string;
  readOnly?: boolean;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <LogoMark />
            <div>
              <h1 className="text-base font-semibold tracking-tight text-foreground">MiLog</h1>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                {readOnly ? "Shared timeline" : tenantName ?? "Tenant"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!readOnly && onExportCsv && onExportJson ? (
              <div className="hidden items-center gap-2 sm:flex">
                <ExportMenu onExportCsv={onExportCsv} onExportJson={onExportJson} loading={Boolean(exportLoading)} />
              </div>
            ) : null}
            {!readOnly && onShare ? (
              <button className="btn btn-secondary" onClick={onShare}>
                <Share2 className="size-4" />
                Share
              </button>
            ) : null}
            {!readOnly && onAlerts ? (
              <button className="btn btn-secondary" onClick={onAlerts}>
                <Bell className="size-4" />
                Alerts
              </button>
            ) : null}
            {!readOnly && onLogout ? (
              <button className="btn btn-secondary px-2.5" onClick={onLogout} aria-label="Logout" title="Logout">
                <LogOut className="size-4" />
              </button>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 flex-1 gap-2">
            <label className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                className="input h-9 pl-9 font-mono text-xs"
                placeholder="Search messages, actors, campaigns..."
                value={message}
                onChange={(event) => onMessageChange(event.target.value)}
              />
            </label>
            {onFiltersToggle ? (
              <button className="btn btn-secondary h-9 shrink-0" onClick={onFiltersToggle}>
                <Filter className="size-4" />
                Query
              </button>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {lastUpdated ? <span className="font-mono text-xs">updated {lastUpdated}</span> : null}
            {!readOnly && onExportCsv && onExportJson ? (
              <button className="btn btn-secondary px-2.5 sm:hidden" onClick={onExportCsv} disabled={Boolean(exportLoading)} aria-label="Export CSV" title="Export CSV">
                <Download className="size-4" />
              </button>
            ) : null}
            {!readOnly && onRefresh ? (
              <button className="btn btn-secondary px-2.5" onClick={onRefresh} aria-label="Refresh" title="Refresh">
                <RefreshCcw className="size-4" />
              </button>
            ) : null}
            {!readOnly && onAutoRefreshChange ? (
              <button className="btn btn-secondary px-2.5" onClick={onAutoRefreshChange} aria-label="Toggle auto-refresh" title="Auto-refresh">
                {autoRefresh ? <ToggleRight className="size-4 text-brand" /> : <ToggleLeft className="size-4" />}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
