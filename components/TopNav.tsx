"use client";

import { Bell, LoaderCircle, LogOut, RefreshCcw, Share2, ToggleLeft, ToggleRight } from "lucide-react";
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
  refreshing = false,
  onLogout,
  lastUpdated,
  loadedEventCount,
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
  refreshing?: boolean;
  onLogout?: () => void;
  lastUpdated?: string;
  loadedEventCount?: number;
  readOnly?: boolean;
}) {
  return (
    <header className="relative z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl md:sticky md:top-0">
      <div className="mx-auto flex max-w-7xl flex-col gap-1.5 px-4 py-1.5 md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <LogoMark />
            <div className="min-w-0">
              <p className="truncate font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                {readOnly ? `${tenantName ?? "Tenant"} · Read-only` : tenantName ?? "Tenant"}
              </p>
              <h1 className="truncate text-base font-semibold tracking-tight text-foreground">{title}</h1>
            </div>
            <time
              className="hidden font-mono text-[11px] text-muted-foreground lg:inline"
              aria-live="polite"
              aria-label={lastUpdated ? `Timeline last updated ${lastUpdated}` : "Waiting for timeline data"}
            >
              {lastUpdated ? `Updated ${lastUpdated}` : "Waiting for timeline"}
            </time>
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

        <QueryFilterBar
          filters={filters}
          onChange={onFiltersChange}
          onAdvancedFilters={onFiltersToggle}
          loadedEventCount={loadedEventCount}
        >
          <LogLevelQuickFilters filters={filters} onChange={onFiltersChange} />
        </QueryFilterBar>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <div className="flex w-full flex-wrap items-center justify-start gap-2 sm:w-auto sm:justify-end">
            <time
              className="font-mono text-xs text-muted-foreground lg:hidden"
              aria-live="polite"
              aria-label={lastUpdated ? `Timeline last updated ${lastUpdated}` : "Waiting for timeline data"}
            >
              {lastUpdated ? `Updated ${lastUpdated}` : "Waiting for timeline"}
            </time>
            {metadataControl}
            {!readOnly && onExportCsv && onExportJson ? (
              <ExportMenu onExportCsv={onExportCsv} onExportJson={onExportJson} loading={Boolean(exportLoading)} />
            ) : null}
            {!readOnly && onRefresh ? (
              <button
                className="btn btn-secondary px-2.5"
                onClick={onRefresh}
                disabled={refreshing}
                aria-label={refreshing ? "Refreshing timeline" : "Refresh timeline now"}
                title={refreshing ? "Refreshing timeline" : "Refresh timeline now"}
              >
                {refreshing ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <RefreshCcw className="size-4" aria-hidden="true" />}
                <span className="hidden sm:inline">{refreshing ? "Refreshing…" : "Refresh"}</span>
              </button>
            ) : null}
            {!readOnly && onAutoRefreshChange ? (
              <button
                className="btn btn-secondary px-2.5"
                onClick={onAutoRefreshChange}
                aria-label={`Auto-refresh is ${autoRefresh ? "on" : "off"}. Toggle auto-refresh`}
                aria-pressed={Boolean(autoRefresh)}
                title={`Auto-refresh is ${autoRefresh ? "on" : "off"}`}
              >
                {autoRefresh ? <ToggleRight className="size-4 text-brand" aria-hidden="true" /> : <ToggleLeft className="size-4" aria-hidden="true" />}
                <span className="hidden sm:inline">Auto-refresh:</span>
                <span className="sm:hidden">Auto:</span>
                <span>{autoRefresh ? "On" : "Off"}</span>
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
