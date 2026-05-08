Procedi e usa il sito securdata.pro come riferimento di stile/posizionamento e preparo un prompt Copilot operativo, orientato a produrre MVP funzionante e non “fantascienza da repository”. ⚙️🚀

Se è tutto chiaro, qui sotto hai il PROMPT PERFETTO per te GitHub Copilot da UTILIZZARE per repository della mia MVP.

Fonti stile/contesto: la pagina SECURDATA.PRO “Risorse Gratuite” posiziona gli strumenti come pratici, gratuiti, sicuri, senza registrazione obbligatoria e orientati a PMI/professionisti, con focus su produttività, AI, sicurezza e dati locali.

# COPILOT MASTER PROMPT — MYVAULT CREATIVE OS MVP v0.1 

Agisci come Senior Full Stack Developer, Product Architect, UX Designer e Security Engineer.

Devi creare la prima versione MVP di una web app chiamata:

# MYVAULT CREATIVE OS

Una mini web app personale, predisposta in futuro per white label, nata per Vito Iacobellis / IACOBELLIX e coerente con lo stile, il posizionamento e la filosofia SECURDATA.PRO.

## 1. OBIETTIVO DELLA WEB APP

Creare un sistema semplice, veloce e sicuro per:

- catturare idee creative;
- registrare sessioni di lavoro umano + AI;
- organizzare progetti;
- visualizzare l’architettura creativa tramite grafi;
- esportare contenuti in Markdown AI-READY;
- tracciare tempo, risorse, energia e sacrificio personale;
- creare il MASTER CREATIVE ORIGIN LEDGER;
- gestire SUB LEDGER per ogni progetto, es. DJJP, SECURDATA, FXTARDAR, ACADEMY.

Principio fondamentale:

> Ogni intuizione deve poter entrare nel sistema in meno di 30 secondi.

## 1B. MODELLO PRODOTTO / FREEMIUM

La MVP deve essere progettata come versione BETA gratuita con moduli base attivi.

Versione BETA FREE:
- dashboard base;
- project registry;
- capture text/voice base;
- session log base;
- graph view base;
- export Markdown base.

Predisposizione futura moduli PRO / PAID:
- advanced AI analysis;
- multi-workspace;
- white label;
- custom domain;
- OCR avanzato;
- automazioni N8N;
- report business avanzati;
- analytics;
- team/collaboratori;
- export avanzati;
- AI agents specializzati.

Implementa solo la struttura logica/futura predisposizione, senza sistema pagamenti nella v0.1.

Aggiungi campi o enum utili:
- plan_type: FREE / PRO / BUSINESS / WHITE_LABEL
- feature_flags
- module_access






## 2. STACK TECNICO RICHIESTO

Usa preferibilmente:

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Flow per grafi interattivi
- Supabase per database/auth/storage
- Vercel-ready deployment
- Resend-ready per notifiche future
- N8N-ready per automazioni future

Se il progetto esistente usa altro stack, adattati senza distruggere la struttura già funzionante.



## 3. STILE VISIVO

La grafica deve essere coerente con SECURDATA.PRO:

- professionale;
- chiara;
- moderna;
- orientata a PMI, creator, professionisti;
- palette tech: blu notte, azzurro, grigio scuro, bianco, accenti violetto/lilla;
- layout pulito;
- card leggibili;
- dashboard concreta;
- zero complessità inutile.

Il tono UX deve comunicare:

- sicurezza;
- controllo;
- produttività;
- intelligenza operativa;
- tutela della memoria creativa.

## 4. PAGINE MVP OBBLIGATORIE

Crea queste pagine:

### `/`
Landing dashboard privata con:
- totale progetti;
- totale idee;
- totale sessioni;
- ore investite;
- costo economico stimato;
- ultime idee inserite;
- prossima azione consigliata;
- stato rapido del sistema.

### `/projects`
Registro progetti completo.

