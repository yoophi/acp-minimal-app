import type { WorktreeFileListScope } from "@/entities/worktree-file/api/worktree-file-repository";

export const worktreeFileQueryKeys = {
  all: ["worktree-files"] as const,
  list: (workingDirectory: string) =>
    ["worktree-files", "list", workingDirectory] as const,
  // scope별 목록. list(workingDirectory) prefix를 공유해 watcher invalidation이
  // scope query까지 함께 무효화한다.
  listScope: (workingDirectory: string, scope: WorktreeFileListScope) =>
    ["worktree-files", "list", workingDirectory, scope] as const,
  textFile: (workingDirectory: string, path: string) =>
    ["worktree-files", "text-file", workingDirectory, path] as const,
};
