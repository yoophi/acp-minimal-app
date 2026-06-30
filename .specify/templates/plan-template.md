# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]

**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: [e.g., Python 3.11, Swift 5.9, Rust 1.75 or NEEDS CLARIFICATION]

**Primary Dependencies**: [e.g., FastAPI, UIKit, LLVM or NEEDS CLARIFICATION]

**Storage**: [if applicable, e.g., PostgreSQL, CoreData, files or N/A]

**Testing**: [e.g., pytest, XCTest, cargo test or NEEDS CLARIFICATION]

**Target Platform**: [e.g., Linux server, iOS 15+, WASM or NEEDS CLARIFICATION]

**Project Type**: [e.g., library/cli/web-service/mobile-app/compiler/desktop-app or NEEDS CLARIFICATION]

**Performance Goals**: [domain-specific, e.g., 1000 req/s, 10k lines/sec, 60 fps or NEEDS CLARIFICATION]

**Constraints**: [domain-specific, e.g., <200ms p95, <100MB memory, offline-capable or NEEDS CLARIFICATION]

**Scale/Scope**: [domain-specific, e.g., 10k users, 1M LOC, 50 screens or NEEDS CLARIFICATION]

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Answer each gate with PASS/FAIL/N/A and cite the concrete files or plan
sections that justify the answer.

- **Monorepo Boundary First**: Does the plan keep app-specific code under
  `apps/*`, reusable TypeScript under `packages/*`, and reusable Rust under
  `crates/*`? Are app-to-app imports avoided?
- **Feature-Sliced Frontend Architecture**: For frontend work, are changes
  placed in the correct `app`, `pages`, `features`, `entities`, `shared`, or
  `components/ui` layer?
- **Hexagonal Tauri Backend Architecture**: For backend work, are domain,
  application, inbound, infrastructure, and ports kept separate? Do Tauri
  commands delegate to application services?
- **Shared Core Before Shared UI**: If sharing is proposed, is pure core shared
  before UI? If UI is shared, is it independent of app shell/Tauri APIs?
- **Atomic Cross-App Verification**: If `packages/*` or `crates/*` changes,
  does the plan list verification for all affected consumer apps?
- **Documentation and Storybook**: Are required `docs/*.md` updates and
  Storybook stories identified for reusable UI?
- **Testing and Safety**: Are unit/fixture tests planned for pure logic and
  root/path/session-owner validation planned for filesystem, persistence,
  agent, session, permission, or exchange changes?

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# App frontend work:
apps/[app]/src/
├── app/                # composition, providers, routing state
├── pages/              # screen-level UI
├── features/           # user actions and business interactions
├── entities/           # domain models, API adapters, helpers
├── shared/             # cross-domain utilities and UI primitives
└── components/ui/      # shadcn/ui generated components

# App Tauri backend work:
apps/[app]/src-tauri/src/
├── domain/             # pure domain models and ports
├── application/        # use cases and business rules
├── inbound/            # Tauri commands and inbound adapters
├── infrastructure/     # filesystem, Git, ACP, persistence, OS adapters
└── ports/              # backend ports when separated from domain

# Cross-app reusable TypeScript:
packages/[package]/src/

# Cross-app reusable Rust:
crates/[crate]/src/

# Project documentation:
docs/[english-file-name].md
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
