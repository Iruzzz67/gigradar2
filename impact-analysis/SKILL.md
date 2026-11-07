---
description: Dependency and change-impact analysis for AGY using
  CodeGraph first. Use before refactoring, changing public APIs,
  renaming symbols, modifying services, navigation, data models, or
  shared UI.
name: impact-analysis
---

# Impact Analysis

## Goal

Determine what a change can affect before editing, while minimizing
repository context.

## Graph-first procedure

When CodeGraph MCP is available:

1.  Resolve the target symbol.
2.  Find direct callers.
3.  Find direct dependencies.
4.  Find implementations/inherited interfaces.
5.  Find API/UI consumers.
6.  Find related tests.
7.  Inspect transitive impact only when needed.
8.  Stop when the impact boundary is clear.

Represent the result as:

`Target → direct callers → affected boundary → tests`

Do not dump the entire graph.

## Change categories

### Private implementation

Usually inspect: - direct callers, - related tests.

### Public method/API

Also inspect: - consumers, - DTO/contracts, - serialization, -
integration tests.

### Shared model/entity

Inspect: - producers, - consumers, - persistence, - API contracts, - UI
bindings, - tests.

### Interface/base class

Inspect: - implementations, - registrations, - callers, - tests.

### UI component

Inspect: - direct imports, - state/data dependencies, -
platform-specific consumers, - visual regression or component tests when
available.

## .NET / MAUI boundary

Trace: - DI registration → service → ViewModel → Page, - navigation
routes, - platform implementations, - shared interfaces, -
persistence/network boundaries.

## Next.js / React boundary

Trace: - component imports, - props/state, - server/client boundaries, -
API calls, - shared hooks, - route consumers.

## Three.js boundary

Trace: - scene ownership, - renderer lifecycle, - resources, - animation
loop, - component mount/unmount.

## When CodeGraph is unavailable

Use progressively: 1. exact symbol search, 2. exact filename search, 3.
import/reference search, 4. targeted reads.

Never compensate by reading the entire repository.

## Output

Return only: - target, - affected symbols/modules, - likely risks, -
tests that should be run.

Do not generate implementation code unless requested.
