# Blade Vale 3.0 — Release Candidate Audit

> Status: automated release-candidate audit in progress.
>
> Scope: regression, balance contracts, save compatibility, mobile operability, cross-system references and release-readiness. Feature freeze remains active.

## Release gates

| Area | Gate | Evidence |
|---|---|---|
| New game / early game | Ch1 route, starter equipment, finite rewards and enemy references | cross-system RC test + progression tests |
| Midgame | chapter unlock chain, reward references, Job/Equipment integration | stage integrity + existing progression/equipment suites |
| Ch16–25 | expanded stages, midboss/boss waves, rewards, story progression | stage integrity + Phase 11 tests |
| Lv99,999 / endgame | canonical Abyss Lv/IP ladder, numeric bounds | RC samples + Phase 10 numeric/EXP simulations |
| Equipment / Loot | catalog IDs, slots, rarity, finite stats, target-farm safety | RC equipment gate + Equipment/Loot suites |
| Companion / Ranch | species IDs, recruitment mapping, progression, skill resolution | RC species gate + Ranch/Companion simulations |
| Optional / Horizontal | Secret Realms, Boundary/Optional/Apex content remain optional | Phase 12 suites + resolver gate |
| Replay / Challenge | Challenge/REMATCH+/records remain optional and use existing economy | Phase 13 suite |
| Save compatibility | old top-level save contract retained; later systems initialize lazily | existing migration/regression tests + code audit |
| Mobile battle | many enemies/log lines never push commands out of reach | permanent Phase 14 mobile command regression gate |
| Navigation | no Phase 15+ top-level route; Home remains grouped | Phase 14 + RC feature-freeze gate |
| CI | syntax + complete regression suite | GitHub Actions on RC PR |

## Explicit historical regression gate

The previously observed issue where a large number of enemies made the attack button unreachable is release-blocking.

The RC must preserve:

1. bounded, independently scrollable enemy list;
2. independently flexible battle log;
3. sticky bottom command grid;
4. minimum 44px command tap targets;
5. attack enabled whenever combat is active and a living enemy exists;
6. short viewports reduce enemy/log density before command usability.

## Automated play-curve coverage

Existing repository simulations are reused rather than replaced:

- progression / Character EXP simulations;
- Lv99,999 numeric safety;
- Boss + Companion simulations;
- endgame build comparisons;
- loot distribution / build-target simulations;
- Abyss milestone and target-farm checks.

`tests/release-candidate-audit.test.js` is the cross-system release gate that joins those previously separate contracts.

## Release decision rule

Blade Vale 3.0 can be marked **RC READY** when:

- the cross-system RC gate passes;
- both GitHub Actions workflows pass on the final audit head;
- no newly discovered blocker remains open;
- fixes do not introduce a new progression layer, currency, top-level Home route, or save migration requirement.

This automated audit does not claim a physical-device manual playthrough. Device-specific defects discovered later remain valid release blockers and should be fixed without reopening feature development.
