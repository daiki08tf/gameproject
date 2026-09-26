import fs from 'node:fs';
import path from 'node:path';

// Blade Vale no-emoji design law.
//
// Rendered application UI must contain no platform emoji. This gate is the
// automated enforcement for that law.
//
// Policy:
//   - Render-path files (index.html, css/**, js/screens/**, js/ui/**, and any
//     js/patches file whose name ends in Ui.js) must contain ZERO pictographs.
//     No exceptions: these files write the DOM.
//   - All other js/** files: pictographs are allowed ONLY on lines that carry
//     a canonical `icon:` / `icon=` data token (e.g. `icon:'🔥'`). Those icon
//     fields are data-layer identity tokens kept for future asset mapping and
//     are enforced non-rendered by tests/uix3/uix6 suites — they must never be
//     interpolated into the DOM.
//   - Whitelisted lines: the cleanName() pictograph-strip regex in
//     finalIntegrationUi.js (it lists emoji only to remove them) and the
//     ICONS species-token array in monsterRanchSpecies.js.
//
// Deliberate limits: this checks Extended_Pictographic only — the emoji plane
// and dingbats that render as platform emoji. It does NOT flag stable
// typographic glyphs used by the Dark Chronicle vocabulary (★ ◆ ◇ ✦ ◈ ？！),
// Japanese punctuation, arrows, or math symbols. Those are allowed by design.

const PICTOGRAPH = /\p{Extended_Pictographic}/gu;
const SOURCE_EXTENSION = /\.(?:html|js|css)$/;

// Render-path files: zero pictographs, unconditionally.
const STRICT_ROOTS = ['index.html', 'css', 'js/screens', 'js/ui'];
const STRICT_PATCH = /Ui\.js$/; // js/patches/*Ui.js

// Non-render files: pictograph allowed only on these lines.
const DATA_TOKEN_LINE = /\bicon\s*[:=]/;
const WHITELIST_LINE = /Extended_Pictographic|\bICONS\s*=/;

function collect(target, output = []) {
  const stat = fs.statSync(target);
  if (stat.isDirectory()) {
    for (const entry of fs.readdirSync(target).sort()) collect(path.join(target, entry), output);
  } else if (SOURCE_EXTENSION.test(target)) {
    output.push(target);
  }
  return output;
}

const files = new Set();
for (const root of ['index.html', 'css', 'js']) for (const f of collect(root)) files.add(f);

const violations = [];

for (const file of [...files].sort()) {
  const strict = STRICT_ROOTS.some((root) => file === root || file.startsWith(root + path.sep))
    || file.startsWith('js/patches/') && STRICT_PATCH.test(file);
  const source = fs.readFileSync(file, 'utf8');
  source.split('\n').forEach((line, index) => {
    PICTOGRAPH.lastIndex = 0;
    if (!PICTOGRAPH.test(line)) return;
    if (WHITELIST_LINE.test(line)) return;
    if (strict) {
      violations.push(`${file}:${index + 1}: pictograph in render-path file — use text or a project-owned asset`);
    } else if (!DATA_TOKEN_LINE.test(line)) {
      violations.push(`${file}:${index + 1}: pictograph outside a canonical icon: data field`);
    }
  });
}

if (violations.length) {
  console.error(`UIX emoji gate: ${violations.length} violation(s)\n` + violations.join('\n'));
  process.exitCode = 1;
} else {
  console.log('UIX emoji gate: clean — no platform emoji in render paths or non-icon data fields');
}
