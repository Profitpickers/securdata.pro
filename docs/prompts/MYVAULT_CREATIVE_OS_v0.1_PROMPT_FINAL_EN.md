> **Operational directive:** Use securdata.pro as the style/positioning reference and produce a functional MVP — not repository fiction. ⚙️🚀
>
> If everything is clear, below is the PERFECT PROMPT for GitHub Copilot to use on this MVP repository.
>
> **Style/context sources:** The SECURDATA.PRO "Free Resources" page positions tools as practical, free, secure, registration-free, and aimed at SMEs/professionals, with a focus on productivity, AI, security, and local data.

---

# COPILOT MASTER PROMPT — MYVAULT CREATIVE OS MVP v0.1

Act as Senior Full Stack Developer, Product Architect, UX Designer, and Security Engineer.

You must build the first MVP version of a web app called:

# MYVAULT CREATIVE OS

A personal mini web app — future white-label ready — created for Vito Iacobellis / IACOBELLIX and aligned with the style, positioning, and philosophy of SECURDATA.PRO.

---

## 1. WEB APP OBJECTIVE

Build a simple, fast, and secure system to:

- capture creative ideas;
- log human + AI work sessions;
- organize projects;
- visualize creative architecture via graphs;
- export content as AI-READY Markdown;
- track time, resources, energy, and personal sacrifice;
- create the MASTER CREATIVE ORIGIN LEDGER;
- manage SUB LEDGERs per project (e.g., DJJP, SECURDATA, FXTARDAR, ACADEMY).

**Core principle:**

> Every insight must be able to enter the system in under 30 seconds.

---

## 1B. PRODUCT MODEL / FREEMIUM

The MVP must be designed as a free BETA version with base modules active.

**BETA FREE version:**
- base dashboard;
- project registry;
- basic text/voice capture;
- base session log;
- base graph view;
- base Markdown export.

**Future PRO / PAID modules (predisposition only):**
- advanced AI analysis;
- multi-workspace;
- white label;
- custom domain;
- advanced OCR;
- N8N automations;
- advanced business reports;
- analytics;
- team / collaborators;
- advanced exports;
- specialized AI agents.

Implement only the logical structure and future scaffolding — no payment system in v0.1.

Add useful fields or enums:
- `plan_type`: `FREE` / `PRO` / `BUSINESS` / `WHITE_LABEL`
- `feature_flags`
- `module_access`

---

## 2. REQUIRED TECH STACK

Prefer:

- **Next.js**
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui**
- **React Flow** — interactive graphs
- **Supabase** — database / auth / storage
- **Vercel-ready** deployment
- **Resend-ready** for future notifications
- **N8N-ready** for future automations

If the existing project uses a different stack, adapt without breaking the current working structure.

---

## 3. VISUAL STYLE

The UI must be consistent with SECURDATA.PRO:

- professional;
- clean;
- modern;
- oriented toward SMEs, creators, and professionals;
- tech color palette: midnight blue, azure, dark gray, white, violet/lilac accents;
- clean layout;
- readable cards;
- concrete dashboard;
- zero unnecessary complexity.

UX tone must communicate:

- security;
- control;
- productivity;
- operational intelligence;
- protection of creative memory.

---

## 4. REQUIRED MVP PAGES

### `/`
Private landing dashboard with:
- total projects;
- total ideas;
- total sessions;
- hours invested;
- estimated financial cost;
- latest inserted ideas;
- next suggested action;
- quick system status.

### `/projects`
Full project registry.

**Required MVP functions:**
- create project;
- edit project;
- rename project;
- archive project;
- delete project;
- transfer project to a different category;
- assign tags;
- change priority;
- change status;
- link markdown ledger;
- link ideas;
- link creative sessions;
- link AI entities;
- link graph nodes.

Each project must have:
- quick dashboard;
- timeline;
- base metrics;
- notes;
- progress status;
- relationship with other projects.

Implement full CRUD:
- Create
- Read
- Update
- Delete

With:
- deletion confirmation;
- soft delete;
- future restore predisposition;
- timestamps;
- base ownership.

**Suggested initial projects:**
- MASTER CREATIVE OPERATING SYSTEM
- DJJP
- SECURDATA
- FXTARDAR
- ACADEMY
- FUTURE PROJECTS

