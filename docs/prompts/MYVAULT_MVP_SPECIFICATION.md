# MYVAULT CREATIVE OS — MVP SPECIFICATION (v0.1)

## Purpose
Build a functional, lightweight MVP aligned with `docs/architecture/MYVAULT_SYSTEM_OVERVIEW.md`:
- capture ideas quickly;
- organize projects;
- preserve creative memory;
- generate AI-ready Markdown;
- visualize the creative ecosystem.

## Product Scope (v0.1)
Implement **only** MVP features and future-ready scaffolding:
- FREE beta baseline modules active;
- no billing/payment system;
- no full multi-tenant;
- no full DNS automation.

## Required Stack (preferred)
- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Flow
- Supabase
- Vercel-ready deployment

If the repo uses different technologies, adapt without breaking existing structure.

## MVP Pages
- `/` dashboard (key counters, latest ideas, next action, status)
- `/projects` full project CRUD + archive + links + base metrics
- `/capture` fast input (text/voice if available/image upload placeholder/raw note)
- `/sessions` creative session log (time, contribution, costs, sacrifice, importance)
- `/graph` React Flow visualization modes
- `/ledger` Markdown export generator
- `/settings` profile/workspace/base plan/module/domain placeholders

## Core Data Model (Supabase)
Prepare schema/types for:
- `projects`
- `ideas`
- `creative_sessions`
- `creator_investment_logs`
- `ai_entities`
- `raw_inputs`
- `workspace_settings`

Predispose (no full implementation): `tenant_id`, `workspace_id`.

## Security Baseline
- Supabase auth
- RLS-by-default
- private data by default
- no secrets on client
- `.env.example`
- security notes in README
- local Markdown export + manual backup

## MVP Components
- `DashboardCard`
- `ProjectCard`
- `IdeaCaptureForm`
- `VoiceCaptureButton` (with Web Speech API fallback)
- `ImageOCRUploader` (future-ready placeholder)
- `CreativeGraph`
- `LedgerExporter`
- `InvestmentIndexCard`
- `SessionForm`
- `TagBadge`
- `PriorityBadge`

## Markdown Export Baseline
Generate:
- `MASTER_CREATIVE_ORIGIN_LEDGER.md`
- `PROJECT_LEDGER_[PROJECT].md`
- `SESSION_LOG.md`
- `CREATOR_INVESTMENT_INDEX.md`
- `AI_ENTITY_REGISTRY.md`

Provide actions:
- Generate Markdown
- Copy Markdown
- Download `.md`

## UX & Delivery Rules
- mobile-first, fast, readable, practical
- no decorative complexity
- build order: layout → routing → DB types → capture → dashboard → graph → export
- avoid overengineering

## MVP Constraints
Do not implement in v0.1:
- marketplace/community/e-commerce
- therapeutic AI
- advanced public chatbot
- full white-label and full multi-user enterprise system
- complex automations

## MVP Version
`MYVAULT_CREATIVE_OS_v0.1`
