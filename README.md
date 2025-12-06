<div align="center">

# 🃏 Klondike-Spec

### A Prompting Framework for Long-Running GitHub Copilot Agents

*Teach Copilot to work like a senior engineer across multiple sessions*

[![Built with Copilot](https://img.shields.io/badge/Built%20with-GitHub%20Copilot-blue?logo=github)](https://github.com/features/copilot)
[![Inspired by Anthropic](https://img.shields.io/badge/Inspired%20by-Anthropic%20Research-orange)](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Play Demo](https://img.shields.io/badge/Play%20Demo-Klondike%20Solitaire-brightgreen)](https://thomasrohde.github.io/klondike-spec/)

[The Problem](#the-problem) • [The Solution](#the-solution) • [Quick Start](#-quick-start) • [Use in Your Project](#-use-in-your-own-project) • [Demo: Klondike Solitaire](#-demo-klondike-solitaire)

</div>

---

## The Story

This project started as an experiment: *Can we apply [Anthropic's research on long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents) to GitHub Copilot?*

Anthropic discovered that AI agents fail in predictable ways when working on complex projects:
- **One-shotting**: Trying to build everything at once
- **Premature victory**: Declaring "done" without proper verification
- **Context loss**: Each new session starts with amnesia
- **Broken handoffs**: Half-implemented, undocumented code

Their solution? Structured artifacts that bridge context windows—progress files, feature registries, and session rituals.

We adapted these ideas into a **prompting framework for GitHub Copilot** in VS Code. Then, to prove it works, we used the framework to build a complete **Klondike Solitaire game**—45 features, all verified, across multiple agent sessions.

**The result: Klondike-Spec**—both the framework and its proof-of-concept in one repository.

---

## The Problem

> *"Each new engineer arrives with no memory of what happened on the previous shift."*
> — Anthropic Engineering

When you use GitHub Copilot Agent mode for complex, multi-session projects:

| 😤 What Goes Wrong | 🤔 Why It Happens |
|-------------------|-------------------|
| Agent tries to rewrite everything | No concept of incremental progress |
| Agent declares project "complete" prematurely | No structured completion criteria |
| Agent duplicates or contradicts previous work | No memory of past sessions |
| Agent leaves code half-broken between sessions | No handoff protocol |

---

## The Solution

Klondike-Spec provides **structured prompts and artifacts** that teach Copilot to work like a senior engineer:

```
┌─────────────────────────────────────────────────────────────────┐
│                    KLONDIKE-SPEC FRAMEWORK                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   📋 features.json          Progress tracking registry          │
│   📝 agent-progress.md      Session-by-session handoff log      │
│   🚀 init.ps1 / init.sh     Reproducible environment startup    │
│                                                                  │
│   💬 /session-start         Begin with context awareness        │
│   💬 /session-end           End with clean handoff              │
│   💬 /verify-feature        Confirm features work E2E           │
│   💬 /recover-from-failure  Fix broken states                   │
│                                                                  │
│   📜 copilot-instructions   Auto-applied behavior rules         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Key Innovations

1. **Feature Registry** (`features.json`) — A structured list of every feature, marked pass/fail. Agent can only flip `passes: false → true`, never delete or modify requirements. This prevents "premature victory."

2. **Progress Log** (`agent-progress.md`) — Append-only session log. Each session documents what was done, what blocked, what's next. New sessions read this first.

3. **Session Prompts** — Slash commands (`/session-start`, `/session-end`) that enforce rituals: check git status, run smoke tests, commit before ending.

4. **Embedded Instructions** — `copilot-instructions.md` is auto-applied to every agent session, encoding best practices without requiring user action.

---

## 🚀 Quick Start

### Prerequisites

- **VS Code** 1.99+ (or latest Insiders)
- **GitHub Copilot** with active subscription
- **Git** installed

### Try the Demo (Klondike Solitaire)

```powershell
# Clone the repository
git clone https://github.com/thomasrohde/klondike-spec.git
cd klondike-spec

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open http://localhost:5173 to play Klondike Solitaire—built entirely using this framework!

---

## 📦 Use in Your Own Project

Want the framework **without** the Klondike game? Here's how to extract just the prompting infrastructure:

### Option 1: Copy Framework Files Only

```powershell
# From within the klondike-spec repo
Copy-Item -Recurse .github your-project/.github
Copy-Item -Recurse .vscode your-project/.vscode
```

Your project now has:
- `.github/copilot-instructions.md` — Core agent behavior rules
- `.github/prompts/` — All slash command prompts
- `.github/instructions/` — Path-specific instruction files
- `.github/templates/` — Templates for features.json, progress files, init scripts
- `.vscode/settings.json` — Copilot configuration

### Option 2: Initialize Fresh with the Framework

After copying the framework files:

1. Open your project in VS Code
2. Open Copilot Chat (Ctrl+Shift+I)
3. Switch to **Agent mode**
4. Run:
   ```
   /init-project webapp my-awesome-app
   ```

This creates:
- `features.json` with 20+ features based on your description
- `agent-progress.md` for session tracking
- `init.ps1` / `init.sh` for environment startup

### Framework Structure

```
.github/
├── copilot-instructions.md       # Auto-applied agent behavior rules
├── prompts/
│   ├── init-project.prompt.md    # Initialize new projects (scaffold only)
│   ├── init-and-build.prompt.md  # Scaffold AND implement features
│   ├── session-start.prompt.md   # Begin coding sessions
│   ├── session-end.prompt.md     # End with clean handoff
│   ├── verify-feature.prompt.md  # E2E feature verification
│   ├── add-features.prompt.md    # Expand feature list
│   ├── recover-from-failure.prompt.md
│   └── progress-report.prompt.md
├── instructions/
│   ├── session-artifacts.instructions.md
│   ├── git-practices.instructions.md
│   └── testing-practices.instructions.md
└── templates/
    ├── features.schema.json
    ├── features.example.json
    ├── agent-progress.template.md
    ├── init.sh
    └── init.ps1
```

---

## 💬 Prompt Commands

| Command | What It Does |
|---------|--------------|
| `/init-project` | Set up framework infrastructure (scaffold only, no implementation) |
| `/init-and-build` | Scaffold AND start implementing features in one session |
| `/session-start` | Begin a session: read context, check status, plan work |
| `/session-end` | End cleanly: commit, document, handoff to next session |
| `/verify-feature F001` | Verify a specific feature works end-to-end |
| `/add-features` | Expand the feature registry with new requirements |
| `/recover-from-failure` | Diagnose and fix broken project state |
| `/progress-report` | Generate stakeholder-friendly status report |

---

## 📖 Session Workflow

```
┌─────────────────────────────────────────────────────┐
│                   SESSION START                      │
│  /session-start                                      │
│  ├─ Read agent-progress.md                          │
│  ├─ Check features.json priorities                  │
│  ├─ Run init script, smoke test                     │
│  └─ Announce: "Working on F007 - User login"        │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│                   DURING SESSION                     │
│  • Work on ONE feature at a time                    │
│  • Commit after each meaningful change              │
│  • Test incrementally (not at the end!)             │
│  • If blocked, document and move to next task       │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│                   SESSION END                        │
│  /session-end                                        │
│  ├─ Ensure code compiles, tests pass                │
│  ├─ Commit all changes with descriptive messages    │
│  ├─ Update features.json (only passes field!)       │
│  ├─ Append to agent-progress.md                     │
│  └─ Summarize: "Next session: F008 - Password reset"│
└─────────────────────────────────────────────────────┘
```

---

## 🃏 Demo: Klondike Solitaire

This repository includes a fully-functional Klondike Solitaire game, built entirely using the framework across multiple agent sessions.

**🎮 [Play the live demo →](https://thomasrohde.github.io/klondike-spec/)**

### Features Implemented (45/45 ✅)

| Category | Features |
|----------|----------|
| **Core Game** | Card/deck models, shuffling, dealing, tableau moves, foundation moves, auto-flip, win detection, undo, move counter, timer |
| **UI** | Professional SVG cards, card backs, responsive layout, drag-and-drop, click-to-move, animations, settings panel, PWA install prompt, offline indicator, update notification, standalone mode adjustments |
| **Infrastructure** | Vite + React + TypeScript, Zustand state, localStorage persistence, React Router, PWA with offline support, error boundary, GitHub Pages deployment, app shortcuts, iOS PWA support, service worker lifecycle |
| **Testing** | Vitest unit tests, Playwright E2E tests, deployment verification |
| **Documentation** | README with deployment instructions |

### Deployment

The game is automatically deployed to GitHub Pages on every push to the `master` branch.

- **Live URL**: https://thomasrohde.github.io/klondike-spec/
- **Deployment**: GitHub Actions workflow (`.github/workflows/deploy.yml`)
- **PWA**: Installable as a standalone app on desktop and mobile

### Tech Stack

- **Framework**: React 18 + TypeScript
- **Build**: Vite
- **State**: Zustand + Immer
- **Styling**: CSS (no framework)
- **Testing**: Vitest + Playwright
- **PWA**: vite-plugin-pwa

### Running the Game

```bash
npm install
npm run dev      # Development server at http://localhost:5173
npm test         # Run unit tests
npm run build    # Production build
```

---

## 🔧 VS Code Configuration

The framework requires these settings in `.vscode/settings.json`:

```jsonc
{
  "github.copilot.chat.codeGeneration.useInstructionFiles": true,
  "chat.instructionsFilesLocations": {
    ".github/instructions": true
  },
  "chat.promptFiles": true,
  "chat.promptFilesLocations": {
    ".github/prompts": true
  }
}
```

These are included when you copy the `.vscode/` folder.

---

## 📜 The Rules

### features.json — Strict Modification Rules

| ✅ Allowed | ❌ Forbidden |
|-----------|-------------|
| Change `status`: `not-started` → `in-progress` → `verified` | Delete features |
| Change `passes`: `false` → `true` | Edit descriptions or criteria |
| Set `verifiedAt` timestamp | Mark passing without E2E verification |
| Set `verifiedBy` identifier | |
| Set `evidenceLinks`, `blockedBy`, `notes` | |

### agent-progress.md — Append Only

- ✅ Append new session entries
- ❌ Delete or modify historical entries

### Git Practices

- Commit early, commit often
- Use conventional commit messages (`feat:`, `fix:`, `refactor:`)
- Tag stable checkpoints
- Never leave uncommitted changes at session end

---

## 🎯 Why This Works

The framework succeeds by **encoding institutional knowledge** into structured prompts:

1. **Prevents one-shotting** — `/session-start` explicitly plans for ONE feature
2. **Prevents premature victory** — `features.json` defines clear completion criteria
3. **Bridges context windows** — `agent-progress.md` provides memory
4. **Enforces clean handoffs** — `/session-end` requires commit + documentation

It's the same discipline that makes engineering teams effective—now applied to AI agents.

---

## 🔗 References

### Anthropic Research
- [Effective Harnesses for Long-Running Agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents) — The inspiration for this framework

### VS Code & GitHub Copilot Docs
- [Customize Copilot to Your Workflow](https://code.visualstudio.com/docs/copilot/customization/overview)
- [Adding Repository Custom Instructions](https://docs.github.com/copilot/customizing-copilot/adding-custom-instructions-for-github-copilot)
- [Use Prompt Files](https://code.visualstudio.com/docs/copilot/customization/prompt-files)
- [Copilot Settings Reference](https://code.visualstudio.com/docs/copilot/reference/copilot-settings)

---

## 📄 License

MIT — Use the framework freely in your own projects.

Card assets from [Vector-Playing-Cards](https://github.com/notpeter/Vector-Playing-Cards) (Public Domain / WTFPL).

---

<div align="center">

**Built with 🃏 and GitHub Copilot**

*Transform your AI coding assistant into a disciplined engineering partner*

</div>
