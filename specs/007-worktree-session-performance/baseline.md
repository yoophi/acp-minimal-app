# Baseline / 개선 후 측정 기록

계측 코드(T001, T002)가 들어간 상태에서 quickstart.md 절차로 수집한다.
**개선 전(baseline) 수치는 Phase 2(T004) 적용 전 커밋에서 측정해야 한다** — `git stash` 또는 해당 커밋 체크아웃 후 `AW_PERF_LOG=1 pnpm --filter agentic-workbench tauri dev`.

## 측정 환경

| 항목 | 값 |
|---|---|
| 측정일 | (기입) |
| 장비 | (기입) |
| 다중 worktree 프로젝트 | (worktree 수 기입) |
| 대형 이력 저장소 | (commit 수 기입) |

## Baseline (개선 전)

| 메트릭 | 수치 | 비고 |
|---|---|---|
| `session:shell-rendered` | (ms) | quickstart S1 |
| `session:graph-first-row` | (ms) | quickstart S1 |
| 세션 진입 직후 command `wait_ms` 최대값 | (ms) | 직렬화 정도 |
| `list_git_worktrees` run_ms / 내부 git status 횟수 | (ms / 회) | |
| graph 첫 페이지 run_ms | (ms) | |
| graph 뒤 페이지(10페이지째) run_ms | (ms) | S5 |
| idle 10분 watcher git 이벤트 수 | (회) | S2, 되먹임 가설 검증 |

## 개선 후 (구현 완료 시점)

| 메트릭 | 수치 | 목표(SC) | 판정 |
|---|---|---|---|
| `session:shell-rendered` | (ms) | < 1,000ms (SC-001) | |
| 세션 진입 직후 command `wait_ms` 최대값 | (ms) | 직렬 대기 소멸 (SC-002) | |
| idle 10분 watcher git 이벤트로 인한 graph 재조회 | (회) | 0회 (SC-003) | |
| graph 뒤 페이지 run_ms / 첫 페이지 run_ms | (배) | ≤ 2배 (SC-006) | |
| 1,000+ row 로드 후 DOM row 수 | (개) | viewport 수준 (SC-007) | |
