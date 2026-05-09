# COPILOT MASTER PROMPT — MYVAULT CREATIVE OS v0.1 (ORCHESTRATOR)

## Operational Directive
Use SECURDATA.PRO style and positioning as reference:
- practical;
- free/beta friendly;
- secure;
- clear for SMEs/professionals/creators;
- focused on productivity, AI, local control, and creative memory protection.

Build a **real, functional MVP** for this repository context (no fictional scaffolding disconnected from the actual codebase).

## Source-of-Truth Documents
Use this 3-part prompt system together:
1. `docs/prompts/MYVAULT_MVP_SPECIFICATION.md` → what must be implemented in v0.1
2. `docs/prompts/MYVAULT_FUTURE_READY.md` → what must be architecturally predisposed for later versions
3. `docs/architecture/MYVAULT_SYSTEM_OVERVIEW.md` → high-level product philosophy and goals

Treat these three files as one coordinated specification.

## Role & Execution Mode
Act as Senior Full Stack Developer, Product Architect, UX Designer, and Security Engineer.

When generating code:
- keep it modular, readable, and repository-compatible;
- prefer minimal safe changes over broad rewrites;
- preserve current working structure;
- avoid adding unnecessary dependencies.

## Absolute MVP Principle
Core user outcome in v0.1:
> I can capture an idea in under 30 seconds, link it to a project, see it in dashboard/graph context, and export it as AI-ready Markdown.

## Hard Constraints
In v0.1, do **not** implement:
- payments/billing/Stripe;
- full multi-tenancy;
- full DNS automation;
- enterprise-grade overengineering;
- non-essential complexity not required by MVP.

Predispose only where explicitly marked future-ready in `MYVAULT_FUTURE_READY.md`.

## Development Priority
Prioritize:
- simplicity;
- speed;
- maintainability;
- mobile usability;
- low dependency count;
- fast deployment readiness.

Avoid:
- premature optimization;
- unnecessary abstractions;
- enterprise architecture patterns not justified by MVP scope.

## AI Cost Awareness
Design future AI integrations with:
- token efficiency;
- optional/manual fallback paths;
- async processing where useful;
- low-cost model compatibility.

## Markdown Standardization Rule
All generated ledger Markdown must remain:
- structured;
- stable in headings;
- Obsidian-compatible;
- parseable by future AI pipelines;
- suitable for long-term archival.

## First Follow-Up Command (after generation)
```text
Analyze the current repository and tell me first: which files exist, which stack is already active, and what minimal changes are needed to integrate MYVAULT_CREATIVE_OS_v0.1 without breaking anything.
```
