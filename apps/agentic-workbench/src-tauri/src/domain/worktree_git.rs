// Git history/graph/detail/diff 도메인 타입은 git-core(정본)로 통일됨.
// 기존 `crate::domain::worktree_git::*` 참조 호환을 위해 re-export한다.
pub use git_core::domain::*;
