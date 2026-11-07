---
description: Targeted testing workflow for AGY. Select the smallest
  reliable test/build set based on changed files, symbols, dependencies,
  and CodeGraph impact.
name: smart-test
---

# Smart Test

## Goal

Validate changes quickly without blindly running every test suite.

## Selection order

1.  Identify changed files from git diff.
2.  Identify changed symbols.
3.  Use CodeGraph impact analysis when available.
4.  Map changed symbols to nearby tests.
5.  Run the smallest relevant test project/test class/test case.
6.  Expand validation only when:
    -   targeted tests fail,
    -   the change crosses a module/API boundary,
    -   no targeted tests exist,
    -   build/type checking requires broader validation.

## Test escalation

Use:

`single test → test class → test project → affected projects → full solution`

Do not jump directly to full-suite testing for a local change.

## .NET / MAUI

Prefer: - affected unit tests, - service/ViewModel tests, -
API/integration tests for contract changes, - build of affected
projects.

If MAUI UI tests are unavailable, validate the relevant
ViewModel/service layer and compile the affected project.

## Next.js / React

Prefer: - component tests for changed components, - hook tests for
changed hooks, - API tests for changed endpoints, - TypeScript/lint
checks for affected package.

## Three.js

Prefer: - component/lifecycle tests, - utility tests, - TypeScript/build
checks.

Where browser rendering is involved, validate mount/unmount and resource
cleanup paths when practical.

## Failure handling

If a targeted test fails: 1. inspect the failure, 2. determine whether
it is caused by the change, 3. inspect only the necessary
dependency/context, 4. fix the root cause, 5. rerun the narrow test.

Do not rerun unrelated suites after every edit.

## Final validation

Before declaring success: - targeted tests pass, - affected project
compiles, - final git diff is clean of accidental changes.

Report exactly what was run.