Funzioni MVP obbligatorie:
- crea progetto;
- modifica progetto;
- rinomina progetto;
- archivia progetto;
- elimina progetto;
- trasferisci progetto a categoria diversa;
- assegna tag;
- cambia priorità;
- cambia stato;
- collega ledger markdown;
- collega idee;
- collega sessioni creative;
- collega AI entities;
- collega graph nodes.

Ogni progetto deve avere:
- dashboard rapida;
- timeline;
- metriche base;
- note;
- stato avanzamento;
- relazione con altri progetti.

Implementa CRUD completo:
- Create
- Read
- Update
- Delete

Con:
- conferma eliminazione;
- soft delete;
- restore futuro predisposto;
- timestamps;
- ownership base.

Progetti iniziali suggeriti:
- MASTER CREATIVE OPERATING SYSTEM
- DJJP
- SECURDATA
- FXTARDAR
- ACADEMY
- FUTURE PROJECTS

### `/capture`
Schermata più importante.

Deve permettere inserimento rapido tramite:
- testo scritto;
- comando vocale / speech-to-text se già presente nel progetto;
- upload immagine per OCR futuro;
- upload file chat;
- appunto grezzo.

Campi:
- titolo;
- progetto collegato;
- testo grezzo;
- tipo input;
- priorità;
- urgenza;
- energia richiesta;
- valore potenziale;
- tag;
- stato;
- note.

Dopo salvataggio mostra:
- testo pulito;
- sintesi;
- tag suggeriti;
- progetto suggerito;
- prossima azione.

Per ora, se AI non disponibile, implementa placeholder pulito per `auto_summary`, `suggested_tags`, `suggested_project`.

### `/sessions`
Registro sessioni creative.

Campi:
- progetto;
- data;
- ora inizio;
- ora fine;
- durata minuti;
- stato energia umana;
- contributo umano;
- contributo AI;
- output generato;
- costo emotivo;
- costo fisico;
- costo economico;
- sleep sacrifice minutes;
- social sacrifice;
- future importance: LOW / MEDIUM / HIGH / CRITICAL.

### `/graph`
Visualizzazione grafica con React Flow.

Crea 3 modalità:
- Creative OS Graph;
- AI Architecture Graph;
- Infrastructure Graph.

Nodi iniziali:
- Vito Iacobellis / IACOBELLIX;
- MASTER CREATIVE ORIGIN LEDGER;
- DJJP;
- SECURDATA;
- ChatGPT;
- Claude;
- Claude Code;
- DeepSeek;
- Suno AI;
- Supabase;
- Vercel;
- N8N;
- Obsidian;
- Copilot;
- MYVAULT.

### `/ledger`
Generatore export Markdown.

Deve generare:
- MASTER_CREATIVE_ORIGIN_LEDGER.md;
- PROJECT_LEDGER_[PROJECT].md;
- SESSION_LOG.md;
- CREATOR_INVESTMENT_INDEX.md;
- AI_ENTITY_REGISTRY.md.

Aggiungi bottone:
- “Generate Markdown”
- “Copy Markdown”
- “Download .md”

### `/settings`
Impostazioni:
- nome autore;
- alias;
- anno nascita;
- luogo macro;
- luogo micro;
- email opzionale;
- tema grafico;
- modalità privata;
- predisposizione white label futura.

La pagina `/settings` deve includere anche:
- piano attuale: FREE / PRO / BUSINESS / WHITE_LABEL;
- stato moduli attivi;
- custom domain;
- subdomain;
- stato DNS;
- tipo cliente: PERSONAL / B2C_CLIENT / B2B_WHITE_LABEL;
- campi base white label: brand name, logo, colori, dominio.


## 5. DATABASE SUPABASE

Crea schema SQL o types TypeScript per queste tabelle:

### `projects`
- id
- name
- slug
- description
- status
- priority
- category
- created_at
- updated_at

### `ideas`
- id
- project_id
- title
- raw_text
- cleaned_text
- summary
- type
- priority
- urgency
- energy_required
- potential_value
- tags
- status
- created_at
- updated_at

