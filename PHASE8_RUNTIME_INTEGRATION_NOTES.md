# Phase 8 Runtime Integration Notes

## PR #160 conflict resolution

The original live-switching branch diverged from `main` while the constellation runtime received newer features (`fusionConstellationVersion`, specialization exclusivity, reset/build summary and runtime audit).

Resolution strategy:

- do **not** overwrite the newer main constellation runtime with the older branch copy;
- recreate the live-switching work from current `main` on `feat/phase8-live-job-switching-v2`;
- preserve every current-main constellation feature;
- add only the runtime bridge import plus the generated Fusion live-job bridge;
- add smoke coverage for registry count, generated playable records and legacy IDs.

This replacement branch supersedes PR #160.
