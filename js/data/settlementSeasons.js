export const SETTLEMENT_SEASONS=Object.freeze([
{id:'spring',name:'芽吹き季',icon:'🌱'},{id:'summer',name:'陽炎季',icon:'☀️'},{id:'autumn',name:'実り季',icon:'🍂'},{id:'winter',name:'霜夜季',icon:'❄️'}
]);
export const SETTLEMENT_WEATHER=Object.freeze([
{id:'clear',name:'晴れ',icon:'☀️'},{id:'rain',name:'雨',icon:'🌧️'},{id:'wind',name:'強風',icon:'🌬️'},{id:'mist',name:'霧',icon:'🌫️'}
]);
export const SETTLEMENT_DAYPARTS=Object.freeze([
{id:'morning',name:'朝',icon:'🌅'},{id:'day',name:'昼',icon:'🏙️'},{id:'evening',name:'夕',icon:'🌇'},{id:'night',name:'夜',icon:'🌙'}
]);
export const SETTLEMENT_FESTIVALS=Object.freeze([
{id:'springFair',name:'芽吹き市',icon:'🌸',season:'spring',minHall:5,desc:'住民と旅商人が集まる春の市。'},
{id:'summerWatch',name:'灯火祭',icon:'🏮',season:'summer',minHall:8,desc:'見張り塔から街道へ灯を掲げる祭り。'},
{id:'harvest',name:'収穫祭',icon:'🌾',season:'autumn',minHall:10,desc:'生産区と市場が主役になる実りの祭り。'},
{id:'winterVigil',name:'霜夜祭',icon:'🔥',season:'winter',minHall:12,desc:'異界侵食を警戒しながら焚き火を囲む冬祭り。'}
]);
export function settlementFestivalEligible(festival,ctx={}){return (ctx.hall||0)>=(festival.minHall||0)&&ctx.season===festival.season;}
