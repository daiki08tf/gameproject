/* Phase 10.1.5 — World Event 2.0: low-frequency, high-density chained events */
export const WORLD_EVENT_BASE_CHANCE=.07;
export const WORLD_EVENT_COOLDOWN_CLEARS=2;
export const WORLD_EVENT_PITY_START=18;

const choice=(label,outcome,condition=null)=>({label,outcome,condition});
const out=(hint,{flag=null,discovery=null,gold=0,keyFragments=0,next=null,chainEnd=false,tag=null}={})=>({hint,flag,discovery,gold,keyFragments,next,chainEnd,tag});

export const WORLD_EVENT_CHAINS=Object.freeze({
 traveler:{id:'traveler',name:'帰る場所',minProgress:1,steps:[
  {id:'traveler-1',name:'傷ついた旅人',text:'街道脇に傷ついた旅人が倒れている。荷物には遠い集落の紋章がある。',choices:[
   choice('手当てして送り届ける',out('旅人は何度も礼を言い、故郷の名を告げた。',{flag:'travelerHelped',discovery:'旅人の縁',gold:100,next:1})),
   choice('薬だけ渡す',out('最低限の薬を渡した。彼は自力で帰ると言った。',{flag:'travelerMedicated',discovery:'旅人への貸し',next:1})),
   choice('立ち去る',out('先を急いだ。背後で旅人が何かを叫んでいた。',{flag:'travelerAbandoned',next:1})),
   choice('安全な近道を教える',out('地形を読み、襲撃を避ける道を示した。',{flag:'travelerTrail',discovery:'安全な帰路',next:1}),{jobs:['hunter','ninja']})]},
  {id:'traveler-2',name:'焦げた伝令札',text:'以前の旅人の故郷から、焼け焦げた救援札が届いた。集落が襲われている。',choices:[
   choice('集落へ急ぐ',out('あなたは救援へ向かうことを決めた。',{flag:'travelerRescue',discovery:'集落救援',next:2})),
   choice('避難路を確保する',out('戦うより先に住民を逃がす道を選んだ。',{flag:'travelerEvacuation',discovery:'避難計画',next:2})),
   choice('襲撃者の首領を追う',out('火の手ではなく、逃げる首領の痕跡を追った。',{flag:'travelerPursuit',discovery:'襲撃者の痕跡',next:2}))]},
  {id:'traveler-3',name:'集落の夜',text:'集落は半壊している。人々は最後の判断をあなたに委ねた。',choices:[
   choice('ここを守り抜く',out('住民と共に夜明けまで防衛した。',{flag:'settlementDefended',discovery:'守られた集落',gold:600,next:3})),
   choice('全員を避難させる',out('物資を捨て、人命を最優先した。',{flag:'settlementEvacuated',discovery:'避難民の隊列',next:3})),
   choice('敵拠点を奇襲する',out('少人数で敵の補給路を断った。',{flag:'settlementRaid',discovery:'襲撃者の補給路',next:3}),{jobs:['warrior','fighter','ninja']})]},
  {id:'traveler-4',name:'帰る場所',text:'数日後、旅人が再び現れた。集落の未来は、これまでの選択で変わっていた。',choices:[
   choice('復興を支援する',out('小さな集落は交易の休息地として再出発した。',{flag:'travelerBond',discovery:'復興した集落',gold:1200,chainEnd:true,tag:'npcHub'})),
   choice('旅人に外の世界を任せる',out('旅人は各地を巡る情報屋になると約束した。',{flag:'travelerInformant',discovery:'旅人の情報網',chainEnd:true,tag:'intel'}))]}
 ]},
 beast:{id:'beast',name:'名もなき巨獣',minProgress:3,steps:[
  {id:'beast-1',name:'巨大な足跡',text:'街道から外れた泥地に、馬車より大きな足跡が続いている。',choices:[
   choice('追跡する',out('折れた枝と血痕を追い、巨獣の縄張りを特定した。',{flag:'beastTracked',discovery:'巨獣の縄張り',next:1})),
   choice('周囲を調べる',out('足跡だけでなく、人為的な罠の跡を見つけた。',{flag:'beastInvestigated',discovery:'不自然な罠跡',next:1})),
   choice('避けて迂回する',out('安全を優先したが、別方向へ続く古い獣道を見つけた。',{flag:'beastDetour',discovery:'迂回獣道',next:1})),
   choice('痕跡を読む',out('足取りから、巨獣が負傷していると見抜いた。',{flag:'beastWoundedKnown',discovery:'負傷した巨獣',next:1}),{jobs:['hunter','farmer']})]},
  {id:'beast-2',name:'倒れた猟師小屋',text:'巨獣の縄張り近くで猟師小屋を発見した。壁には「怒らせたのは人間だ」と刻まれている。',choices:[
   choice('罠を解除する',out('巨獣を傷つけていた鋼鉄罠を外した。',{flag:'beastFreed',discovery:'外された罠',next:2})),
   choice('罠を利用する',out('巨獣を仕留めるため罠を再配置した。',{flag:'beastHuntPrepared',discovery:'巨獣用の罠',next:2})),
   choice('餌を置いて観察する',out('敵意を見せず、巨獣の行動を観察した。',{flag:'beastObserved',discovery:'巨獣の習性',next:2}))]},
  {id:'beast-3',name:'巨獣との対面',text:'森が揺れ、ついに巨獣が姿を現した。傷だらけだが、その目には理性が残っている。',choices:[
   choice('討伐する',out('真正面から巨獣へ挑む道を選んだ。',{flag:'beastSlayerPath',discovery:'巨獣討伐路',next:3,tag:'boss'})),
   choice('鎮める',out('武器を下ろし、敵意がないことを示した。',{flag:'beastTamerPath',discovery:'巨獣との信頼',next:3,tag:'companion'})),
   choice('傷を治療する',out('傷口から罠の破片を取り除いた。',{flag:'beastHealed',discovery:'癒えた巨獣',next:3,tag:'companion'}),{jobs:['priest','farmer','alchemist']})]},
  {id:'beast-4',name:'森の王の選択',text:'巨獣は森の境界で立ち止まり、あなたを見つめている。',choices:[
   choice('森へ返す',out('巨獣は森の守護者となり、獣道だけをあなたに残した。',{flag:'beastTrail',discovery:'獣王の隠れ巣',keyFragments:2,chainEnd:true,tag:'secretStage'})),
   choice('契約を結ぶ',out('巨獣はあなたの匂いを覚え、必要な時に現れるようになった。',{flag:'beastCompanionBond',discovery:'巨獣との契約',chainEnd:true,tag:'companion'})),
   choice('最後まで狩る',out('巨獣は伝説の獲物となり、希少素材を残した。',{flag:'beastLegendKill',discovery:'巨獣の遺骸',gold:1800,chainEnd:true,tag:'uniqueMaterial'}))]}
 ]},
 merchant:{id:'merchant',name:'境界商会',minProgress:4,steps:[
  {id:'merchant-1',name:'見慣れない行商人',text:'境界の向こうの品だと称する商品を並べた行商人が声をかけてきた。',choices:[
   choice('品物を見る',out('品揃えは妙に良い。だが刻印を削った跡がある。',{flag:'merchantGoodsSeen',discovery:'境界商人の商品',next:1})),
   choice('情報を買う',out('金ではなく「次に会った時の借り」で噂を教えてくれた。',{flag:'merchantInfoDebt',discovery:'境界商会の噂',next:1})),
   choice('仕入れ帳を見る',out('商人が隠した仕入れ先の印を読み取った。',{flag:'merchantLedger',discovery:'秘密の仕入れ帳',next:1}),{jobs:['merchant']})]},
  {id:'merchant-2',name:'曰く付きの商品',text:'再会した商人が布包みを開く。中には通常流通しない装備片がある。',choices:[
   choice('購入する',out('危険を承知で取引を成立させた。',{flag:'merchantBoughtContraband',discovery:'曰く付き装備',gold:-300,next:2})),
   choice('出所を追及する',out('商人は口を滑らせ、「失われた隊商」の名を出した。',{flag:'merchantOriginKnown',discovery:'失われた隊商',next:2})),
   choice('偽物だと指摘する',out('刻印の偽装を暴くと、商人の態度が変わった。',{flag:'merchantForgeryExposed',discovery:'偽装刻印',next:2}),{jobs:['craftsman','scholar']})]},
  {id:'merchant-3',name:'夜の取引場所',text:'商人に指定された場所には三つの勢力が集まっていた。正規商会、密輸団、そして無所属の鑑定屋だ。',choices:[
   choice('正規商会につく',out('正規の仕入れ経路を守る側についた。',{flag:'merchantLegalRoute',discovery:'正規商会との縁',next:3})),
   choice('密輸団と取引する',out('危険だが希少品へ最短で届く道を選んだ。',{flag:'merchantBlackRoute',discovery:'闇市場の入口',next:3})),
   choice('両方の帳簿を奪う',out('混乱の隙に双方の取引記録を確保した。',{flag:'merchantBrokerRoute',discovery:'二重帳簿',next:3}),{jobs:['thief','ninja']})]},
  {id:'merchant-4',name:'境界商会の招待状',text:'選んだ取引先から、正式な招待状が届いた。',choices:[
   choice('商会員になる',out('各地の特殊素材を扱う商会との恒久的な縁ができた。',{flag:'merchantContact',discovery:'境界商会員',chainEnd:true,tag:'shop'})),
   choice('独立した仲介人になる',out('どの勢力にも属さず、裏と表の情報だけを受け取ることにした。',{flag:'borderRumor',discovery:'境界取引網',keyFragments:2,chainEnd:true,tag:'intel'}))]}
 ]},
 shrine:{id:'shrine',name:'忘れられた神',minProgress:5,steps:[
  {id:'shrine-1',name:'朽ちた祠',text:'苔に覆われた祠。祭神の名だけが意図的に削られている。',choices:[
   choice('祈る',out('名前のない何かが祈りに応えた。',{flag:'shrinePrayed',discovery:'名なき祠',keyFragments:1,next:1})),
   choice('碑文を調べる',out('地下へ続く祭祀経路の断片を読み取った。',{flag:'shrineMap',discovery:'古い地図',next:1})),
   choice('神性を判別する',out('この祠は祝福と封印を同時に担っていたと気づいた。',{flag:'shrineNatureKnown',discovery:'二重の神性',next:1}),{jobs:['priest','scholar','fortune']})]},
  {id:'shrine-2',name:'名前のない夢',text:'眠りの中で、鎖に繋がれた巨大な影が「忘れるな」と囁く。',choices:[
   choice('名を尋ねる',out('答えの代わりに一枚の祭具片が現れた。',{flag:'shrineNameSought',discovery:'欠けた祭具',next:2})),
   choice('封印の理由を尋ねる',out('かつて祈りが力ではなく災厄を呼んだ記憶を見た。',{flag:'shrineSealTruth',discovery:'封印の記憶',next:2})),
   choice('夢を拒絶する',out('夢を断ち切ったが、手には黒い紋が残った。',{flag:'shrineRejected',discovery:'黒い神紋',next:2}))]},
  {id:'shrine-3',name:'封印石',text:'祠の地下で封印石を発見した。壊せば何かが目覚め、戻せば何かを永遠に失う。',choices:[
   choice('封印を解く',out('鎖が一本ずつ砕けていく。',{flag:'shrineUnsealed',discovery:'解かれた封印',next:3,tag:'boss'})),
   choice('再封印する',out('封印を強め、祠の静寂を守った。',{flag:'shrineResealed',discovery:'強化された封印',next:3})),
   choice('祭具で力だけ切り離す',out('神そのものではなく、漏れ出した力だけを回収した。',{flag:'shrineEssenceSplit',discovery:'分離された神気',next:3}),{jobs:['alchemist','priest']})]},
  {id:'shrine-4',name:'忘れられた神の答え',text:'祠に最後の変化が訪れた。あなたの選択を、名なき神が受け入れる。',choices:[
   choice('祝福を受け取る',out('旅路を守る古い加護が定着した。',{flag:'shrineBlessing',discovery:'忘れられた神の加護',chainEnd:true,tag:'permanent'})),
   choice('試練を受ける',out('地下礼拝堂への扉が開いた。',{flag:'oldMap',discovery:'古地図の地下礼拝堂',keyFragments:2,chainEnd:true,tag:'secretStage'})),
   choice('何も持ち帰らない',out('祠は静かに消え、代わりに呪いの痕跡も消えた。',{flag:'shrineReleased',discovery:'消えた祠',chainEnd:true}))]}
 ]},
 rift:{id:'rift',name:'向こう側の声',minProgress:8,steps:[
  {id:'rift-1',name:'揺らぐ境界',text:'空間が水面のように揺れ、その奥から規則的な音が聞こえる。',choices:[
   choice('触れる',out('指先に冷たい幾何学模様が焼き付いた。',{flag:'riftTouched',discovery:'境界共鳴',keyFragments:1,next:1})),
   choice('観測する',out('揺らぎには一定の周期がある。自然現象ではない。',{flag:'riftObserved',discovery:'境界周期',next:1})),
   choice('離れる',out('距離を取った直後、揺らぎから何かがこちらを観測した。',{flag:'riftAvoided',discovery:'観測される感覚',next:1}))]},
  {id:'rift-2',name:'反復する信号',text:'以前と同じ周期の信号が、別の土地で再び聞こえる。偶然ではない。',choices:[
   choice('応答する',out('こちらの存在を示す短い信号を返した。',{flag:'riftAnswered',discovery:'応答済み信号',next:2})),
   choice('記録する',out('信号列を完全に記録した。',{flag:'riftRecorded',discovery:'境界信号ログ',next:2})),
   choice('逆位相で遮断する',out('信号を一時的に打ち消すことに成功した。',{flag:'riftJammed',discovery:'遮断パターン',next:2}),{jobs:['scholar','craftsman','alchemist']})]},
  {id:'rift-3',name:'三つの声',text:'信号を解析すると、上方・地下・人工的な遠方の三方向から別々の応答が混ざっている。',choices:[
   choice('上方の声を選ぶ',out('空の向こうから鐘のような応答が返った。',{flag:'riftHeavenSignal',discovery:'天上信号',next:3})),
   choice('地下の声を選ぶ',out('低い呻きの奥に明瞭な言葉を聞いた。',{flag:'riftUnderSignal',discovery:'地下信号',next:3})),
   choice('人工的な声を選ぶ',out('機械的な列が一瞬だけ意味を持った。',{flag:'riftMachineSignal',discovery:'人工信号',next:3}))]},
  {id:'rift-4',name:'境界の返答',text:'選んだ声が最後の座標を返してきた。そこには巨大な鍵穴の形が含まれている。',choices:[
   choice('座標を記録する',out('境界を越えるための座標を保存した。',{flag:'riftAttunement',discovery:'境界座標',keyFragments:2,chainEnd:true,tag:'world'})),
   choice('座標を消去する',out('危険な接続を断ったが、逆探知用の断片だけ残した。',{flag:'riftCounterTrace',discovery:'逆探知断片',chainEnd:true,tag:'defense'}))]}
 ]},
 patrol:{id:'patrol',name:'残された旗',minProgress:7,steps:[
  {id:'patrol-1',name:'血のついた討伐旗',text:'街道脇に折れた討伐隊の旗が落ちている。隊員の姿はない。',choices:[
   choice('捜索する',out('引きずられた跡を発見した。',{flag:'patrolSearch',discovery:'討伐隊の痕跡',next:1})),
   choice('物資を確保する',out('残された物資を回収し、識別票だけ持ち帰った。',{flag:'patrolSupplies',discovery:'討伐隊の識別票',gold:250,next:1})),
   choice('周囲の罠を読む',out('これは敗走ではなく、意図的に誘導された痕跡だ。',{flag:'patrolTrapKnown',discovery:'待ち伏せの痕跡',next:1}),{jobs:['hunter','ninja','thief']})]},
  {id:'patrol-2',name:'生存者の声',text:'崖下から弱い救難音がする。同時に奥の森から敵の気配も迫る。',choices:[
   choice('生存者を救出する',out('二人の隊員を救い出した。',{flag:'patrolSurvivors',discovery:'救出された隊員',next:2})),
   choice('敵を先に追う',out('救助より敵の正体を暴くことを優先した。',{flag:'patrolEnemyTrace',discovery:'襲撃者の正体',next:2})),
   choice('応急処置して分散撤退',out('最低限の治療で全員を別々の道へ逃がした。',{flag:'patrolTriage',discovery:'分散撤退路',next:2}),{jobs:['priest','alchemist']})]},
  {id:'patrol-3',name:'空になった野営地',text:'討伐隊の野営地は空だった。中央には敵からの挑戦状だけが残されている。',choices:[
   choice('挑戦を受ける',out('敵の指定した狩場へ向かう。',{flag:'patrolChallenge',discovery:'挑戦状の狩場',next:3,tag:'boss'})),
   choice('逆に待ち伏せする',out('相手の狩場を利用し、こちらが罠を張った。',{flag:'patrolAmbush',discovery:'逆待ち伏せ地点',next:3})),
   choice('本部へ情報を持ち帰る',out('無謀な追撃をせず、討伐情報として共有した。',{flag:'patrolBountyIntel',discovery:'討伐情報',next:3,tag:'bounty'}))]},
  {id:'patrol-4',name:'残された旗を掲げる',text:'事件の決着後、救われた隊員たちが新しい旗を差し出した。',choices:[
   choice('旗を受け取る',out('討伐隊との信頼が生まれ、特殊依頼が届くようになった。',{flag:'patrolAlliance',discovery:'討伐隊との同盟',chainEnd:true,tag:'bounty'})),
   choice('隊員に返す',out('隊は再建され、各地の強敵情報を送ると約束した。',{flag:'patrolIntelNetwork',discovery:'討伐隊情報網',keyFragments:1,chainEnd:true,tag:'intel'}))]}
 ]},
 machine:{id:'machine',name:'UNKNOWN CALL',minProgress:20,requires:'machineUnlocked',steps:[
  {id:'machine-1',name:'UNKNOWN CALL',text:'聞き慣れた機界の規格とは異なる短い信号が届く。発信源は人界側だ。',choices:[
   choice('信号を追う',out('座標は廃棄された搬送路を示していた。',{flag:'machineCallTracked',discovery:'未知機械信号',next:1})),
   choice('解析する',out('信号は救難と警告を同時に含んでいる。',{flag:'machineCallDecoded',discovery:'二重化された信号',next:1})),
   choice('コードを直接読む',out('機巧賢者の知識で、送信者が自律機械だと断定した。',{flag:'machineCallDirect',discovery:'自律機の救難コード',next:1}),{jobs:['mechanist_sage']})]},
  {id:'machine-2',name:'壊れた自律機械',text:'信号源には、機界の規格外部品で組まれた小型機が倒れている。',choices:[
   choice('修復する',out('機械は再起動し、あなたを「暫定管理者」と認識した。',{flag:'machineUnitRepaired',discovery:'修復された自律機',next:2})),
   choice('分解して調べる',out('未知の記憶素子を取り出した。',{flag:'machineUnitDismantled',discovery:'未知記憶素子',next:2})),
   choice('初期化する',out('過去の命令を消し、安全な状態で起動した。',{flag:'machineUnitReset',discovery:'初期化個体',next:2}))]},
  {id:'machine-3',name:'観測外プロセス',text:'自律機の記憶から、ARCHITECT-1にも登録されていないプロセスが見つかる。',choices:[
   choice('接続する',out('未知プロセスへ一瞬だけ接続した。向こうもこちらを認識した。',{flag:'machineUnknownLinked',discovery:'観測外プロセス',next:3})),
   choice('隔離する',out('プロセスを封鎖し、安全に複製した。',{flag:'machineUnknownIsolated',discovery:'隔離プロセス',next:3})),
   choice('囮信号を送る',out('偽の座標へ応答を誘導した。',{flag:'machineUnknownDecoy',discovery:'囮応答ログ',next:3}),{jobs:['ninja','scholar','craftsman']})]},
  {id:'machine-4',name:'観測者からの応答',text:'最後の応答は文字ではない。「こちらも見ている」という意味だけが直接伝わった。',choices:[
   choice('応答を保存する',out('未知観測者の応答を封印ログとして保存した。',{flag:'machineObserverReply',discovery:'観測者の応答',keyFragments:3,chainEnd:true,tag:'observer'})),
   choice('接続を完全遮断する',out('通信路を焼き切り、未知存在からの追跡を止めた。',{flag:'machineObserverBlocked',discovery:'焼却された通信路',chainEnd:true,tag:'defense'}))]}
 ]},
 nemesis:{id:'nemesis',name:'奴はまだ生きている',minProgress:12,requires:'nemesisEligible',steps:[
  {id:'nemesis-1',name:'血のついた武器',text:'討伐済みのはずの敵が使ったものと同じ傷跡が、折れた武器に残っている。',choices:[
   choice('血痕を追う',out('痕跡は通常の魔物より明確な意思を持って移動している。',{flag:'nemesisTrace',discovery:'宿敵の血痕',next:1})),
   choice('罠を張る',out('相手が戻る前提で周囲に罠を仕掛けた。',{flag:'nemesisTrapSet',discovery:'宿敵用の罠',next:1})),
   choice('情報を集める',out('近隣の冒険者から同じ敵の目撃談を集めた。',{flag:'nemesisIntel',discovery:'宿敵の目撃情報',next:1}))]},
  {id:'nemesis-2',name:'増えた犠牲者',text:'痕跡の先で別の冒険者が倒れている。敵は戦うたびに戦術を変えているらしい。',choices:[
   choice('弱点を聞き出す',out('相手が特定の攻撃を避ける癖を知った。',{flag:'nemesisWeakness',discovery:'宿敵の弱点',next:2})),
   choice('新しい能力を調べる',out('敵が新たな力を獲得した兆候を記録した。',{flag:'nemesisMutationKnown',discovery:'宿敵の変異',next:2})),
   choice('治療を優先する',out('冒険者を救い、後日追跡に協力してもらえることになった。',{flag:'nemesisWitnessSaved',discovery:'生存証人',next:2}),{jobs:['priest','alchemist']})]},
  {id:'nemesis-3',name:'宿敵の狩場',text:'ついに相手の狩場を特定した。だが向こうもあなたを待っている。',choices:[
   choice('先制襲撃する',out('速度を優先して巣へ踏み込む。',{flag:'nemesisPreempt',discovery:'先制襲撃経路',next:3,tag:'nemesis'})),
   choice('待ち伏せする',out('相手が出てくるまで罠の中で待つ。',{flag:'nemesisAmbush',discovery:'宿敵待ち伏せ',next:3,tag:'nemesis'})),
   choice('あえて逃がす',out('さらに成長させ、より大きな獲物にする道を選んだ。',{flag:'nemesisSpared',discovery:'成長する宿敵',next:3,tag:'risk'}))]},
  {id:'nemesis-4',name:'宿敵の宣戦',text:'夜、遠くから咆哮が届く。もはや偶然遭遇する敵ではない。あなた個人を狙う宿敵になった。',choices:[
   choice('決着をつける',out('次の遭遇を最終決戦にする覚悟を決めた。',{flag:'nemesisFinalHunt',discovery:'宿敵との決着',chainEnd:true,tag:'nemesis'})),
   choice('さらに泳がせる',out('宿敵の成長を許す代わりに、その巣の財宝まで狙う。',{flag:'nemesisHighRisk',discovery:'宿敵の宝域',chainEnd:true,tag:'riskReward'}))]}
 ]}
});

