---
description: Compress task state for AGY to prevent repeated repository
  reads and unnecessary token usage during long coding sessions.
name: context-compression
---

# Context Compression

## Goal

Maintain a compact, factual task state so AGY does not repeatedly
rediscover the same information.

## State format

Maintain a short task state with:

``` text
TASK:
<one sentence>

SCOPE:
<files/modules/symbols>

KNOWN:
- <important established fact>
- <important established fact>

CHANGED:
- <file/symbol>

VALIDATED:
- <test/build/check>

OPEN:
- <remaining issue or none>
```

## Rules

-   Keep facts, not narrative.
-   Use paths and symbol names instead of copying source.
-   Record decisions that affect future steps.
-   Record failed approaches only when they prevent repeating wasted
    work.
-   Remove obsolete facts.
-   Never store secrets, credentials, tokens, or personal data.
-   Do not duplicate information already obvious from the current git
    diff.

## Compression triggers

Update the compact state after: - repository discovery, - architecture
discovery, - a significant implementation change, - test validation, -
resolving a blocker.

## Reuse rules

Before performing another search/read: 1. Check whether the fact is
already known. 2. Check whether the file/symbol is unchanged. 3. Reuse
the established conclusion when still valid.

## Context budget behavior

If context becomes large: 1. summarize completed investigation, 2.
retain only actionable facts, 3. keep exact file paths/symbol names, 4.
discard repetitive explanations, 5. continue from the compressed state.

## Project conventions

For GigRadar, preserve existing conventions for: - C# naming and
dependency injection, - MVVM and MAUI navigation, - API/DTO
boundaries, - Next.js routing and server/client boundaries, - React
component structure, - Three.js resource lifecycle.

Do not invent a new convention unless the task explicitly requires it.

## Final response

Use a concise completion summary. Never paste the full investigation
history.
