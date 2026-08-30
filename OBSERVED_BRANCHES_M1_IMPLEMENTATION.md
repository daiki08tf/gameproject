# Blade Vale — Observed Branches M1 Implementation

> Status: **COMPLETE — READY FOR M2 BRANCH DISCOVERY / SECRECY**
>
> Baseline: `f32120a621f2766f53383b2e196abcfee6dc79fe` (M0 authority audit merged)

## Scope

M1 implements only the authored Branch data model required by the roadmap. It does not add traversal, Region selection UI, battles, rewards, loot, currency, World Tier selection, or discovery mutation.

## Added authority

`js/data/observedBranches.js` defines authored Branch metadata while keeping existing systems authoritative for execution.

The first definition is:

- Branch ID: `tree-sovereign-deep-green`
- name: `王樹領・深緑の森`
- observed label: `観測分岐：王樹領`
- Prime Region: `frontier` / `ch2` / Chapter 2 / `深緑の森`
- divergence: 森の大樹霊が倒されず、森の統治者として定着
- discovery prerequisite: `cp4:branch-anchor:tree-sovereign`
- traversal: disabled

## Roadmap fields

The definition contains the M1-approved data only:

- Prime Region reference,
- Branch ID/name,
- divergence point,
- historical summary,
- technology profile,
- ecology profile,
- route/scene references,
- discovery conditions.

`routeRefs` and `sceneRefs` are intentionally empty until their later authored milestones. The Branch remains `traversable:false`.

## Technology profile

The six roadmap axes are explicit:

- Mechanical `↓↓`
- Arcane `↑↑`
- Bio `↑↑↑`
- Boundary `→`
- Information `↓`
- Material `↑`

This is a relative authored profile, not a global Tech Lv or progression stat.

## Authority boundaries

M1 does not own:

- combat/battle definitions,
- rewards/drop tables/loot,
- Item Power,
- currency,
- World Tier,
- inventory,
- discovery writes,
- save migration,
- Region selector UI.

Those remain with the authorities fixed by `OBSERVED_BRANCHES_M0_AUDIT.md`.

## Helpers

The data module exposes read-only lookup helpers for:

- Branch by ID,
- Branches attached to a Prime Region reference,
- whether existing discovery state satisfies a Branch's authored discovery prerequisites.

The helper that checks discovery is pure; it does not mutate save state.

## Verification

`tests/observed-branches-m1.test.js` covers:

- correct Chapter 2 / Prime Region reference,
- exact six-axis technology profile,
- empty route/scene references and non-traversable state,
- deterministic CP4 anchor prerequisite,
- Prime Region lookup,
- absence of combat/reward authority from Branch definitions.

**NEXT: M2 — Branch discovery / secrecy.**