### `/capture`
Most important screen.

Must allow fast input via:
- typed text;
- voice command / speech-to-text (if already present in the project);
- image upload for future OCR;
- chat file upload;
- raw note.

**Fields:**
- title;
- linked project;
- raw text;
- input type;
- priority;
- urgency;
- energy required;
- potential value;
- tags;
- status;
- notes.

After saving, display:
- cleaned text;
- summary;
- suggested tags;
- suggested project;
- next action.

If AI is not available, implement clean placeholders for `auto_summary`, `suggested_tags`, `suggested_project`.

### `/sessions`
Creative session log.

**Fields:**
- project;
- date;
- start time;
- end time;
- duration in minutes;
- human energy state;
- human contribution;
- AI contribution;
- generated output;
- emotional cost;
- physical cost;
- economic cost;
- sleep sacrifice minutes;
- social sacrifice;
- `future_importance`: `LOW` / `MEDIUM` / `HIGH` / `CRITICAL`.

### `/graph`
Graph visualization with React Flow.

Create 3 modes:
- Creative OS Graph;
- AI Architecture Graph;
- Infrastructure Graph.

**Initial nodes:**
- Vito Iacobellis / IACOBELLIX
- MASTER CREATIVE ORIGIN LEDGER
- DJJP
- SECURDATA
- ChatGPT
- Claude
- Claude Code
- DeepSeek
- Suno AI
- Supabase
- Vercel
- N8N
- Obsidian
- Copilot
- MYVAULT

### `/ledger`
Markdown export generator.

Must generate:
- `MASTER_CREATIVE_ORIGIN_LEDGER.md`
- `PROJECT_LEDGER_[PROJECT].md`
- `SESSION_LOG.md`
- `CREATOR_INVESTMENT_INDEX.md`
- `AI_ENTITY_REGISTRY.md`

Add buttons:
- **"Generate Markdown"**
- **"Copy Markdown"**
- **"Download .md"**

### `/settings`
Settings:
- author name;
- alias;
- birth year;
- macro location;
- micro location;
- optional email;
- graphic theme;
- private mode;
- future white label predisposition.

The `/settings` page must also include:
- current plan: `FREE` / `PRO` / `BUSINESS` / `WHITE_LABEL`;
- active modules status;
- custom domain;
- subdomain;
- DNS status;
- client type: `PERSONAL` / `B2C_CLIENT` / `B2B_WHITE_LABEL`;
- base white label fields: brand name, logo, colors, domain.

---

## 5. SUPABASE DATABASE

Create SQL schema or TypeScript types for these tables:

### `projects`
| Field | Type |
|-------|------|
| `id` | uuid |
| `name` | text |
| `slug` | text |
| `description` | text |
| `status` | enum |
| `priority` | enum |
| `category` | text |
| `created_at` | timestamp |
| `updated_at` | timestamp |

### `ideas`
| Field | Type |
|-------|------|
| `id` | uuid |
| `project_id` | uuid (FK) |
| `title` | text |
| `raw_text` | text |
| `cleaned_text` | text |
| `summary` | text |
| `type` | text |
| `priority` | enum |
| `urgency` | enum |
| `energy_required` | int |
| `potential_value` | int |
| `tags` | text[] |
| `status` | enum |
| `created_at` | timestamp |
| `updated_at` | timestamp |

### `creative_sessions`
| Field | Type |
|-------|------|
| `id` | uuid |
| `project_id` | uuid (FK) |
| `started_at` | timestamp |
| `ended_at` | timestamp |
| `duration_minutes` | int |
| `energy_state` | text |
| `human_contribution` | text |
| `ai_contribution` | text |
| `output_summary` | text |
| `future_importance` | enum |
| `created_at` | timestamp |

### `creator_investment_logs`
| Field | Type |
|-------|------|
| `id` | uuid |
| `session_id` | uuid (FK) |
| `time_minutes` | int |
| `money_spent` | numeric |
| `sleep_sacrifice_minutes` | int |
| `physical_cost` | int |
| `emotional_cost` | int |
| `social_cost` | int |
| `notes` | text |
| `created_at` | timestamp |

