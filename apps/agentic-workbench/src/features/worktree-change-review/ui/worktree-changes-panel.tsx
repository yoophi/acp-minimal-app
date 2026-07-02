import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { GitCommitIcon, RefreshCwIcon } from "lucide-react";

import { WorktreeChangesView } from "@yoophi/git-ui";

import {
  getWorktreeChanges,
  getWorktreeFileDiff,
} from "@/entities/project/api/git-worktree-repository";
import { projectQueryKeys } from "@/entities/project/api/query-keys";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SystemMessage } from "@/components/ui/system-message";

type WorktreeChangesPanelProps = {
  workingDirectory: string;
  refreshSignal?: number;
};

export function WorktreeChangesPanel({
  workingDirectory,
  refreshSignal = 0,
}: WorktreeChangesPanelProps) {
  const [selectedPath, setSelectedPath] = useState("");
  const changesQuery = useQuery({
    queryKey: projectQueryKeys.worktreeChanges(workingDirectory),
    queryFn: () => getWorktreeChanges(workingDirectory),
  });
  const files = changesQuery.data?.files ?? [];
  const selectedDiffPath = files.some((file) => file.path === selectedPath)
    ? selectedPath
    : (files[0]?.path ?? "");
  const diffQuery = useQuery({
    queryKey: projectQueryKeys.worktreeFileDiff(workingDirectory, selectedDiffPath),
    queryFn: () => getWorktreeFileDiff(workingDirectory, selectedDiffPath),
    enabled: Boolean(selectedDiffPath),
  });

  useEffect(() => {
    void changesQuery.refetch();
  }, [refreshSignal]);

  const isDirty = files.length > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="flex min-w-0 flex-col gap-1.5">
            <CardTitle className="flex items-center gap-2">
              <GitCommitIcon />
              Worktree changes
            </CardTitle>
            <CardDescription>
              Agent 실행 전후의 Git 변경사항과 선택 파일 diff를 확인합니다.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={changesQuery.isFetching}
            onClick={() => void changesQuery.refetch()}
          >
            <RefreshCwIcon data-icon="inline-start" />
            새로고침
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {changesQuery.error ? (
          <SystemMessage variant="error" fill>
            {String(changesQuery.error)}
          </SystemMessage>
        ) : (
          <>
            <WorktreeChangesView
              changes={changesQuery.data}
              selectedFilePath={selectedDiffPath || undefined}
              onSelectFile={setSelectedPath}
              diff={diffQuery.data}
              diffLoading={diffQuery.isFetching}
              diffError={diffQuery.isError ? String(diffQuery.error) : undefined}
              diffClassName="max-h-[28rem]"
            />
            {isDirty && (
              <SystemMessage variant="action" fill>
                변경사항 검토 후 터미널에서 필요한 파일을 stage하고 commit을 만든 뒤 PR을 준비하세요.
              </SystemMessage>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
