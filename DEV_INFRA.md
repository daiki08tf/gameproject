# DEV_INFRA.md — Blade Vale development infrastructure

`./dev` is the repo's machine-readable development front door. It exists so
that an agent (or a tired human) can answer "where is the authority for X,
what will editing it touch, and how do I verify I didn't break the save"
without reading ~130 prose documents first.

It is **observer tooling, not product code**: it never starts the game,
never writes into `js/`, and its only generated artifact is
`.dev/project-map.json` (deterministic, committed, regenerated with
`./dev map --write`).

The dev-infra itself is **not an authority** — it only points at the
existing ones (PROJECT_GUIDE.md, CLAUDE.md, the real modules, the real
tests). If `./dev` output and the real code disagree, the real code wins
and the config should be fixed.

## Quick reference

```bash
./dev doctor              # environment + repo health (FAIL vs WARN)
./dev status              # branch/dirty/systems/tests/save summary
./dev map [--write|--check]  # system map; --write regenerates .dev/project-map.json
./dev authority [id]      # authority map; 'save', 'combat', 'loot', …
./dev authority --check   # verify every referenced path exists
./dev impact <t>          # blast radius of a path/system/authority
./dev scope [t]           # likely-in-scope files (or classify current diff)
./dev context <t>         # agent-ready context packet for a system/concept
./dev handoff [t]         # handoff packet for the next agent
./dev save-check          # save schema + c1 migration + regression tests
./dev smoke               # fast "repo isn't obviously broken" gate
./dev check [--quick]     # aggregate gate (adds test:syntax + npm test)
```

`<t>` accepts a system id (`jobs`, `adventure4`, `equipment`, …), a concept
alias (`adventure`, `rune`, `save`…), an authority id, or a repo path.

## Files

```
dev                       bash front door → node scripts/dev/cli.mjs
.dev/systems.json         system registry (path prefixes → system buckets)
.dev/authority-map.json   curated authority map (verified against real code)
.dev/project-map.json     GENERATED — systems × files × tests × import graph
scripts/dev/*.mjs         zero-dependency node ESM commands
tests/dev-infra.test.js   self-tests (runs inside npm test)
scripts/dev/lib/repo.mjs  shared helpers (files, imports, git)
```

## The model

**Systems** (`.dev/systems.json`) bucket every file in the repo. `paths` are
prefixes: `'js/data/job'` matches `jobs.js`, `jobsPhase8.js`,
`jobIdentityMigration.js`, …; `'js/screens/'` matches the directory; `'*.md'`
matches by suffix. First match wins, so specific prefixes go before broad
ones. Every file lands in exactly one system; `unmapped` means the config
is incomplete (doctor warns).

**Authorities** (`.dev/authority-map.json`) are the curated translation of
PROJECT_GUIDE.md/CLAUDE.md into data: for each concept, where the source of
truth lives, what is merely derived wiring, what is persisted, where
mutation happens, how it's validated, and the invariants/notes that a
newcomer would otherwise learn by breaking something. `./dev authority
--check` proves every referenced path still exists.

**project-map.json** joins the two plus a static import graph: per system —
files, tests (test files that import the system's files), dependsOn /
dependents (system-level import edges), and per authority — resolved files,
related tests, missing paths. It's deterministic; only `meta.git` varies.
Commit it after changing systems/authority config or adding files —
`./dev map --check` and the self-test will flag staleness.

## save-check

`./dev save-check` verifies save compatibility without inventing any new
migration:

- the save root (`'bladevale_save_v1'`) and load wiring
  (`defaultSave` merge + `migrateC1JobSaveBack`) still exist in
  `js/state.js`;
- the fresh default save has the expected top-level keys;
- representative fixtures (c1-window save, legacy-only save, mixed save)
  still migrate the way `tests/c1-job-identity-migration.test.js` asserts
  — c1_* ids fold onto their `C1_TO_LEGACY_HOST` hosts, unrelated keys are
  never mutated (no silent data loss);
- the migration is idempotent, every mapped host resolves in the active
  `jobsPhase8` roster, and the merged save keeps every default key;
- the two existing migration regression test files still pass.

Run it whenever you touch `js/state.js`, `js/data/jobIdentityMigration.js`,
`defaultSave`, or anything on the save surface (`./dev impact <file>` flags
save-surface files).

## smoke vs check

- `smoke` (~seconds): critical module imports, core data sanity (CHAPTERS,
  save schema), one migration roundtrip, a 2-file curated test subset.
  Use after edits, before commits when the full suite isn't warranted.
- `check` (full): map/authority consistency + save-check + smoke +
  `npm run test:syntax` + the entire `npm test` suite. This is the
  pre-PR gate. `--quick` runs only the fast steps.

Neither replaces the work protocol in CLAUDE.md: `test:syntax` every
commit, full `npm test` before PR/merge, live-viewport gate for UI work.

## Adding a system

1. Pick an id + title, choose path prefixes that cover the real files
   (check with `./dev map` — unmapped files list at the bottom).
2. Put it in `.dev/systems.json` — before broader prefixes it would be
   swallowed by.
3. `./dev map --write && ./dev doctor`.

## Updating authority safely

- Point at real files only — `authority --check` and the self-test will
  catch typos.
- `authority:` = the files that ARE the concept. `derived:` = wiring/UI
  that must follow it. `persisted:` = what lives in the save. `notes:` =
  the invariant a careless edit would violate (the "don't" list).
- If two entries claim the same file, that's a signal, not an error —
  overlapping ownership shows up in `impact`/`authority` output and should
  be resolved in the real code/docs, not silently in this JSON.

## Regeneration / recovery

Everything lives in Git. On a fresh clone: `./dev map --write` rebuilds the
map deterministically; the committed `.dev/project-map.json` is itself
reproducible, so regeneration is not a data-loss risk.
