# AI Prompts — Documentation

Activity: README, lifecycle artifacts, workflow documentation.

---

### Prompt 1 — README generation

**Prompt:** Create README with setup instructions, features, API endpoints, seed users.

**AI Response:** Generated comprehensive README with prerequisites, quick start steps, env var table, state machine diagram, test commands, project structure.

**Accepted:** Full setup guide that reviewer can follow from clone to running app.

**Changed:** Added monorepo env layout section after env loading bug fix. Added symlink instructions for `apps/web/.env`.

**Rejected:** Minimal README with just `npm start` — reviewer needs database setup steps.

---

### Prompt 2 — Part A tool workflow

**Prompt:** Create tool-workflow.md covering all Part A requirements.

**AI Response:** Documented primary tool (Cursor), context setting, requirement analysis, planning, codegen, validation, testing, debugging, review, information avoided, reuse workflow.

**Accepted:** Covers all 11 Part A bullet points from assignment.

**Changed:** Added cross-links to lifecycle artifacts after completion phase.

**Rejected:** Generic AI workflow description — kept project-specific examples.

---

### Prompt 3 — Cursor workflow artifacts

**Prompt:** Generate cursor-workflow folder per assessment Cursor tool requirements.

**AI Response:** Created project-context.md, spec.md, tasks.md, acceptance-criteria.md, cursor-rules-or-instructions.md in tool-specific/cursor-workflow/.

**Accepted:** All five required Cursor artifacts with real project content.

**Changed:** tasks.md tracks phase completion with checkboxes.

**Rejected:** Empty template files — filled with actual decisions and status.

---

### Prompt 4 — Lifecycle artifact batch

**Prompt:** Build all missing submission templates for AI reviewer — requirements, design, test, reflection, prompt history restructure.

**AI Response:** Created 23 new markdown files: design-notes, api-contract, data-model, ui-flow, requirements-analysis, acceptance-criteria, implementation-plan, test-strategy, test-results, debugging-notes, code-review-notes, review-fixes, pr-description, reflection, final-ai-usage-summary, database/setup-notes, ai-prompts/ (7 files).

**Accepted:** Full artifact set per updated assessment document structure.

**Changed:** Mapped assessment `database/` and `src/` paths to monorepo layout in README.

**Rejected:** Copy-pasting templates without project-specific content — all files reference actual code paths and decisions.

---

### Prompt 5 — Assessment structure mapping

**Prompt:** Document how monorepo layout maps to required ai-practical-assessment/ structure.

**AI Response:** Added mapping table in README: apps/ = src/, packages/db/ = database/, ai-prompts/ = prompt history, tool-specific/cursor-workflow/ = Cursor artifacts.

**Accepted:** Reviewer can find any required artifact without confusion.

**Changed:** Kept monorepo structure — better engineering practice than flattening.

**Rejected:** Restructuring entire codebase to match literal `src/` folder — unnecessary churn.
