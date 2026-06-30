import { useMemo } from "react";

import { AlertCircle, Loader2 } from "lucide-react";

import type { GitChangedFileGroup, GitWorktreeChanges, GitWorktreeFileDiff } from "@yoophi/git-graph";

import { cn } from "../lib/cn";
import { DiffViewer } from "./diff-viewer";

const GROUP_ORDER: GitChangedFileGroup[] = ["conflicted", "staged", "unstaged", "untracked"];
const GROUP_LABELS: Record<GitChangedFileGroup, string> = {
  staged: "Staged",
  unstaged: "Unstaged",
  untracked: "Untracked",
  conflicted: "Conflicted",
};

export type WorktreeChangesViewProps = {
  changes?: GitWorktreeChanges;
  selectedFilePath?: string;
  onSelectFile: (path: string) => void;
  diff?: GitWorktreeFileDiff;
  diffLoading?: boolean;
  diffError?: string | null;
  /** Diff 뷰어 컨테이너 클래스 오버라이드(예: 최대 높이). */
  diffClassName?: string;
};

/** 미커밋(working-tree) 변경 = 카운트 배지 + 그룹별 파일 목록 + 선택 파일 diff. */
export function WorktreeChangesView({
  changes,
  selectedFilePath,
  onSelectFile,
  diff,
  diffLoading = false,
  diffError,
  diffClassName,
}: WorktreeChangesViewProps) {
  const files = changes?.files ?? [];
  const grouped = useMemo(
    () =>
      GROUP_ORDER.map((group) => ({
        group,
        files: files.filter((file) => file.group === group),
      })).filter((entry) => entry.files.length > 0),
    [files],
  );
  const totalCount = files.length;

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "rounded-sm border px-1.5 py-0.5 text-[10px] leading-none",
            totalCount > 0
              ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"
              : "border-border bg-background text-muted-foreground",
          )}
        >
          {totalCount > 0 ? `${totalCount} changed` : "Clean"}
        </span>
        <CountBadge label="Staged" count={changes?.stagedCount ?? 0} />
        <CountBadge label="Unstaged" count={changes?.unstagedCount ?? 0} />
        <CountBadge label="Untracked" count={changes?.untrackedCount ?? 0} />
        {(changes?.conflictedCount ?? 0) > 0 ? (
          <CountBadge label="Conflicted" count={changes?.conflictedCount ?? 0} />
        ) : null}
      </div>

      {totalCount === 0 ? (
        <p className="rounded-md border p-3 text-sm text-muted-foreground">
          No uncommitted changes.
        </p>
      ) : (
        <div className="overflow-hidden rounded-md border text-sm">
          {grouped.map(({ group, files: groupFiles }) => (
            <div key={group}>
              <div className="border-b bg-muted/40 px-2 py-1 text-[11px] font-medium text-muted-foreground">
                {GROUP_LABELS[group]} · {groupFiles.length}
              </div>
              {groupFiles.map((file) => (
                <button
                  className="flex h-8 w-full items-center gap-2 border-b px-2 text-left last:border-b-0 hover:bg-muted/50 data-[selected=true]:bg-muted"
                  data-selected={file.path === selectedFilePath}
                  key={`${file.group}:${file.path}`}
                  onClick={() => onSelectFile(file.path)}
                  title={file.oldPath ? `${file.oldPath} -> ${file.path}` : file.path}
                  type="button"
                >
                  <span className="shrink-0 rounded-sm border bg-background px-1.5 py-0.5 font-mono text-[10px] leading-none text-muted-foreground">
                    {(file.stagedStatus ?? " ").padEnd(1)}
                    {(file.unstagedStatus ?? " ").padEnd(1)}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-mono text-xs">
                    {file.oldPath ? `${file.oldPath} → ${file.path}` : file.path}
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}

      {totalCount === 0 ? null : !selectedFilePath ? (
        <p className="text-sm text-muted-foreground">Select a changed file to inspect its diff.</p>
      ) : diffLoading ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading diff
        </p>
      ) : diffError ? (
        <p className="flex items-start gap-1.5 text-sm leading-5 text-red-600">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{diffError}</span>
        </p>
      ) : diff?.isBinary ? (
        <p className="text-sm text-muted-foreground">
          This file is binary and cannot be displayed as text diff.
        </p>
      ) : diff ? (
        <div className="grid gap-2">
          {diff.isTruncated ? (
            <p className="text-xs text-muted-foreground">Large diff truncated for display.</p>
          ) : null}
          <DiffViewer className={diffClassName} content={diff.content} />
        </div>
      ) : null}
    </div>
  );
}

function CountBadge({ label, count }: { label: string; count: number }) {
  return (
    <span className="rounded-sm border border-border bg-background px-1.5 py-0.5 text-[10px] leading-none text-muted-foreground">
      {label} {count}
    </span>
  );
}
