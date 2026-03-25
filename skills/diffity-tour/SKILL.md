---
name: diffity-tour
description: >-
  Create a guided code tour that walks through the codebase to answer a question
  or explain a feature. Opens in the browser with step-by-step navigation and
  highlighted code.
user-invocable: true
---

# Diffity Tour Skill

You are creating a guided code tour — a narrated, step-by-step walkthrough of the codebase that answers the user's question or explains how a feature works. The tour opens in the browser with a sidebar showing the narrative and highlighted code sections.

## Arguments

- `question` (required): The user's question or topic. Examples:
  - `/diffity-tour how does authentication work?`
  - `/diffity-tour explain the request lifecycle`
  - `/diffity-tour how are comments stored and retrieved?`

## CLI Reference

```
diffity agent tour-start --topic "<text>" [--body "<text>"] --json
diffity agent tour-step --tour <id> --file <path> --line <n> [--end-line <n>] --body "<text>" [--annotation "<text>"] --json
diffity agent tour-done --tour <id> --json
diffity list --json
```

## Prerequisites

1. Check that `diffity` is available: run `which diffity`. If not found, install it with `npm install -g diffity`.
2. Ensure a tree instance is running: run `diffity list --json`.
   - If no instance is running, start one: run `diffity tree` using the Bash tool with `run_in_background: true`, wait 2 seconds, then run `diffity list --json` to get the port.

## Instructions

### Phase 1: Research the codebase

Before creating any tour steps, you must deeply understand the answer to the user's question. This is the most important phase.

1. Read the relevant source files thoroughly. Follow the code path from entry point to completion.
2. Identify the key locations that tell the story — the files and line ranges that someone needs to see to understand the answer.
3. Plan a logical sequence of 5–10 steps that builds understanding progressively. Each step should lead naturally to the next.

**Guidelines for choosing steps:**
- Start where the flow begins (entry point, config, initialization)
- Follow the execution path in the order things actually happen
- Include only locations that are essential to understanding — skip boilerplate
- End at the final outcome (response sent, data persisted, UI rendered)
- Each step should cover a single concept or code section
- Include concrete examples where possible (e.g. "when the user runs `diffity main`, this becomes...")

### Phase 2: Create the tour

1. **Start the tour** with a topic and introductory body:
   ```
   diffity agent tour-start --topic "<user's question>" --body "<intro>" --json
   ```

   **Writing the intro body:**
   The intro should be a high-level architectural overview — not a summary of what the tour covers. Explain the key components involved and how they interact. Use markdown. Example:

   ```markdown
   The diff system has three layers:

   **CLI** (`packages/cli`) — parses user arguments, starts an HTTP server, and constructs git commands. It translates human-readable refs like `main` or `HEAD~1` into merge-base computations.

   **Git package** (`packages/git`) — executes git commands and returns raw diff output. It handles special refs (`staged`, `work`, `untracked`) with different git invocations.

   **UI** (`packages/ui`) — fetches the parsed diff via `/api/diff`, caches it with React Query, and renders the split/unified view. Route loaders prefetch data before the page renders.

   The flow is: **CLI args → git diff → parser → JSON API → React Query → rendered component**
   ```

   Extract the tour ID from the JSON output.

2. **Add steps** in order. For each step:
   ```
   diffity agent tour-step --tour <id> --file <path> --line <start> --end-line <end> --body "<narrative>" --annotation "<short label>" --json
   ```

   **Writing good step content (body supports markdown):**

   - `--file`: Path relative to repo root (e.g. `src/server.ts`)
   - `--line` / `--end-line`: The exact line range to highlight. Keep it focused — 3 to 20 lines.
   - `--annotation`: A short label (3-6 words) shown above the highlighted code. Think of it as a chapter title.
   - `--body`: The narrative shown in the tour sidebar. This is the core educational content. **Use markdown formatting:**

   **Do:**
   - Use `code` for function names, variables, refs, commands
   - Use **bold** for key concepts being introduced
   - Use concrete examples: "When you run `diffity main`, this line calls `normalizeRef('main')` which computes `git merge-base main HEAD`"
   - Use tables for mappings (input → output, ref → git command)
   - Use code blocks for data structures or command outputs
   - Mix prose with structured content — don't rely solely on bullet lists
   - Explain *why* the code exists, not just what it does

   **Don't:**
   - Write a wall of bullet points — use prose paragraphs with formatting
   - Just describe the syntax — explain the design decisions
   - Repeat information visible in the highlighted code
   - Use headers in step bodies (the annotation serves as the title)

3. **Finish the tour:**
   ```
   diffity agent tour-done --tour <id> --json
   ```

### Phase 3: Open in browser

1. Get the running instance port from `diffity list --json`.
2. Open the tour: `open "http://localhost:<port>/tour/<tour-id>"` (or the appropriate command for the user's OS).
3. Tell the user the tour is ready:

   > Your tour is ready! Open http://localhost:<port>/tour/<tour-id>
   >
   > Use the numbered steps at the top of the panel to navigate. The narrative for each step appears below.

## Quality Checklist

Before finishing, verify your tour meets these standards:

- [ ] Intro body gives a high-level architectural overview, not a table of contents
- [ ] Steps follow the actual execution/data flow, not alphabetical file order
- [ ] Each step's body uses markdown — code, bold, tables, examples — not just plain text
- [ ] Each step explains *why* with concrete examples, not just *what*
- [ ] Each annotation is a concise label (3-6 words, not a full sentence)
- [ ] Line ranges are precise — highlight the relevant section, not the entire file
- [ ] 5–10 steps total (enough to tell the full story)
- [ ] No two consecutive steps highlight the same lines in the same file
- [ ] Prose paragraphs are the primary format, bullet lists are secondary
