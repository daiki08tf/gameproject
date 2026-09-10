/* Settlement 3.0 S19 — UI 4.0 category dividers.
   S9–S18 each append their own already-collapsed <details> section directly
   into #settlementContent, in a fixed, permanent DOM order. That stack grew
   into one long flat list of section headers with no grouping. This patch
   adds no new panels and moves no state — it only inserts small heading
   dividers ahead of the first member of each category, purely for scannability
   on a long/mobile screen. Idempotent per category via a data marker, so it
   is safe under the MutationObserver instances every one of those systems
   already installs on #settlementContent. */
const CATEGORIES=[
  {key:'exploration',label:'探索・秘密施設',anchor:'[data-settlement-exploration]'},
  {key:'defense',label:'防衛・季節・政策',anchor:'[data-settlement-defense]'},
  {key:'expeditions',label:'遠征・終端ネットワーク',anchor:'[data-settlement-expeditions]'},
  {key:'arena',label:'訓練・記録・首都',anchor:'[data-settlement-arena]'},
];
function render(){
  const host=document.getElementById('settlementContent');if(!host)return;
  for(const cat of CATEGORIES){
    if(host.querySelector(`[data-settlement-ui4-heading="${cat.key}"]`))continue;
    const anchor=host.querySelector(cat.anchor);if(!anchor)continue;
    const heading=document.createElement('div');
    heading.dataset.settlementUi4Heading=cat.key;
    heading.className='settlement-category-heading';
    heading.style.cssText='margin-top:16px;padding-top:10px;border-top:1px solid rgba(255,255,255,.14);font-size:12px;letter-spacing:.08em;opacity:.72;';
    heading.textContent=cat.label;
    host.insertBefore(heading,anchor);
  }
}
function install(){
  const host=document.getElementById('settlementContent');if(!host)return;
  const observer=new MutationObserver(render);
  observer.observe(host,{childList:true});
  queueMicrotask(render);
}
install();
