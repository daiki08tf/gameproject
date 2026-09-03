# Blade Vale — Dark Chronicle Design System

> UIX-1 source contract. Presentation only; gameplay and save authorities remain unchanged.

## Identity

Blade Vale should read as an expedition record assembled under pressure: black iron, soot navy, ash text, restrained brass, and an observation teal used only for anomalous or investigative context.

Hierarchy comes from type, rules, spacing, record labels and state words. It does not come from platform emoji, large rounded cards or a different bright color for every feature.

## Token contract

`css/darkChronicle.css` owns the `--dc-*` semantic tokens.

| Family | Purpose |
|---|---|
| `--dc-ink-*` | page, panel and inset surfaces |
| `--dc-iron-*` | dividers, inactive controls and structural borders |
| `--dc-ash-*` | primary and secondary text |
| `--dc-brass-*` | authored progression and the single primary action |
| `--dc-observe-*` | Observation, Branch and focus state |
| `--dc-danger-*` | danger, failure and destructive action |
| `--dc-success-*` | confirmed completion |
| `--dc-space-*` | 4px-based spacing scale |
| `--dc-radius-*` | restrained 2–3px geometry |
| `--dc-motion-*` | short state-change motion |

Legacy `--ui-*` variables temporarily alias these tokens. Remove an alias only after every consumer has migrated.

## Component contracts

Shared constructors live in `js/ui/uiFoundation.js`:

- `createHeader`: title, optional record kicker, metadata and labeled Back action;
- `createSection`: bounded content region with a semantic heading;
- `createRow`: compact label/value record with optional metadata;
- `createBadge`: short visible state text;
- `createTabs`: labeled tab navigation with `aria-selected`;
- `createAction`: primary/secondary action with disabled, pressed and busy states;
- `createNotice`: informational or danger message.

All interactive elements keep a visible label and a minimum 44px target. State meaning must not depend on color alone.

## Good patterns

~~~text
CHAPTER 02 / STAGE 2-4
深緑の森
CLEAR    推奨Lv 18
[探索を続ける]
~~~

- one brass primary action;
- `CLEAR`, `NEXT`, `LOCKED`, `BOSS`, `NEW RECORD`, `TARGET DROP` as explicit text;
- compact rows for repeated records;
- details disclosed only when requested;
- tabular numerals for Levels, currency and stats;
- observation teal limited to Branch/anomaly context and focus.

## Rejected patterns

- emoji before labels, currency or status;
- replacing one emoji with another Unicode pictograph;
- icon-only buttons;
- every item rendered as the same large rounded card;
- bright feature-by-feature gradients;
- glow or animation with no state meaning;
- color-only lock, rarity, danger or completion state;
- unconditional DOM rebuilding from a MutationObserver.

## Motion and accessibility

- default interaction motion is 90–160ms;
- `prefers-reduced-motion: reduce` collapses animation and transition durations;
- keyboard focus uses the observation color plus an offset outline;
- disabled, pressed and busy states are shared across buttons and role-buttons;
- Japanese body copy uses the gothic stack; display headings may use the mincho stack;
- Level, currency, Item Power and stat values use tabular numerals.

## Migration rule

UIX-1 proves the system on the title, shared headers and persistent navigation. Feature bodies migrate only in their assigned UIX phase. Source pictograph counts may only decrease; authored Story/canon text must be classified before removal.
