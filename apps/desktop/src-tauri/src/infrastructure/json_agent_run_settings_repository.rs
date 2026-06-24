use std::{fs, path::PathBuf};

use tauri::{AppHandle, Manager};

use crate::domain::{
    agent_run_settings::AgentRunSettings, agent_run_settings_repository::AgentRunSettingsRepository,
};

pub struct JsonAgentRunSettingsRepository {
    store_path: PathBuf,
}

impl JsonAgentRunSettingsRepository {
    pub fn from_app(app: &AppHandle) -> Result<Self, String> {
        let dir = app
            .path()
            .app_data_dir()
            .map_err(|error| format!("Failed to resolve app data directory: {error}"))?;

        fs::create_dir_all(&dir)
            .map_err(|error| format!("Failed to create app data directory: {error}"))?;

        Ok(Self {
            store_path: dir.join("agent-run-settings.json"),
        })
    }
}

impl AgentRunSettingsRepository for JsonAgentRunSettingsRepository {
    fn load_settings(&self) -> Result<Vec<AgentRunSettings>, String> {
        if !self.store_path.exists() {
            return Ok(Vec::new());
        }

        let contents = fs::read_to_string(&self.store_path)
            .map_err(|error| format!("Failed to read agent run settings store: {error}"))?;

        serde_json::from_str(&contents)
            .map_err(|error| format!("Failed to parse agent run settings store: {error}"))
    }

    fn save_settings(&self, settings: &[AgentRunSettings]) -> Result<(), String> {
        let contents = serde_json::to_string_pretty(settings)
            .map_err(|error| format!("Failed to serialize agent run settings: {error}"))?;

        fs::write(&self.store_path, contents)
            .map_err(|error| format!("Failed to write agent run settings store: {error}"))
    }
}
