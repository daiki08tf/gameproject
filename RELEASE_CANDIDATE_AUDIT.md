# Blade Vale 3.0 — Release Candidate Audit

> **Status: AUTOMATED RC READY**
>
> Scope: regression, balance contracts, save compatibility, mobile operability, cross-system references and release-readiness. Feature freeze remains active.

## Release gates

| Area | Gate | Result / evidence |
|---|---|---|
| New game / early game | Ch1 route, starter/equipment foundations, finite rewards and enemy references | ✅ cross-system RC gate + progression suites |
| Midgame | chapter unlock chain, reward references, Job/Equipment integration | ✅ stage integrity + progression/equipment suites |
| Ch16–25 | expanded stages, midboss/boss waves, rewards, story progression | ✅ stage integrity + Phase 11 suites |
| Lv99,999 / endgame | canonical Abyss Lv/IP ladder, numeric bounds | ✅ RC samples + numeric/EXP simulations |
| Equipment / Loot | catalog IDs, slots, rarity, finite stats, target-farm safety | ✅ RC equipment gate + Equipment/Loot simulations |
| Companion / Ranch | species IDs, recruitment mapping, progression, skill resolution | ✅ RC species gate + Ranch/Companion simulations |
| Optional / Horizontal | Secret Realms, Boundary/Optional/Apex content remain optional | ✅ Phase 12 suites + resolver gate |
| Replay / Challenge | Challenge/REMATCH+/records remain optional and use existing economy | ✅ Phase 13 suite |
| Save compatibility | old top-level save contract retained; later systems initialize lazily | ✅ migration/regression suites + code audit |
| Mobile battle | many enemies/log lines never push commands out of reach | ✅ permanent Phase 14 mobile command regression gate |
| Navigation | no Phase 15+ top-level route; Home remains grouped | ✅ Phase 14 + RC feature-freeze gate |
| CI | syntax + complete regression suite | ✅ Blade Vale Tests #523 / Phase 8 Validation #114 on code head |

## Explicit historical regression gate

The previously observed issue where a large number of enemies made the attack button unreachable is release-blocking.

The RC preserves:

1. bounded, independently scrollable enemy list;
2. independently flexible battle log;
3. sticky bottom command grid;
4. minimum 44px command tap targets;
5. attack enabled whenever combat is active and a living enemy exists;
6. short viewports reduce enemy/log density before command usability.

Regression coverage: `tests/phase14-mobile-command-regression.test.js` plus the cross-system RC feature-freeze gate.

## Automated play-curve coverage

Existing repository simulations are reused rather than replaced:

- progression / Character EXP simulations;
- Lv99,999 numeric safety;
- Boss + Companion simulations;
- endgame build comparisons;
- loot distribution / build-target simulations;
- Abyss milestone and target-farm checks.

`tests/release-candidate-audit.test.js` joins those previously separate contracts into one release gate covering story stages, rewards, enemy references, equipment, Ranch species, endgame resolvers and mobile/feature-freeze safety.

## Audit finding resolved

The first RC run reported one equipment-stat failure for `uq_ash_knight_shield` because the initial audit incorrectly required every equipment stat to be non-negative. That Unique intentionally uses a negative SPD tradeoff. The audit contract was corrected to require all equipment stats to be **finite numeric values**, while existing Unique/Cursed tests continue to validate intentional downside packages.

No gameplay implementation defect was identified by that failure. On the corrected code head, both CI workflows passed.

## Release decision

Automated release gates are green and no newly discovered automated blocker remains open. Blade Vale 3.0 is therefore **AUTOMATED RC READY** under the repository's feature-freeze policy.

This audit does **not** claim a physical-device manual playthrough. Device-specific defects discovered during hands-on iPhone/browser testing remain valid release blockers and should be fixed without reopening feature development.
