import { existsSync } from 'node:fs';
import { gitBranch, gitHead, gitRemote, gitStatus, abs } from './lib/repo.mjs';
import { heading } from './lib/output.mjs';
import { MAP_PATH, getMap, mapIsFresh } from './map.mjs';

export function runStatus() {
  const map = getMap();
  const status = gitStatus();
  const modified = status.filter((s) => !s.state.includes('?')).length;
  const untracked = status.filter((s) => s.state.includes('?')).length;
  const { fresh, reason } = mapIsFresh();

  const testCount = map.meta.fileCounts.tests;
  const docCount = map.systems.find((s) => s.id === 'docs')?.files.length ?? 0;

  const lines = [
    ...heading('Blade Vale — status'),
    `repo      ${gitBranch()} @ ${gitHead()}`,
    `remote    ${gitRemote() ?? 'none'}`,
    `worktree  ${status.length === 0 ? 'clean' : `${modified} modified, ${untracked} untracked`}`,
    '',
    `systems   ${map.systems.length} defined`,
    `authorities ${map.authorities.length} defined`,
    `tests     ${testCount} files`,
    `docs      ${docCount} markdown files`,
    `save      localStorage 'bladevale_save_v1' (no schema version — merge + migrateC1JobSaveBack)`,
    `map       ${existsSync(abs(MAP_PATH)) ? (fresh ? 'fresh' : `STALE (${reason}) — ./dev map --write`) : 'not generated — ./dev map --write'}`,
  ];
  const missing = map.authorities.flatMap((a) => a.missingPaths);
  if (missing.length) lines.push('', `authority refs missing: ${missing.length}`, ...missing.slice(0, 10).map((m) => `  ${m}`));
  if (map.unmappedFiles.length) lines.push(`unmapped: ${map.unmappedFiles.length} file(s) — ./dev map for detail`);
  console.log(lines.join('\n'));
}