export const WORLD_EVENT_SINGLES=Object.freeze([
 {id:'campfire',name:'消えかけた野営火',minProgress:1,text:'誰かが急いで立ち去った野営地。火だけがまだ残っている。',choices:[choice('周囲を調べる',out('未使用の旅用品と街道情報を見つけた。',{gold:120,discovery:'旅人の野営跡'})),choice('火だけ消す',out('痕跡を残さず先へ進んだ。'))]},
 {id:'wagon',name:'捨てられた荷車',minProgress:2,text:'車輪の壊れた荷車が道を塞いでいる。中身は荒らされていない。',choices:[choice('荷を確認する',out('売却できる雑貨をいくつか回収した。',{gold:220})),choice('持ち主を探す',out('遠くに続く足跡を記録した。',{flag:'wagonOwnerTrail',discovery:'荷車の持ち主の足跡'}))]},
 {id:'meteor',name:'遠い流星',minProgress:8,text:'昼空を青白い流星が横切り、遠方へ落ちた。',choices:[choice('落下方向を記録する',out('地図に落下地点の方角を書き込んだ。',{flag:'meteorBearing',discovery:'流星の方角'})),choice('先を急ぐ',out('流星は雲の向こうへ消えた。'))]},
 {id:'lostMonster',name:'迷子の小魔物',minProgress:4,text:'戦意のない小型魔物が荷袋に頭を突っ込んでいる。',choices:[choice('餌を与える',out('警戒を解き、森へ戻っていった。',{flag:'kindToMonster',discovery:'魔物との小さな縁'})),choice('追い払う',out('魔物は一目散に逃げていった。'))]},
 {id:'storm',name:'境界の豪雨',minProgress:10,text:'晴天だった空が突然暗くなり、局地的な豪雨が降り始めた。',choices:[choice('雨宿りする',out('岩陰で古い刻印を見つけた。',{keyFragments:1,discovery:'雨に浮かぶ刻印'})),choice('強行する',out('ずぶ濡れになったが時間を失わず進んだ。'))]},
 {id:'grave',name:'名の消えた墓標',minProgress:6,text:'街道から少し外れた場所に、名だけ削られた墓標がある。',choices:[choice('手を合わせる',out('静かな風が吹き、奇妙な安心感が残った。',{flag:'namelessGravePrayer',discovery:'名なき墓標'})),choice('碑面を調べる',out('裏側に古い討伐隊の印を見つけた。',{flag:'oldPatrolMark',discovery:'古い討伐隊印'}))]}
]);

