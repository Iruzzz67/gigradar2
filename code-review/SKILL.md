---
description: Token-efficient code review for AGY. Review changes using
  git diff first, then CodeGraph impact analysis and targeted
  source/test inspection. Use for pull requests, commits, or local
  changes.
name: code-review
---

# Code Review

## Goal

Find real defects with minimal context usage. Review changed behavior,
affected dependencies, tests, security, and maintainability without
scanning unrelated code.

## Required order

1.  Run `git status`.
2.  Inspect the relevant `git diff`.
3.  Identify changed symbols/files.
4.  Use CodeGraph when available:
    -   callers,
    -   dependencies,
    -   affected modules,
    -   impact analysis.
5.  Inspect only affected implementation and tests.
6.  Validate with targeted tests/build/lint.
7.  Report findings ordered by severity.

## Review priorities

### P0 --- Critical

-   data loss/corruption,
-   authentication/authorization bypass,
-   remote code execution,
-   secrets exposure,
-   destructive production behavior.

### P1 --- High

-   incorrect business logic,
-   broken API contracts,
-   concurrency/race bugs,
-   major performance regressions,
-   crashes on normal input.

### P2 --- Medium

-   missing validation,
-   incorrect edge cases,
-   fragile state handling,
-   missing important tests.

### P3 --- Low

-   maintainability,
-   naming,
-   minor duplication,
-   non-critical style issues.

Do not report subjective style preferences as defects unless they
conflict with project conventions.

## .NET / MAUI checks

Pay special attention to: - async/await correctness, - UI-thread
access, - cancellation and disposal, - dependency injection lifetimes, -
navigation/state restoration, - platform-specific code, - HTTP error
handling, - serialization compatibility.

## Next.js / React checks

Pay special attention to: - server/client boundary, - unnecessary client
components, - stale state/closures, - effects and cleanup, - data
fetching behavior, - hydration issues, - API contract mismatches, -
unnecessary re-renders.

## Three.js checks

Pay special attention to: - disposal of geometries/materials/textures, -
renderer/resource lifecycle, - animation loop cleanup, - excessive
allocations, - resize handling, - browser/client-only execution.

## Finding format

For each real finding:

-   Severity
-   File and symbol
-   Problem
-   Why it matters
-   Minimal fix

Avoid long explanations when the finding is obvious.

## Token rules

-   Never review unchanged files unless impact analysis shows they are
    relevant.
-   Prefer diff context over rereading the entire changed file.
-   Do not report more than the useful findings.
-   Do not repeat the same root cause across multiple files; group
    related findings.
