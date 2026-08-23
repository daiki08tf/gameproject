# Integration notes

This branch consolidates the weapon instance hardening, Companion System phases 1-3, stabilization fixes, and zero-dependency regression CI into one main-ready change set.

Patch load order is centralized in `js/main.js`:
1. weaponInstanceFoundation
2. companionFoundation
3. companionBattle
4. companionRecruitment

The goal is to avoid stacked-PR merge conflicts and make future patch ordering explicit.