function conditionMet(condition,ctx){if(!condition)return true;if(condition.jobs&&!condition.jobs.includes(ctx.currentJobId))return false;if(condition.flag&&!ctx.flags?.[condition.flag])return false;return true;}
function chainRequirementMet(chain,ctx){if(ctx.progress<(chain.minProgress||0))return false;if(chain.requires==='machineUnlocked'&&!ctx.machineUnlocked)return false;if(chain.requires==='nemesisEligible'&&!ctx.nemesisEligible)return false;return true;}
export function materializeWorldEvent(event,ctx={}){const choices=(event.choices||[]).filter(c=>conditionMet(c.condition,ctx));return{...event,choices:choices.map(c=>c.label),outcomes:choices.map(c=>c.outcome)};}
export function eventChanceForDryStreak(dry=0){if(dry<18)return .07;if(dry<22)return .08;if(dry<26)return .10;return .12;}
export function eligibleChainFollowups(chainState={},ctx={}){const list=[];for(const chain of Object.values(WORLD_EVENT_CHAINS)){const s=chainState[chain.id];if(!s||s.completed||!Number.isInteger(s.step)||s.step<=0||s.step>=chain.steps.length)continue;if(!chainRequirementMet(chain,ctx))continue;list.push({chain,event:chain.steps[s.step],step:s.step});}return list;}
export function eligibleChainStarters(chainState={},ctx={}){const list=[];for(const chain of Object.values(WORLD_EVENT_CHAINS)){const s=chainState[chain.id];if(s?.started||s?.completed)continue;if(!chainRequirementMet(chain,ctx))continue;list.push({chain,event:chain.steps[0],step:0});}return list;}
export function eligibleSingles(ctx={}){return WORLD_EVENT_SINGLES.filter(e=>ctx.progress>=(e.minProgress||0));}
function pick(list,rng){return list.length?list[Math.floor(rng()*list.length)%list.length]:null;}
export function rollWorldEvent2({chainState={},ctx={},rng=Math.random,followupChance=.30}={}){const followups=eligibleChainFollowups(chainState,ctx);let selected=null;if(followups.length&&rng()<followupChance)selected=pick(followups,rng);if(!selected){const starters=eligibleChainStarters(chainState,ctx),singles=eligibleSingles(ctx);const pool=[...starters,...singles.map(event=>({chain:null,event,step:null}))];selected=pick(pool,rng)||pick(followups,rng);}if(!selected)return null;const ev=materializeWorldEvent(selected.event,ctx);return{...ev,chainId:selected.chain?.id||null,chainName:selected.chain?.name||null,chainStep:selected.step};}
export function outcomeForWorldEvent(event,choiceIndex=0){return event?.outcomes?.[choiceIndex]||event?.outcomes?.[0]||null;}
