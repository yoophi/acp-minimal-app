use git_core::GitWorktreeStatusReader;

use crate::domain::git_worktree_changes::{GitWorktreeChanges, GitWorktreeFileDiff};

pub fn get_worktree_changes(
    reader: &impl GitWorktreeStatusReader,
    working_directory: String,
) -> Result<GitWorktreeChanges, String> {
    let working_directory = normalize_required(working_directory, "Working directory")?;
    reader.status(&working_directory)
}

pub fn get_worktree_file_diff(
    reader: &impl GitWorktreeStatusReader,
    working_directory: String,
    path: String,
) -> Result<GitWorktreeFileDiff, String> {
    let working_directory = normalize_required(working_directory, "Working directory")?;
    let path = normalize_required(path, "File path")?;
    reader.diff(&working_directory, &path)
}

fn normalize_required(value: String, field_name: &str) -> Result<String, String> {
    let value = value.trim().to_owned();

    if value.is_empty() {
        return Err(format!("{field_name} is required."));
    }

    Ok(value)
}

#[cfg(test)]
mod tests {
    use git_core::{GitChangedFile, GitChangedFileGroup, GitWorktreeStatusReader};

    use crate::domain::git_worktree_changes::{GitWorktreeChanges, GitWorktreeFileDiff};

    use super::*;

    struct FakeReader;

    impl GitWorktreeStatusReader for FakeReader {
        fn status(&self, working_directory: &str) -> Result<GitWorktreeChanges, String> {
            Ok(GitWorktreeChanges {
                working_directory: working_directory.to_string(),
                files: vec![GitChangedFile {
                    path: "src/main.ts".into(),
                    old_path: None,
                    staged_status: Some("M".into()),
                    unstaged_status: None,
                    group: GitChangedFileGroup::Staged,
                }],
                staged_count: 1,
                unstaged_count: 0,
                untracked_count: 0,
                conflicted_count: 0,
            })
        }

        fn diff(
            &self,
            _working_directory: &str,
            path: &str,
        ) -> Result<GitWorktreeFileDiff, String> {
            Ok(GitWorktreeFileDiff {
                path: path.to_string(),
                content: "diff --git".into(),
                is_binary: false,
                is_truncated: false,
            })
        }
    }

    #[test]
    fn trims_working_directory_for_status_lookup() {
        let changes =
            get_worktree_changes(&FakeReader, " /repo ".into()).expect("changes should load");

        assert_eq!(changes.working_directory, "/repo");
        assert_eq!(changes.staged_count, 1);
    }

    #[test]
    fn rejects_blank_file_diff_path_before_provider_call() {
        let error = get_worktree_file_diff(&FakeReader, "/repo".into(), " ".into())
            .expect_err("blank path should fail");

        assert_eq!(error, "File path is required.");
    }
}
