// 미커밋(working-tree) 변경 도메인 타입은 git-core(정본)로 통일됨.
// 기존 `crate::domain::git_worktree_changes::*` 참조 호환을 위해 re-export한다.
pub use git_core::domain::{GitWorktreeChanges, GitWorktreeFileDiff};
