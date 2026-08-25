export function world3BranchSummary({keyFragments=0,keyCount=0,secretSites=[],riftKeys=[]}={}){
  const discovered=secretSites.filter(x=>x?.state&&x.state!=='hidden').length;
  const unlocked=secretSites.filter(x=>x?.unlocked).length;
  return {
    keyFragments:Math.max(0,Math.floor(Number(keyFragments)||0)),
    keyCount:Math.max(0,Math.floor(Number(keyCount)||0)),
    discovered,
    unlocked,
    riftKeyCount:Array.isArray(riftKeys)?riftKeys.length:0,
  };
}

export function world3BranchLabel(summary={}){
  const s=world3BranchSummary(summary);
  const parts=[`鍵片 ${s.keyFragments}`,`完成鍵 ${s.keyCount}`];
  if(s.discovered)parts.push(`発見 ${s.discovered}`);
  if(s.unlocked)parts.push(`異界 ${s.unlocked}`);
  if(s.riftKeyCount)parts.push(`裂界鍵 ${s.riftKeyCount}`);
  return parts.join(' / ');
}
