/* Phase 11.2 — Ch1–15 compact story pass
 * Story is intentionally short and embedded in existing Adventure/Battle flow.
 * The Veil must not be named before Ch19; these chapters only escalate anomalies.
 */

export const CORE_STORY_CHAPTERS = Object.freeze([
  {chapter:1,objective:'近隣を荒らす魔物を退け、冒険者として最初の道を切り開く。',opening:'街道の先で魔物が増えている。まずは平原を抜け、巣の主を倒そう。',discovery:'古い道標に、今の王国では使われていない同心円の紋様が刻まれている。',bossIntro:'オークキングが退路を塞ぐ。ここを越えれば、旅は本当に始まる。',clear:'平原に静けさが戻った。だが道標の奇妙な紋様だけが、妙に記憶へ残った。'},
  {chapter:2,objective:'深緑の森を抜け、交易路を塞ぐ大樹霊を鎮める。',opening:'森が道そのものを飲み込み始めた。奥で何かが植物と魔物を呼び寄せている。',discovery:'巨木の根元から、石ではない黒い板片が見つかる。表面には平原と同じ円環模様がある。',bossIntro:'森の大樹霊が根を持ち上げる。森を守る怒りなのか、それとも別の力に起こされたのか。',clear:'大樹霊は沈黙した。黒い板片は冷たいまま、かすかに脈打っている。'},
  {chapter:3,objective:'忘れられた遺跡を調査し、目覚めた古代守護者を停止させる。',opening:'地図にない遺跡が地表へ現れた。内部では何百年も止まっていた守護機構が動いている。',discovery:'壁画には、空・地・地下を一本の輪で結ぶ図が描かれている。輪の外側だけが意図的に削られている。',bossIntro:'古代守護者ゴーレムが起動する。「境界侵入」の古い警告音だけを繰り返している。',clear:'守護者は停止した。遺跡が守っていたのは財宝ではなく、何かの通路だったらしい。'},
  {chapter:4,objective:'霊峰の異常寒波を止め、山頂を占拠した竜を討つ。',opening:'季節外れの吹雪が麓まで降りてきた。山頂の魔力が周囲の気候を歪めている。',discovery:'氷壁の中に、遺跡と同じ輪状構造が凍りついている。自然にできたものではない。',bossIntro:'フロストドラゴンが凍結した輪を守るように立ちはだかる。',clear:'竜が倒れると異常寒波は弱まった。氷の輪は砕けず、山の奥へ続いている。'},
  {chapter:5,objective:'火山活動の暴走を止め、炎帝ドレイクを退ける。',opening:'火口の脈動と魔物の凶暴化が同期している。噴火の中心へ向かう。',discovery:'溶岩の下から、霊峰で見たものと同じ材質の環状装置が露出している。',bossIntro:'炎帝ドレイクが装置の上で炎をまとった。火山の主というより、装置に力を引き出されているようだ。',clear:'噴火は落ち着いた。異なる土地に同じ構造物がある――偶然とは思いにくくなってきた。'},
  {chapter:6,objective:'底なし沼地の毒化を止め、奥地を支配する沼の女王を倒す。',opening:'水路から毒が広がり、周辺の村まで影響が出ている。源流を探す。',discovery:'沼底から古代の配管網が見つかる。水ではなく、光る液体をどこかへ運んでいた跡がある。',bossIntro:'沼の女王が配管の集まる中心で待つ。毒は生物だけのものではなさそうだ。',clear:'毒の流れは止まった。配管は地図にない方向――さらに地下へ伸びている。'},
  {chapter:7,objective:'天空の遺跡都市へ到達し、空路を閉ざす門番を突破する。',opening:'地上の遺跡と同じ構造を持つ都市が、雲の上で発見された。調査隊の後を追う。',discovery:'天空都市の床には、人界を含む複数の円を線で結んだ古い星図が刻まれている。',bossIntro:'天空の門番が星図の中央を守る。「下層民の通過を禁ず」と古語で告げる。',clear:'門番は沈黙した。地上だけが世界ではないという考えが、初めて現実味を帯びる。'},
  {chapter:8,objective:'開いた魔界への裂け道を調査し、堕天の大公爵を退ける。',opening:'天空都市の先で、光ではなく闇へ落ちる門が開いた。向こう側にも文明の痕跡がある。',discovery:'魔界の碑文は人界を「上層」ではなく「隣接層」と記している。世界は上下ではなく並んでいるらしい。',bossIntro:'堕天の大公爵が笑う。「お前たちは、まだ自分の檻の形すら知らぬ」',clear:'裂け道は安定したまま残った。敵の言葉は挑発だけではない――世界には境目がある。'},
  {chapter:9,objective:'虚無の狭間で進行する空間崩壊を止め、番人の正体を探る。',opening:'魔界から戻る途中、道そのものが欠けた。人界でも魔界でもない空間へ踏み込む。',discovery:'狭間では遠く離れた景色が一瞬だけ重なる。森、雪山、見知らぬ光の都市が同じ場所に映った。',bossIntro:'虚無の番人が現れる。「接続数、規定値超過。閉鎖処理を開始」',clear:'狭間は閉じた。しかし番人の言葉は、世界の境界が何者かに管理されている可能性を示している。'},
  {chapter:10,objective:'勇者の試練を突破し、魔王との戦いの裏にある異常を確かめる。',opening:'各地の異変を越えた者だけが入れる試練場。その最奥には真・魔王が待つという。',discovery:'試練場の紋章配置は、これまでの遺跡・天空都市・魔界の構造と一致する。別々の文明が同じ規格を使っている。',bossIntro:'真・魔王が剣を抜く。「勇者よ。世界を救うなら、まず世界が何なのかを疑え」',clear:'魔王は倒れた。だが旅は終わらない。遠く離れた土地から、同じ古代規格の報告が次々と届き始めた。'},
  {chapter:11,objective:'灰冠の旧都を探索し、失われた王国と古代規格の関係を探る。',opening:'滅んだ旧都で、各地と同じ円環紋様が大量に発見された。王都そのものが巨大な施設だった可能性がある。',discovery:'王家の記録には「空が裂ける夜、王は門を閉じた」とある。何から守ったのかは削られている。',bossIntro:'灰冠王ヴァルグが王印を掲げる。「門を開く者を、王は通さぬ」',clear:'王印は鍵のような形をしていた。古代の王たちは、境界の存在を知っていた。'},
  {chapter:12,objective:'天雷の浮島で古代防衛網を調べ、暴走した雷翼獣を止める。',opening:'旧都の王印に反応し、空に新たな浮島群が現れた。雷は一定方向へ向けて放たれている。',discovery:'雷撃装置は地上ではなく空の一点を狙っている。外から来る何かを撃ち落とす防衛網だったようだ。',bossIntro:'雷翼獣ゼファルが防衛網と同調する。侵入判定がこちらにも向けられた。',clear:'防衛網の一部を停止。記録には「外部接触」という語だけが残っている。'},
  {chapter:13,objective:'蒼晶深層の共鳴源へ向かい、世界各地の装置が連動する理由を探る。',opening:'各地の古代装置が同時に振動し始めた。共鳴の中心は地下深くにある。',discovery:'蒼晶は遠隔地の装置と同じ周期で明滅する。世界中の施設は、元から一つのネットワークだった。',bossIntro:'晶界竜アズレオンが共鳴核に巻きつく。核を壊せば何が起こるか、誰にも分からない。',clear:'共鳴は弱まったが止まらない。信号はさらに先――腐緑の樹海と黒い機城へ分岐している。'},
  {chapter:14,objective:'腐緑の樹海に侵食された古代施設を調査し、黒鉄機城への経路を確保する。',opening:'樹海の植物が人工物を覆いながら、その内部の力を吸い上げている。',discovery:'根の下に「第七封鎖」「観測継続」の文字列が残る端末を発見。古代遺跡とは思えない形式だ。',bossIntro:'腐界樹ベルムが端末群を根で包む。施設は生き物の侵食を受けながらも稼働している。',clear:'端末から黒鉄機城への座標を取得した。そこが、このネットワークの制御点らしい。'},
  {chapter:15,objective:'黒鉄機城へ突入し、世界各地の境界装置を制御する機皇アーク・ゼロを停止させる。',opening:'黒鉄機城は遺跡ではない。今も世界各地へ信号を送り続ける、稼働中の管理施設だ。',discovery:'中枢記録には「境界圧」「外部観測」「七封鎖」の語が並ぶ。世界は何かから隔てられ、監視されている。',bossIntro:'機皇アーク・ゼロが起動する。「封鎖維持率低下。人界側干渉個体を排除する」',clear:'アーク・ゼロ停止。直後、世界各地で空間の揺らぎが発生した。機城は侵略装置ではない――何かを押さえていた。次の旅は、その境界の向こうへ続く。'},
]);

export function coreStoryChapter(chapterNumber){
  return CORE_STORY_CHAPTERS.find(entry=>entry.chapter===Number(chapterNumber))||null;
}

export function coreStoryBeatForStage(chapterNumber, stage, stageIndex, stageCount){
  const chapter=coreStoryChapter(chapterNumber);
  if(!chapter||!stage||stage.branch||stage.bounty)return null;
  const isBoss=!!stage.boss;
  const mainCount=Math.max(1,Number(stageCount)||5);
  const middleIndex=Math.max(1,Math.floor((mainCount-1)/2));
  return {
    objective:chapter.objective,
    opening:stageIndex===0?chapter.opening:null,
    discovery:stageIndex===middleIndex?chapter.discovery:null,
    bossIntro:isBoss?chapter.bossIntro:null,
    clear:isBoss?chapter.clear:null,
  };
}
