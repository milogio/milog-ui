"use client";

import { Download } from "lucide-react";

export function ExportMenu({
  onExportCsv,
  onExportJson,
  loading,
}: {
  onExportCsv: () => void;
  onExportJson: () => void;
  loading: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <button className="btn btn-secondary" onClick={onExportCsv} disabled={loading}>
        <Download className="size-4" />
        {loading ? "Exporting..." : "CSV"}
      </button>
      <button className="btn btn-secondary" onClick={onExportJson} disabled={loading}>
        JSON
      </button>
    </div>
  );
}
