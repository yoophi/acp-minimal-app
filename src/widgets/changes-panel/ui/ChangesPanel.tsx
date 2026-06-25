import { useQuery } from "@tanstack/react-query";
import { AlertCircle, FolderGit2, GitCommit, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@yoophi/ui/components/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@yoophi/ui/components/table";
import {
  getAppInfo,
  listWorktrees,
  repositoryKeys,
  type GitWorktree,
  type Repository,
} from "@/entities/repository";

type ChangesPanelProps = {
  selectedRepository?: Repository;
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function getWorktreeKind(worktree: GitWorktree) {
  if (worktree.isBare) {
    return "Bare";
  }

  return worktree.isMain ? "Main" : "Linked";
}

function getShortCommit(commit: string) {
  return commit.slice(0, 8);
}

export function ChangesPanel({ selectedRepository }: ChangesPanelProps) {
  const appInfo = useQuery({
    queryKey: ["app-info"],
    queryFn: getAppInfo,
  });
  const worktreesQuery = useQuery({
    enabled: Boolean(selectedRepository),
    queryKey: selectedRepository
      ? repositoryKeys.worktrees(selectedRepository.id)
      : ["repositories", "unselected", "worktrees"],
    queryFn: () => listWorktrees(selectedRepository?.id ?? ""),
  });

  return (
    <section className="flex h-full min-h-0 flex-col">
      <header className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <GitCommit className="size-4 text-muted-foreground" />
          <div className="min-w-0">
            <h2 className="truncate text-sm font-medium">
              {selectedRepository?.name ?? "Working Tree"}
            </h2>
            <p className="truncate text-xs text-muted-foreground">
              {selectedRepository?.path ??
                (appInfo.data
                  ? `${appInfo.data.name} ${appInfo.data.version}`
                  : "Loading app info")}
            </p>
          </div>
        </div>
        <Button
          aria-label="Refresh worktrees"
          disabled={!selectedRepository || worktreesQuery.isFetching}
          size="icon-sm"
          variant="outline"
          onClick={() => void worktreesQuery.refetch()}
        >
          {worktreesQuery.isFetching ? <Loader2 className="animate-spin" /> : <RefreshCw />}
        </Button>
      </header>
      <div className="min-h-0 flex-1 overflow-auto p-4">
        {!selectedRepository ? (
          <div className="flex h-full min-h-80 items-center justify-center">
            <div className="max-w-sm text-center">
              <FolderGit2 className="mx-auto size-10 text-muted-foreground" />
              <h2 className="mt-3 text-sm font-medium">No repository selected</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Add a local Git repository from the sidebar, then select it to inspect its state.
              </p>
            </div>
          </div>
        ) : worktreesQuery.isLoading ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading worktrees
          </p>
        ) : worktreesQuery.isError ? (
          <p className="flex items-start gap-1.5 text-sm leading-5 text-red-600">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{getErrorMessage(worktreesQuery.error)}</span>
          </p>
        ) : worktreesQuery.data?.length === 0 ? (
          <div className="flex h-full min-h-80 items-center justify-center">
            <div className="max-w-sm text-center">
              <FolderGit2 className="mx-auto size-10 text-muted-foreground" />
              <h2 className="mt-3 text-sm font-medium">No worktrees found</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                This repository does not have any Git worktrees to display.
              </p>
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Path</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead className="w-28">Commit</TableHead>
                <TableHead className="w-24">Kind</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {worktreesQuery.data?.map((worktree) => (
                <TableRow key={worktree.path}>
                  <TableCell className="max-w-0 truncate font-mono text-xs">
                    {worktree.path}
                  </TableCell>
                  <TableCell className="max-w-0 truncate">
                    {worktree.branch ?? "Detached"}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {getShortCommit(worktree.commit)}
                  </TableCell>
                  <TableCell>{getWorktreeKind(worktree)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </section>
  );
}
