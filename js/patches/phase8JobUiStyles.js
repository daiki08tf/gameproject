const id='phase8-job-ui-styles';
if(typeof document!=='undefined'&&!document.getElementById(id)){
 const s=document.createElement('style');s.id=id;s.textContent=`
.phase8-job-toolbar{position:sticky;top:0;z-index:5;padding:10px;background:rgba(10,12,20,.96);border:1px solid rgba(255,255,255,.10);border-radius:12px;margin:10px 0;backdrop-filter:blur(10px)}
.phase8-job-stats{display:flex;gap:10px;align-items:center;flex-wrap:wrap;font-size:12px}.phase8-job-stats strong{font-size:14px;letter-spacing:.08em}.phase8-job-stats span{opacity:.7}
.phase8-job-search{width:100%;box-sizing:border-box;margin:8px 0;padding:10px 12px;border-radius:9px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.05);color:inherit;font:inherit}
.phase8-filter-row{display:flex;gap:5px;overflow-x:auto;padding:2px 0}.phase8-filter{flex:0 0 auto;padding:6px 9px;border-radius:999px;border:1px solid rgba(255,255,255,.12);background:transparent;color:inherit;font-size:12px}.phase8-filter.active{border-color:rgba(242,201,76,.75);background:rgba(242,201,76,.12)}
.phase8-job-result-head{display:flex;justify-content:space-between;align-items:center;margin:8px 2px;font-size:12px}.phase8-job-result-head span{opacity:.55}.phase8-job-list{display:grid;gap:6px}
.phase8-job-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;align-items:center;padding:9px 10px;border:1px solid rgba(255,255,255,.10);border-radius:10px;background:rgba(255,255,255,.025)}.phase8-job-row.current{border-color:rgba(242,201,76,.65);background:rgba(242,201,76,.07)}.phase8-job-row.locked{opacity:.58}
.phase8-job-title{display:flex;gap:7px;align-items:center;min-width:0;font-weight:700}.phase8-job-title>span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.phase8-job-title b{font-size:9px;color:#f2c94c;white-space:nowrap}.phase8-job-meta{display:flex;gap:7px;align-items:center;min-width:0;margin-top:3px;font-size:10px;opacity:.62;overflow:hidden}.phase8-job-meta span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.phase8-job-actions{display:flex;gap:5px;align-items:center}.phase8-job-actions button{white-space:nowrap;padding:6px 8px;font-size:11px}.phase8-job-detail{grid-column:1/-1;padding:8px 2px 2px;border-top:1px solid rgba(255,255,255,.07);font-size:11px;line-height:1.55}.phase8-job-detail p{margin:3px 0}.phase8-job-detail.hidden{display:none}
@media(max-width:520px){.phase8-job-row{grid-template-columns:minmax(0,1fr) auto;padding:8px}.phase8-job-actions .job-card-btn{max-width:70px}.phase8-job-toolbar{top:-1px}.job-view-tabs{position:sticky;top:0;z-index:6}}
`;document.head.appendChild(s);
}
