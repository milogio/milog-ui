"use client";

import { Bell, Download, Filter, LogOut, RefreshCcw, Share2, ToggleLeft, ToggleRight } from "lucide-react";
import { LogoMark } from "@/components/LogoMark";
import { ExportMenu } from "@/components/ExportMenu";
import { QueryFilterBar } from "@/components/QueryFilterBar";
import { LogLevelQuickFilters } from "@/components/LogLevelQuickFilters";
import type { TimelineFilters } from "@/lib/types";

export function TopNav({
  title = "Tenant event timeline",
  tenantName,
  metadataControl,
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
  title?: string;
  tenantName?: string;
  metadataControl?: React.ReactNode;
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
    <header className="z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl md:sticky md:top-0">
      <div className="mx-auto flex max-w-7xl flex-col gap-1.5 px-4 py-1.5 md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <LogoMark />
            <div className="min-w-0">
              <p className="truncate font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                {readOnly ? tenantName ?? "Read-only view" : tenantName ?? "Tenant"}
              </p>
              <h1 className="truncate text-base font-semibold tracking-tight text-foreground">{title}</h1>
            </div>
            <span className="hidden font-mono text-[11px] text-muted-foreground lg:inline">
              {lastUpdated ? `Updated ${lastUpdated}` : "Waiting for timeline"}
            </span>
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

        <QueryFilterBar filters={filters} onChange={onFiltersChange} />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <LogLevelQuickFilters filters={filters} onChange={onFiltersChange} />
          <div className="flex w-full flex-wrap items-center justify-start gap-2 sm:w-auto sm:justify-end">
            <span className="font-mono text-xs text-muted-foreground lg:hidden">
              {lastUpdated ? `Updated ${lastUpdated}` : "Waiting for timeline"}
            </span>
            {onFiltersToggle ? (
              <button className="btn btn-secondary h-8 shrink-0 px-2.5 text-xs" onClick={onFiltersToggle}>
                <Filter className="size-4" />
                All filters
              </button>
            ) : null}
            {metadataControl}
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