### `ai_entities`
| Field | Type |
|-------|------|
| `id` | uuid |
| `name` | text |
| `provider` | text |
| `model` | text |
| `role` | text |
| `tool_type` | text |
| `notes` | text |
| `created_at` | timestamp |

### `raw_inputs`
| Field | Type |
|-------|------|
| `id` | uuid |
| `input_type` | text |
| `source_device` | text |
| `raw_content` | text |
| `cleaned_content` | text |
| `detected_project` | text |
| `detected_tags` | text[] |
| `confidence_score` | float |
| `linked_idea_id` | uuid (FK) |
| `created_at` | timestamp |

### `workspace_settings`
| Field | Type |
|-------|------|
| `id` | uuid |
| `owner_name` | text |
| `owner_alias` | text |
| `birth_year` | int |
| `macro_location` | text |
| `micro_location` | text |
| `brand_name` | text |
| `brand_color` | text |
| `logo_url` | text |
| `private_mode` | boolean |
| `created_at` | timestamp |
| `updated_at` | timestamp |

Also predispose future fields:
- `tenant_id`
- `workspace_id`

Do NOT implement real multi-tenancy in v0.1.

---

## 5B. CUSTOM DOMAIN / WHITE LABEL READY

Prepare the backoffice dashboard for future connection of external custom domains.

Examples:
- `vitoiacobellis.it`
- client subdomain: `client.vitoiacobellis.it`
- B2C client domain
- B2B white label domain

In v0.1 do **NOT** implement full automatic DNS linking.

Implement:
- "Custom Domain" settings section;
- custom domain field;
- subdomain field;
- domain status: `NOT_CONFIGURED` / `PENDING_DNS` / `VERIFIED` / `ACTIVE` / `ERROR`;
- DNS instructions viewable in dashboard;
- placeholder for future domain verification;
- predisposition for B2B/B2C white label.

Add database fields:
- `custom_domain`
- `subdomain`
- `domain_status`
- `dns_target`
- `white_label_enabled`
- `client_type`: `PERSONAL` / `B2C_CLIENT` / `B2B_WHITE_LABEL`

---

## 6. SECURITY

Implement or predispose:

- Supabase authentication;
- Row Level Security (RLS);
- private data by default;
- no public exposure of personal ideas;
- no secret keys on the client side;
- `.env.example`;
- README with security instructions;
- local Markdown export;
- manual backup.

---

## 7. VOICE INPUT

If voice-to-text technology already exists in the web app, reuse it.

Create component: **`VoiceCaptureButton`**

Functions:
- start recording;
- stop recording;
- transcript preview;
- insert into capture form;
- save as raw input.

If speech-to-text is not configured, use the browser's **Web Speech API** as a base fallback.

---

## 8. OCR

Create component predisposition: **`ImageOCRUploader`**

For now:
- image upload;
- preview;
- status label: "OCR future ready";
- linked manual text field.

Do not implement complex OCR if it slows down the MVP.

---

## 9. MARKDOWN EXPORT STRUCTURE

All exported Markdown files must follow this structure:

```markdown
# MASTER CREATIVE ORIGIN LEDGER

## HUMAN ENTITY
Name:
Alias:
Birth Year:
Current Age:
Macro Location:
Micro Location:

## PROJECT INDEX

## CREATIVE SESSIONS

## AI ENTITY REGISTRY

## CREATOR INVESTMENT INDEX

## IDEAS ARCHIVE

## FUTURE ACTIONS
```

For each project:

```markdown
# PROJECT LEDGER — [PROJECT NAME]

## Project Identity
## Origin
## Core Ideas
## Sessions
## Human Contribution
## AI Contribution
## Outputs
## Next Actions
```

---

## 10. UX PRIORITIES

The MVP must be:

- fast;
- simple;
- usable on smartphones;
- mobile-first;
- readable;
- focused;
- suited for daily personal use.

Do not create decorative or non-functional features.

---

## 11. UI COMPONENTS

Create components:

- `DashboardCard`
- `ProjectCard`
- `IdeaCaptureForm`
- `VoiceCaptureButton`
- `ImageOCRUploader`
- `CreativeGraph`
- `LedgerExporter`
- `InvestmentIndexCard`
- `SessionForm`
- `TagBadge`
- `PriorityBadge`