### `creative_sessions`
- id
- project_id
- started_at
- ended_at
- duration_minutes
- energy_state
- human_contribution
- ai_contribution
- output_summary
- future_importance
- created_at

### `creator_investment_logs`
- id
- session_id
- time_minutes
- money_spent
- sleep_sacrifice_minutes
- physical_cost
- emotional_cost
- social_cost
- notes
- created_at

### `ai_entities`
- id
- name
- provider
- model
- role
- tool_type
- notes
- created_at

### `raw_inputs`
- id
- input_type
- source_device
- raw_content
- cleaned_content
- detected_project
- detected_tags
- confidence_score
- linked_idea_id
- created_at

### `workspace_settings`
- id
- owner_name
- owner_alias
- birth_year
- macro_location
- micro_location
- brand_name
- brand_color
- logo_url
- private_mode
- created_at
- updated_at

Predisponi anche campi futuri:
- tenant_id
- workspace_id
ma non sviluppare vera multi-tenancy ora.


## 5B. CUSTOM DOMAIN / WHITE LABEL READY

Predisponi la dashboard backoffice per futuro collegamento di domini esterni personalizzati.

Esempi:
- vitoiacobellis.it
- sottodominio cliente: cliente.vitoiacobellis.it
- dominio cliente B2C
- dominio cliente B2B white label

Nella v0.1 NON implementare collegamento DNS automatico completo.

Implementa però:
- sezione settings “Custom Domain”;
- campo dominio personalizzato;
- campo subdomain;
- stato dominio: NOT_CONFIGURED / PENDING_DNS / VERIFIED / ACTIVE / ERROR;
- istruzioni DNS visualizzabili in dashboard;
- placeholder per verifica dominio futura;
- predisposizione per white label B2B/B2C.

Aggiungi campi database:
- custom_domain
- subdomain
- domain_status
- dns_target
- white_label_enabled
- client_type: PERSONAL / B2C_CLIENT / B2B_WHITE_LABEL




## 6. SICUREZZA

Implementa o predisponi:

- autenticazione Supabase;
- Row Level Security;
- dati privati per default;
- nessuna esposizione pubblica di idee personali;
- nessuna chiave segreta lato client;
- `.env.example`;
- README con istruzioni sicurezza;
- export locale Markdown;
- backup manuale.

## 7. INPUT VOCALE

Se nel progetto esiste già tecnologia voice-to-text nella web app, riutilizzala.

Crea componente:

`VoiceCaptureButton`

Funzioni:
- start recording;
- stop recording;
- transcript preview;
- insert into capture form;
- save as raw input.

Se speech-to-text non è configurato, usa Web Speech API del browser come fallback base.

## 8. OCR

Crea predisposizione componente:

`ImageOCRUploader`

Per ora:
- upload immagine;
- preview;
- stato “OCR future ready”;
- campo testo manuale collegato.

Non implementare OCR complesso se rallenta MVP.

## 9. EXPORT MARKDOWN

Il Markdown generato deve avere questa struttura:

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

Per ogni progetto:

# PROJECT LEDGER — [PROJECT NAME]

## Project Identity
## Origin
## Core Ideas
## Sessions
## Human Contribution
## AI Contribution
## Outputs
## Next Actions
10. UX PRIORITÀ

La MVP deve essere:

veloce;
semplice;
usabile da smartphone;
mobile-first;
leggibile;
non dispersiva;
adatta a uso personale quotidiano.

Non creare funzionalità decorative inutili.

11. COMPONENTI UI

Crea componenti:

DashboardCard
ProjectCard
IdeaCaptureForm
VoiceCaptureButton
ImageOCRUploader
CreativeGraph
LedgerExporter
InvestmentIndexCard
SessionForm
TagBadge
PriorityBadge
12. REGOLE DI SVILUPPO

Prima crea:

layout;
routing;
database types;
form capture;
dashboard;
graph base;
markdown export.

