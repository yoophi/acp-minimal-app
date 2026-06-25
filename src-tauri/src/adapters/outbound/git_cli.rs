use std::process::Command;

use crate::{
    application::ports::{GitRepositoryValidator, GitWorktreeReader},
    domain::worktree::GitWorktree,
};

pub struct GitCliRepositoryValidator;

impl GitRepositoryValidator for GitCliRepositoryValidator {
    fn validate_repository(&self, path: &str) -> Result<String, String> {
        let output = Command::new("git")
            .args(["-C", path, "rev-parse", "--show-toplevel"])
            .output()
            .map_err(|error| format!("Failed to run git: {error}"))?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
            return Err(if stderr.is_empty() {
                "Path is not a Git repository.".to_string()
            } else {
                stderr
            });
        }

        let git_root = String::from_utf8(output.stdout)
            .map_err(|error| format!("Git returned invalid UTF-8: {error}"))?
            .trim()
            .to_string();

        if git_root.is_empty() {
            return Err("Git repository root could not be resolved.".to_string());
        }

        Ok(git_root)
    }
}

impl GitWorktreeReader for GitCliRepositoryValidator {
    fn list_worktrees(&self, repository_path: &str) -> Result<Vec<GitWorktree>, String> {
        let output = Command::new("git")
            .args(["-C", repository_path, "worktree", "list", "--porcelain"])
            .output()
            .map_err(|error| format!("Failed to run git: {error}"))?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
            return Err(if stderr.is_empty() {
                "Failed to list Git worktrees.".to_string()
            } else {
                stderr
            });
        }

        let stdout = String::from_utf8(output.stdout)
            .map_err(|error| format!("Git returned invalid UTF-8: {error}"))?;

        parse_worktree_porcelain(&stdout)
    }
}

fn parse_worktree_porcelain(output: &str) -> Result<Vec<GitWorktree>, String> {
    let mut worktrees = Vec::new();
    let mut path: Option<String> = None;
    let mut branch: Option<String> = None;
    let mut commit: Option<String> = None;
    let mut is_bare = false;

    for line in output.lines().chain(std::iter::once("")) {
        if line.is_empty() {
            if let Some(current_path) = path.take() {
                let current_commit = commit
                    .take()
                    .ok_or_else(|| format!("Git worktree has no HEAD: {current_path}"))?;
                let is_main = worktrees.is_empty();

                worktrees.push(GitWorktree::new(
                    current_path,
                    branch.take(),
                    current_commit,
                    is_bare,
                    is_main,
                ));
                is_bare = false;
            }

            continue;
        }

        if let Some(value) = line.strip_prefix("worktree ") {
            path = Some(value.to_string());
        } else if let Some(value) = line.strip_prefix("HEAD ") {
            commit = Some(value.to_string());
        } else if let Some(value) = line.strip_prefix("branch ") {
            branch = Some(
                value
                    .strip_prefix("refs/heads/")
                    .unwrap_or(value)
                    .to_string(),
            );
        } else if line == "bare" {
            is_bare = true;
        }
    }

    Ok(worktrees)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_main_and_linked_worktrees() {
        let output = "\
worktree /repo
HEAD abc123
branch refs/heads/main

worktree /repo-feature
HEAD def456
branch refs/heads/feature/worktree-list
";

        let worktrees = parse_worktree_porcelain(output).expect("worktrees should parse");

        assert_eq!(worktrees.len(), 2);
        assert_eq!(worktrees[0].path, "/repo");
        assert_eq!(worktrees[0].branch.as_deref(), Some("main"));
        assert!(worktrees[0].is_main);
        assert_eq!(worktrees[1].path, "/repo-feature");
        assert_eq!(
            worktrees[1].branch.as_deref(),
            Some("feature/worktree-list")
        );
        assert!(!worktrees[1].is_main);
    }

    #[test]
    fn parses_bare_and_detached_worktrees() {
        let output = "\
worktree /repo
HEAD abc123
bare

worktree /repo-detached
HEAD def456
detached
";

        let worktrees = parse_worktree_porcelain(output).expect("worktrees should parse");

        assert!(worktrees[0].is_bare);
        assert_eq!(worktrees[0].branch, None);
        assert_eq!(worktrees[1].branch, None);
    }
}