---

## 12. DEVELOPMENT RULES

Build in this order:

1. layout;
2. routing;
3. database types;
4. capture form;
5. dashboard;
6. base graph;
7. Markdown export.

Do not start from complex automations.

---

## 13. REQUIRED OUTPUT FROM COPILOT

Generate:

- file structure;
- complete MVP code;
- main components;
- database schema;
- `README.md`;
- `.env.example`;
- Vercel deploy instructions;
- Supabase setup instructions;
- security notes;
- v0.2 TODO list.

---

## 14. CONSTRAINTS

Do **NOT** create:

- marketplace;
- public community;
- e-commerce;
- therapeutic AI;
- complex multi-user system;
- complete white label;
- public chatbot;
- advanced N8N automations.

---

## 15. MVP VERSION

```
Version: MYVAULT_CREATIVE_OS_v0.1
```

---

## 15B. VISUAL PROJECT STATUS SYSTEM

Implement a visual real-time project status system in the dashboard.

**Objective:** allow the user to understand at a glance:
- project status;
- progress;
- energy;
- priority;
- risk;
- creative phase;
- need for action.

---

### 15B.1 PROJECT STATUS COUNTER

Each project must display:

- status label;
- progress bar;
- visual indicator;
- priority color;
- health/risk state;
- last activity;
- next suggested action.

**Suggested statuses:**

```
IDEA | INCUBATION | CREATIVE_PHASE | BUILDING | TESTING
PUBLISHED | VALIDATED | GROWING | IMPROVE | PAUSED
ARCHIVED | DELETE_CANDIDATE
```

---

### 15B.2 VISUAL IMPACT SYSTEM

Implement:
- color-coded status;
- lightweight animated progress bars;
- minimal glow effects;
- urgency indicators;
- health indicators;
- risk indicators;
- momentum indicators.

**Color logic:**

| Color | Meaning |
|-------|---------|
| blue | planning |
| violet | creative |
| yellow | testing |
| green | validated / growing |
| orange | warning |
| red | critical / delete candidate |
| gray | archived |

---

### 15B.3 DASHBOARD POPUP SUMMARY

Implement an optional priority popup/panel in the dashboard.

**Purpose:** quickly display:
- most active project;
- critical project;
- stalled project;
- next important task;
- overall energy state.

**Example:**

```
PROJECT:       DJJP
STATUS:        CREATIVE_PHASE
MOMENTUM:      HIGH
RISK:          MEDIUM
NEXT ACTION:   Publish Episode #01
LAST ACTIVITY: 2h ago
```

---

### 15B.4 GLOBAL PROJECT OVERVIEW

The main dashboard must display:
- all projects;
- summary status;
- progress percentage;
- activity level;
- risk;
- energy required;
- estimated potential value.

---

### 15B.5 FUTURE READY

Predispose future implementation of:
- AI project health analysis;
- burnout prediction;
- automatic stagnation detection;
- suggested pivots;
- creative momentum analysis;
- timeline forecasting;
- project score system;
- creator focus recommendation.

---

### 15B.6 DATABASE PREPARATION

Add fields to `projects` table:

| Field | Type |
|-------|------|
| `status` | enum |
| `progress_percent` | int |
| `health_score` | float |
| `momentum_score` | float |
| `risk_score` | float |
| `priority_level` | enum |
| `next_action` | text |
| `last_activity_at` | timestamp |
| `estimated_value` | numeric |
| `energy_required` | int |
| `emotional_weight` | int |

---

### 15B.7 UX PRINCIPLE

The visualization must be:
- immediate;
- readable;
- non-chaotic;
- elegant;
- lightly cinematic;
- professional;
- mobile friendly.

> The user must understand the overall state of their creative ecosystem in under 5 seconds.

---

## FINAL MVP OBJECTIVE — v0.1

> I enter an idea via text or voice, link it to a project, see it in the dashboard, connect it in the graph, and export it as AI-ready Markdown.

Proceed with clean, modular, commented code — ready for GitHub and Vercel.

---

## OPERATIONAL NOTE