Non iniziare da automazioni complesse.

13. OUTPUT RICHIESTO DA COPILOT

Genera:

struttura file;
codice completo MVP;
componenti principali;
schema database;
README;
.env.example;
istruzioni deploy Vercel;
istruzioni setup Supabase;
note sicurezza;
lista TODO v0.2.


14. VINCOLI

Non creare:

marketplace;
community pubblica;
e-commerce;
AI terapeutica;
sistema multiutente complesso;
white label completo;
chatbot pubblico;
automazioni N8N avanzate.

15. VERSIONE MVP

Versione:
MYVAULT_CREATIVE_OS_v0.1

## 15B. VISUAL PROJECT STATUS SYSTEM

Implementa nella dashboard un sistema visivo immediato di stato evolutivo dei progetti.

Obiettivo:
permettere all’utente di capire a colpo d’occhio:
- stato progetto;
- avanzamento;
- energia;
- priorità;
- rischio;
- fase creativa;
- necessità di azione.

--------------------------------------------------
15B.1 PROJECT STATUS COUNTER
--------------------------------------------------

Ogni progetto deve mostrare:

- status label;
- progress bar;
- visual indicator;
- priority color;
- health/risk state;
- last activity;
- next suggested action.

Status suggeriti:

- IDEA
- INCUBATION
- CREATIVE_PHASE
- BUILDING
- TESTING
- PUBLISHED
- VALIDATED
- GROWING
- IMPROVE
- PAUSED
- ARCHIVED
- DELETE_CANDIDATE

--------------------------------------------------
15B.2 VISUAL IMPACT SYSTEM
--------------------------------------------------

Implementa:
- color-coded status;
- animated progress bars leggere;
- glow effects minimal;
- urgency indicators;
- health indicators;
- risk indicators;
- momentum indicators.

Color logic suggerita:

- blue = planning
- violet = creative
- yellow = testing
- green = validated/growing
- orange = warning
- red = critical/delete candidate
- gray = archived

--------------------------------------------------
15B.3 DASHBOARD POPUP SUMMARY
--------------------------------------------------

Implementa popup/panel prioritario opzionale nella dashboard.

Scopo:
mostrare rapidamente:
- progetto più attivo;
- progetto critico;
- progetto fermo;
- prossimo task importante;
- stato energia generale.

Esempio:

PROJECT:
DJJP

STATUS:
CREATIVE_PHASE

MOMENTUM:
HIGH

RISK:
MEDIUM

NEXT ACTION:
Publish Episode #01

LAST ACTIVITY:
2h ago

--------------------------------------------------
15B.4 GLOBAL PROJECT OVERVIEW
--------------------------------------------------

La dashboard principale deve mostrare:
- tutti i progetti;
- stato sintetico;
- percentuale avanzamento;
- livello attività;
- rischio;
- energia richiesta;
- valore potenziale stimato.

--------------------------------------------------
15B.5 FUTURE READY
--------------------------------------------------

Predisporre futura implementazione:
- AI project health analysis;
- burnout prediction;
- automatic stagnation detection;
- suggested pivots;
- creative momentum analysis;
- timeline forecasting;
- project score system;
- creator focus recommendation.

--------------------------------------------------
15B.6 DATABASE PREPARATION
--------------------------------------------------

Aggiungere campi:

projects:
- status
- progress_percent
- health_score
- momentum_score
- risk_score
- priority_level
- next_action
- last_activity_at
- estimated_value
- energy_required
- emotional_weight

--------------------------------------------------
15B.7 UX PRINCIPLE
--------------------------------------------------

La visualizzazione deve essere:
- immediata;
- leggibile;
- non caotica;
- elegante;
- cinematica leggera;
- professionale;
- mobile friendly.

L’utente deve capire lo stato generale del proprio ecosistema creativo in meno di 5 secondi.


Obiettivo finale della v0.1:

