/* Enemy 3.0 B1 — bridge Enemy 2.0 role identities into existing Combat 3 AI. */

export const ENEMY3_ROLE_BEHAVIORS=Object.freeze({
  attacker:Object.freeze({
    combat3Role:'frontline',
    skill:Object.freeze({name:'猛攻',kind:'power',power:1.55,chance:.32}),
  }),
  caster:Object.freeze({
    combat3Role:'caster',
    skill:Object.freeze({name:'妨害詠唱',kind:'slow',power:.14,turns:2,chance:.32}),
  }),
  trickster:Object.freeze({
    combat3Role:'skirmisher',
    skill:Object.freeze({name:'撹乱撃',kind:'weakenAtk',power:.12,turns:2,chance:.32}),
  }),
  support:Object.freeze({
    combat3Role:'support',
    skill:Object.freeze({name:'応急支援',kind:'healAlly',healPct:.12,chance:.34}),
  }),
});

export function enemy3RoleBehaviorProfile(enemyOrRole){
  const role=typeof enemyOrRole==='string'?enemyOrRole:enemyOrRole?.role;
  return ENEMY3_ROLE_BEHAVIORS[role]||null;
}
