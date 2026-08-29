export const SETTLEMENT_POLICIES=Object.freeze([
{id:'trade',name:'交易重視',icon:'🧳',minHall:10,focus:'market',desc:'交易路と商人の活動を優先する。市場・行商・交易系イベントの候補を前面に出す。'},
{id:'research',name:'研究重視',icon:'📚',minHall:10,focus:'research',desc:'観測・解析を優先する。Codex研究・異界研究・調査系イベントの候補を前面に出す。'},
{id:'defense',name:'防衛重視',icon:'🛡️',minHall:12,focus:'defense',desc:'城壁と迎撃体制を優先する。防衛・見張り・脅威調査系イベントの候補を前面に出す。'},
{id:'coexistence',name:'魔物共生',icon:'🐾',minHall:12,focus:'ranch',desc:'Companionと魔物使いの共生を優先する。牧舎・仲間化・魔物交流系イベントの候補を前面に出す。'}
]);

export const SETTLEMENT_FACTIONS=Object.freeze([
{id:'guild',name:'辺境商会',icon:'🏪',policy:'trade',desc:'商人と交易路を束ねる実務派。'},
{id:'adventurers',name:'探索者連盟',icon:'⚔️',policy:'defense',desc:'街の外へ出る冒険者と警備隊の連合。'},
{id:'academy',name:'境界学会',icon:'🔬',policy:'research',desc:'Codexと異界現象を研究する学術組織。'},
{id:'tamers',name:'共生会',icon:'🐾',policy:'coexistence',desc:'魔物使いとCompanionの共生を支える集まり。'}
]);

export function settlementPolicyAvailable(policy,hall=0){return !!policy&&hall>=(policy.minHall||0);}