Inserisco un’idea in testo o voce, la collego a un progetto, la vedo in dashboard, la collego nel grafo e la esporto in Markdown AI-ready.

Procedi con codice pulito, modulare, commentato, pronto per GitHub e Vercel.


# Nota operativa
IMPORTANTE: nella v0.1 non implementare pagamenti reali, billing, Stripe, multi-tenant completo o DNS automation reale. Predisponi solo database, UI, stati e architettura futura. 

Questi sono futuri sviluppi.

## 16. FUTURE EVOLUTION READY

La MVP deve essere progettata con architettura predisposta per future versioni PRO/BUSINESS/WHITE LABEL.

NON implementare ora le funzionalità complete.
Predisporre:
- struttura database;
- componenti placeholder;
- settings;
- feature flags;
- enum;
- access control;
- modularità codice.

--------------------------------------------------
16.1 ADVANCED SECURITY READY
--------------------------------------------------

Predisporre futura implementazione:
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

--------------------------------------------------
16.2 AUTO TRANSLATION READY
--------------------------------------------------

Predisporre futura implementazione:
- automatic multilingual translation;
- auto language detection;
- multilingual markdown export;
- AI localization;
- internationalization (i18n);
- translation memory system.

Database predisposizione:
- language_code
- translated_content
- original_language
- translation_status

--------------------------------------------------
16.3 AI ASSISTANT & ACCESSIBILITY READY
--------------------------------------------------

Predisporre:
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
- support for special needs users;
- simplified UI mode;
- AI popup assistant.

Modalità future:
- text assistant;
- voice assistant;
- ambient assistant;
- guided onboarding.

--------------------------------------------------
16.4 USER PROFILE READY
--------------------------------------------------

Predisporre:
- profile photo;
- profile colors;
- personal themes;
- creator bio;
- creator statistics;
- profile identity card;
- personal dashboard customization.

Database predisposizione:
- avatar_url
- theme
- accent_color
- creator_bio
- profile_visibility

--------------------------------------------------
16.5 TEAM & COLLABORATION READY
--------------------------------------------------

Predisporre futura gestione:
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

Ruoli futuri:
- OWNER
- ADMIN
- EDITOR
- VIEWER
- MARKETING
- AI_OPERATOR

Database predisposizione:
- team_id
- role
- permissions
- shared_modules
- access_expiration

--------------------------------------------------
16.6 WHITE LABEL READY
--------------------------------------------------

Predisporre:
- white label branding;
- custom logos;
- custom colors;
- custom domains;
- subdomains;
- client dashboards;
- client isolated workspaces;
- future SaaS architecture.

NON implementare multi-tenant completo nella v0.1.
Solo predisposizione architetturale.

## DEVELOPMENT PRIORITY

IMPORTANT:
Do NOT overengineer the MVP.

Prioritize:
- simplicity;
- speed;
- maintainability;
- readability;
- modular growth;
- low dependency count;
- fast deployment.

Avoid:
- unnecessary abstractions;
- enterprise complexity;
- excessive packages;
- premature optimization;
- advanced microservices architecture.

The MVP must remain lightweight, fast and evolvable.


## AI COST AWARENESS

Future AI integrations must be designed with:
- token efficiency;
- low-cost fallback models;
- optional AI processing;
- manual override;
- async processing where possible.

Avoid unnecessary expensive AI calls.


## MARKDOWN STANDARDIZATION

All exported markdown files must:
- follow consistent structure;
- use stable headings;
- support Obsidian compatibility;
- support future AI parsing;
- support graph linking;
- support long-term archival.

Markdown exports are considered canonical memory assets.




Questo prompt è già pronto per Copilot

Aiutami a ricordarmi della prima cosa da chiedereti alla fine dopo averlo incollato e dopo il tuo lavoro di sviluppo:

```text
Analizza il repository corrente e dimmi prima quali file esistono, quale stack è già attivo e quali modifiche minime servono per integrare MYVAULT_CREATIVE_OS_v0.1 senza rompere nulla.
