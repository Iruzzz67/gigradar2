---
description: Token-efficient development workflow for AGY. Use when
  implementing, debugging, refactoring, or modifying the GigRadar
  codebase. Prioritize CodeGraph/context discovery, git diff, targeted
  reads, and focused validation over repository-wide scanning.
name: token-efficient-development
---

# Token-Efficient Development

## Purpose

Complete coding tasks with the smallest useful context while preserving
correctness.

Target stack: - C# / .NET / .NET MAUI - Next.js - React - Three.js -
TypeScript / JavaScript - Tests and build tooling

## Mandatory workflow

1.  Inspect `git status` and relevant `git diff`.
2.  Identify the smallest likely set of files/symbols.
3.  If CodeGraph MCP is available, query it before broad file reads.
4.  Resolve symbols, callers, dependencies, and impact.
5.  Read only the relevant source sections.
6.  Implement the smallest coherent change.
7.  Run targeted tests/build checks.
8.  Inspect the final diff.
9.  Stop when acceptance criteria are satisfied.

## Context rules

-   Never read the whole repository unless explicitly required.
-   Never repeatedly read an unchanged file.
-   Prefer symbol/line-level context over complete files.
-   Do not paste large source blocks into reasoning when a path +
    symbol + summary is sufficient.
-   Do not re-investigate facts already established in the current task.
-   Exclude generated/build/vendor directories from exploration.

Common exclusions: `bin/`, `obj/`, `.next/`, `node_modules/`, `dist/`,
`build/`, `coverage/`, generated code, caches.

## Search escalation

Use this order:

1.  CodeGraph symbol/dependency query.
2.  Exact symbol or filename search.
3.  Narrow text search.
4.  Read a small relevant range.
5.  Repository-wide search only when the above cannot answer the
    question.

## Change policy

Prefer: - one focused change, - minimal file count, - existing project
patterns, - existing abstractions, - no unrelated formatting.

Avoid: - speculative refactors, - dependency additions without need, -
rewriting unrelated files, - broad architecture changes for local
problems.

## Output discipline

At the end report briefly: - changed files, - key change, - validation
performed, - remaining risk, if any.

Do not reproduce large diffs in the response.
