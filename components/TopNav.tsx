"use client";

import { Bell, LogOut, RefreshCcw, Search, Share2, Sidebar, ToggleLeft, ToggleRight } from "lucide-react";
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
    <header className="glass sticky top-0 z-30 border-b border-white/8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {onFiltersToggle ? (
              <button className="btn btn-secondary lg:hidden" onClick={onFiltersToggle}>
                <Sidebar className="size-4" />
              </button>
            ) : null}
            <LogoMark />
            <div>
              <h1 className="text-lg font-semibold text-foreground">MiLog</h1>
              <p className="text-xs tracking-[0.2em] text-muted uppercase">
                {readOnly ? "Shared timeline" : tenantName ?? "Tenant"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!readOnly && onExportCsv && onExportJson ? (
              <ExportMenu onExportCsv={onExportCsv} onExportJson={onExportJson} loading={Boolean(exportLoading)} />
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
              <button className="btn btn-secondary" onClick={onLogout}>
                <LogOut className="size-4" />
                Logout
              </button>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted" />
            <input
              className="input pl-11"
              placeholder="Search messages, actors, campaigns..."
              value={message}
              onChange={(event) => onMessageChange(event.target.value)}
            />
          </label>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
            {lastUpdated ? <span>Last updated {lastUpdated}</span> : null}
            {!readOnly && onRefresh ? (
              <button className="btn btn-secondary" onClick={onRefresh}>
                <RefreshCcw className="size-4" />
                Refresh
              </button>
            ) : null}
            {!readOnly && onAutoRefreshChange ? (
              <button className="btn btn-secondary" onClick={onAutoRefreshChange}>
                {autoRefresh ? <ToggleRight className="size-4 text-secondary" /> : <ToggleLeft className="size-4" />}
                Auto-refresh
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
