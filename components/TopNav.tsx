"use client";

import { Bell, Download, Filter, LogOut, RefreshCcw, Share2, ToggleLeft, ToggleRight } from "lucide-react";
import { LogoMark } from "@/components/LogoMark";
import { ExportMenu } from "@/components/ExportMenu";
import { QueryFilterBar } from "@/components/QueryFilterBar";
import type { TimelineFilters } from "@/lib/types";

export function TopNav({
  tenantName,
  filters,
  onFiltersChange,
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
  filters: TimelineFilters;
  onFiltersChange: (filters: TimelineFilters) => void;
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

        <div>
          <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Query</p>
          <QueryFilterBar filters={filters} onChange={onFiltersChange} />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">{lastUpdated ? `Updated ${lastUpdated}` : "Waiting for timeline"}</span>
            {onFiltersToggle ? (
              <button className="btn btn-secondary h-8 shrink-0 px-2.5 text-xs" onClick={onFiltersToggle}>
                <Filter className="size-4" />
                All filters
              </button>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {!readOnly && onExportCsv && onExportJson ? (
              <>
                <div className="hidden sm:flex"><ExportMenu onExportCsv={onExportCsv} onExportJson={onExportJson} loading={Boolean(exportLoading)} /></div>
                <button className="btn btn-secondary px-2.5 sm:hidden" onClick={onExportCsv} disabled={Boolean(exportLoading)} aria-label="Export CSV" title="Export CSV"><Download className="size-4" /></button>
              </>
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