> **IMPORTANT:** In v0.1, do NOT implement real payments, billing, Stripe, full multi-tenant, or real DNS automation. Predispose only database, UI, states, and future architecture. These are future developments.

---

## 16. FUTURE EVOLUTION READY

The MVP must be designed with architecture predisposed for future PRO / BUSINESS / WHITE LABEL versions.

Do **NOT** implement full features now.  
Predispose:
- database structure;
- placeholder components;
- settings;
- feature flags;
- enums;
- access control;
- modular code.

---

### 16.1 ADVANCED SECURITY READY

Predispose future implementation of:
- multi-factor authentication;
- biometric authentication;
- encrypted vault;
- encrypted local export;
- secure workspace isolation;
- zero-trust architecture;
- role-based permissions;
- advanced audit logs;
- session monitoring;
- encrypted AI memory zones.

---

### 16.2 AUTO TRANSLATION READY

Predispose future implementation of:
- automatic multilingual translation;
- auto language detection;
- multilingual Markdown export;
- AI localization;
- internationalization (i18n);
- translation memory system.

**Database predisposition fields:**
- `language_code`
- `translated_content`
- `original_language`
- `translation_status`

---

### 16.3 AI ASSISTANT & ACCESSIBILITY READY

Predispose:
- AI assistant sidebar;
- contextual help;
- auto-suggestion system;
- disappearing helper tips;
- voice guidance;
- voice command system;
- speech-to-text;
- text-to-speech;
- accessibility mode;
- hands-free interaction;
- support for users with special needs;
- simplified UI mode;
- AI popup assistant.

**Future modes:**
- text assistant;
- voice assistant;
- ambient assistant;
- guided onboarding.

---

### 16.4 USER PROFILE READY

Predispose:
- profile photo;
- profile colors;
- personal themes;
- creator bio;
- creator statistics;
- profile identity card;
- personal dashboard customization.

**Database predisposition fields:**
- `avatar_url`
- `theme`
- `accent_color`
- `creator_bio`
- `profile_visibility`

---

### 16.5 TEAM & COLLABORATION READY

Predispose future management of:
- collaborators;
- teams;
- permissions;
- shared projects;
- shared ledgers;
- module-based sharing;
- marketing collaboration;
- internal creative teams;
- external agencies;
- read-only access;
- temporary access links.

**Future roles:**
```
OWNER | ADMIN | EDITOR | VIEWER | MARKETING | AI_OPERATOR
```

**Database predisposition fields:**
- `team_id`
- `role`
- `permissions`
- `shared_modules`
- `access_expiration`

---

### 16.6 WHITE LABEL READY

Predispose:
- white label branding;
- custom logos;
- custom colors;
- custom domains;
- subdomains;
- client dashboards;
- client isolated workspaces;
- future SaaS architecture.

> Do **NOT** implement full multi-tenancy in v0.1. Architectural predisposition only.

---

## DEVELOPMENT PRIORITY

> **IMPORTANT:** Do NOT overengineer the MVP.

**Prioritize:**
- simplicity;
- speed;
- maintainability;
- readability;
- modular growth;
- low dependency count;
- fast deployment.

**Avoid:**
- unnecessary abstractions;
- enterprise complexity;
- excessive packages;
- premature optimization;
- advanced microservices architecture.

> The MVP must remain lightweight, fast, and evolvable.

---

## AI COST AWARENESS

Future AI integrations must be designed with:
- token efficiency;
- low-cost fallback models;
- optional AI processing;
- manual override;
- async processing where possible.

> Avoid unnecessary expensive AI calls.

---

## MARKDOWN STANDARDIZATION

All exported Markdown files must:
- follow a consistent structure;
- use stable headings;
- support Obsidian compatibility;
- support future AI parsing;
- support graph linking;
- support long-term archival.

> Markdown exports are considered **canonical memory assets**.

---

## POST-GENERATION FIRST PROMPT

After pasting this prompt and after Copilot's development work, run the following as the **first follow-up command**:

```text
Analyze the current repository and tell me first: which files exist, which stack is already active, and what minimal changes are needed to integrate MYVAULT_CREATIVE_OS_v0.1 without breaking anything.
```
