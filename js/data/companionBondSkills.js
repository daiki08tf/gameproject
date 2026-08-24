/* Monster Ranch 1.5 — Bond skills (pure data/helpers) */
export const BOND_SKILLS=Object.freeze({
  bond_strike:{id:'bond_strike',name:'連心撃',type:'damage',stat:'atk',power:1.42,mpCost:2,target:'enemy',priority:7,desc:'絆Lv4で解放。ATK142%の連携攻撃'},
  bond_arcana:{id:'bond_arcana',name:'共鳴波',type:'damage',stat:'mag',power:1.46,mpCost:3,target:'enemy',priority:7,desc:'絆Lv4で解放。MAG146%の共鳴攻撃'},
  soul_fang:{id:'soul_fang',name:'魂牙',type:'damage',stat:'atk',power:1.78,mpCost:6,target:'enemy',priority:10,preferLowHp:true,desc:'絆Lv8で解放。ATK178%の奥義'},
  soul_nova:{id:'soul_nova',name:'魂光',type:'damage',stat:'mag',power:1.82,mpCost:7,target:'enemy',priority:10,desc:'絆Lv8で解放。MAG182%の奥義'},
});
export function bondSkillsFor(companion){const lv=Number(companion?.bondLevel)||1,out=[];const magical=(companion?.mag||0)>(companion?.atk||0)*1.08;if(lv>=4)out.push(magical?BOND_SKILLS.bond_arcana:BOND_SKILLS.bond_strike);if(lv>=8)out.push(magical?BOND_SKILLS.soul_nova:BOND_SKILLS.soul_fang);return out;}
