(function(){
  const {games,materials,medias,TODAY}=ADX;
  const gName=id=>(games.find(g=>g.id===id)||{}).name||id;
  const F=[
    {key:'game',label:'游戏',values:games.map(g=>g.id),text:gName,get:m=>m.gameId},
    {key:'media',label:'媒体',values:Object.keys(medias),get:m=>m.media},
    {key:'type',label:'素材类型',values:['视频','图片'],get:m=>m.type},
    {key:'scope',label:'入库批次',values:['今日新增','历史'],get:m=>m.today?'今日新增':'历史'},
    {key:'dedupe',label:'去重状态',values:['唯一','疑似重复','已合并'],get:m=>m.dedupe}
  ];
  const state={sel:{},q:'',sort:'date',view:'masonry',open:null,limit:20};
  F.forEach(f=>state.sel[f.key]=new Set());
  const expanded={},closed={};
  // URL -> state（支持从筛选页带入 ?game=g01,g02）
  const p=new URLSearchParams(location.search);
  F.forEach(f=>{const v=p.get(f.key);if(v)v.split(',').filter(Boolean).forEach(x=>state.sel[f.key].add(x))});
  if(p.get('today')==='1')state.sel.scope.add('今日新增');
  state.q=p.get('q')||'';state.sort=p.get('sort')||'date';state.view=p.get('view')||'masonry';state.open=p.get('id');
  document.getElementById('q').value=state.q;document.getElementById('sort').value=state.sort;
  if(p.get('from')==='filter'&&document.referrer)document.getElementById('backLink').href=document.referrer;

  function match(m,skip){
    if(state.q){const s=state.q.toLowerCase();if(![m.title,m.copy,m.tags.join(' '),m.adxId,m.game].join(' ').toLowerCase().includes(s))return false}
    return F.every(f=>f.key===skip||!state.sel[f.key].size||state.sel[f.key].has(f.get(m)));
  }
  const list=()=>materials.filter(m=>match(m)).sort((a,b)=>state.sort==='date'?(b.date.localeCompare(a.date)||a.id.localeCompare(b.id)):b[state.sort]-a[state.sort]);
  function syncURL(){
    const q=new URLSearchParams();
    F.forEach(f=>{if(state.sel[f.key].size)q.set(f.key,[...state.sel[f.key]].join(','))});
    if(state.q)q.set('q',state.q);if(state.sort!=='date')q.set('sort',state.sort);if(state.view!=='masonry')q.set('view',state.view);if(state.open)q.set('id',state.open);
    history.replaceState(null,'','?'+q.toString());
  }
  function renderFacets(){
    document.getElementById('facets').innerHTML=F.map(f=>{
      const lim=expanded[f.key]?99:6;
      const opts=f.values.filter((v,i)=>i<lim||state.sel[f.key].has(v)).map(v=>{const c=materials.filter(m=>match(m,f.key)&&f.get(m)===v).length,on=state.sel[f.key].has(v),dis=!on&&!c;
        const sw=f.key==='media'?`<i style="width:10px;height:10px;border-radius:3px;background:${medias[v]}"></i>`:'';
        return `<label class="opt${dis?' dis':''}"><input type="checkbox" data-k="${f.key}" value="${esc(v)}" ${on?'checked':''} ${dis?'disabled':''}>${sw}${esc(f.text?f.text(v):v)}<span class="n">${c}</span></label>`}).join('');
      const more=f.values.length>6?`<button class="more" data-more="${f.key}">${expanded[f.key]?'收起':'展开全部（'+f.values.length+'）'}</button>`:'';
      return `<div class="facet${closed[f.key]?' closed':''}"><div class="facet-hd" data-tog="${f.key}"><span>${f.label}${state.sel[f.key].size?` <span style="color:var(--pri)">· ${state.sel[f.key].size}</span>`:''}</span><span class="arw">▾</span></div><div class="facet-bd">${opts}${more}</div></div>`}).join('');
  }
  function renderChips(){
    const c=[];
    F.forEach(f=>state.sel[f.key].forEach(v=>c.push(`<span class="chip">${f.key==='scope'?esc(v):f.label+'='+esc(f.text?f.text(v):v)}<button data-rm="${f.key}" data-v="${esc(v)}">×</button></span>`)));
    if(state.q)c.push(`<span class="chip">关键词=${esc(state.q)}<button data-rmq="1">×</button></span>`);
    const quick=state.sel.scope.has('今日新增')?'':'<button class="btn sm" data-quick="today">+ 只看今日新增</button>';
    document.getElementById('chips').innerHTML=(c.length?c.join(''):'<span class="hint">未设置筛选，显示全部入库素材</span>')+quick+(c.length?'<button class="btn ghost sm clear" id="clearChips">清空筛选</button>':'');
  }
  function thumb(m,fixed){
    const r=fixed?'':`aspect-ratio:${1/m.ratio};`;
    return `<div class="thumb" style="${r}background:linear-gradient(160deg,${m.color} 0%,hsl(${m.hue} 70% 55%) 100%)">
      <span class="play">▶</span>${m.type==='视频'?`<span class="dur">00:${String(m.dur).padStart(2,'0')}</span>`:'<span class="dur">图片</span>'}
      ${m.today?'<span class="new">今日</span>':''}<span class="lbl">占位图 · ${esc(m.game)}</span></div>`;
  }
  const dTag=d=>`<span class="tag ${d==='唯一'?'ok':d==='疑似重复'?'warn':'gray'}">${d}</span>`;
  const mediaEl=m=>`<span class="media"><i style="background:${medias[m.media]}"></i>${m.media}</span>`;
  function card(m){
    return `<div class="card${state.open===m.id?' sel':''}" data-id="${m.id}">${thumb(m,state.view==='grid')}
      <div class="cb"><div class="row">${mediaEl(m)}<span style="margin-left:auto">${esc(m.game)}</span></div>
      <div class="t">${esc(m.title)}</div>
      <div class="m"><span>▷ ${fmt(m.plays)}</span><span>♡ ${fmt(m.likes)}</span><span>计划 ${m.plans}</span></div>
      <div class="foot"><span>入库 ${m.date.slice(5)} · 使用 ${m.days} 天</span>${dTag(m.dedupe)}</div></div></div>`;
  }
  function renderResult(){
    const L=list(),el=document.getElementById('result'),pg=document.getElementById('pager');
    document.getElementById('count').innerHTML=`共 <b>${L.length}</b> 条`;
    if(!L.length){el.className='panel';el.innerHTML=`<div class="empty"><div class="ico">⌀</div><h3>没有符合条件的素材</h3><p>当前筛选组合下没有入库素材。可以删掉部分条件，或查看全部今日新增。</p><div class="acts"><button class="btn pri" id="clearEmpty">清空筛选</button><button class="btn" data-quick="todayOnly">查看全部今日新增</button></div></div>`;pg.innerHTML='';return}
    const show=L.slice(0,state.limit);
    if(state.view==='table'){
      el.className='panel';el.style.overflow='auto';
      el.innerHTML=`<table class="tbl"><thead><tr><th>素材</th><th>游戏</th><th>媒体</th><th class="num">点赞</th><th class="num">播放</th><th class="num">计划数</th><th class="num">使用天数</th><th>入库日期</th><th>去重</th></tr></thead><tbody>${show.map(m=>`<tr data-id="${m.id}" style="cursor:pointer${state.open===m.id?';background:#EFF4FF':''}"><td><div class="gname"><span class="gicon" style="background:linear-gradient(160deg,${m.color},hsl(${m.hue} 70% 55%));width:48px;height:30px"></span>${esc(m.title)}</div></td><td>${esc(m.game)}</td><td>${mediaEl(m)}</td><td class="num">${fmt(m.likes)}</td><td class="num">${fmt(m.plays)}</td><td class="num">${m.plans}</td><td class="num">${m.days}</td><td>${m.date}</td><td>${dTag(m.dedupe)}</td></tr>`).join('')}</tbody></table>`;
    }else{el.className=state.view;el.style.overflow='';el.innerHTML=show.map(card).join('')}
    pg.innerHTML=L.length>state.limit?`<button class="btn" id="loadMore">加载更多（剩余 ${L.length-state.limit} 条）</button>`:`<span class="note">已显示全部 ${L.length} 条</span>`;
  }
  function renderStat(){
    const scope=materials.filter(m=>match(m,'scope')&&m.today);
    const dup=scope.filter(m=>m.dedupe!=='唯一').length;
    document.getElementById('stat').innerHTML=`今日新增 <b>${scope.length}</b> 条，已去重 <b>${dup}</b> 条`;
    document.querySelectorAll('#views button').forEach(b=>b.classList.toggle('on',b.dataset.v===state.view));
  }
  function renderDrawer(){
    const d=document.getElementById('drawer'),w=document.getElementById('wrap');
    const m=materials.find(x=>x.id===state.open);
    if(!m){d.classList.remove('open');w.classList.remove('with-drawer');return}
    d.classList.add('open');w.classList.add('with-drawer');
    const sims=m.similar.map(s=>{const o=materials.find(x=>x.id===s.id);return `<div class="sim" data-id="${o.id}"><span class="sw" style="background:linear-gradient(160deg,${o.color},hsl(${o.hue} 70% 55%))"></span><div><b style="font-size:13px">${esc(o.title)}</b><small>${s.by}命中 ${s.hit}% · ${o.adxId}</small></div></div>`}).join('');
    document.getElementById('drawerBd').innerHTML=`
      <div class="thumb" style="aspect-ratio:16/9;border-radius:8px;background:linear-gradient(160deg,${m.color},hsl(${m.hue} 70% 55%))"><span class="play" style="width:52px;height:52px;font-size:18px">▶</span><span class="dur">00:${String(m.dur).padStart(2,'0')}</span><span class="lbl">预览占位 · 不加载真实视频</span></div>
      <div class="sec"><h4 style="font-size:15px">${esc(m.title)}</h4>
        <div class="row" style="display:flex;gap:10px;align-items:center;color:var(--sub);font-size:12px;flex-wrap:wrap">${mediaEl(m)}<span>${esc(m.game)}</span><span>${m.type}</span><span>入库 ${m.date}</span>${dTag(m.dedupe)}</div></div>
      <div class="sec"><h4>核心指标</h4><div class="kv"><div><span>点赞</span><b>${fmt(m.likes)}</b></div><div><span>播放</span><b>${fmt(m.plays)}</b></div><div><span>计划数</span><b>${m.plans}</b></div><div><span>使用天数</span><b>${m.days} 天</b></div></div>
        <div class="note">口径：ADX 平台累计值，取数日期 ${TODAY}（演示假数据）。点赞/播放为曝光侧数据，不等于投放效果。</div></div>
      <div class="sec"><h4>文案 / 脚本 <button class="link" id="toggleCopy" style="font-size:12px">展开全部</button></h4><p class="copy clamp" id="copy">${esc(m.copy)}</p></div>
      <div class="sec"><h4>标签 <button class="link" data-op="打标签" style="font-size:12px">+ 添加</button></h4><div class="tags">${m.tags.map(t=>`<span class="tag">${esc(t)}</span>`).join('')}</div></div>
      <div class="sec"><h4>ADX ID</h4><div style="display:flex;gap:8px;align-items:center"><span class="mono">${m.adxId}</span><button class="btn sm" id="copyId">复制</button></div><div class="note">素材链接：演示环境不提供真实 URL</div></div>
      <div class="sec"><h4>相似素材 <span class="note" style="margin:0">帧哈希 / 音频指纹</span></h4>
        ${m.similar.length?`<div style="font-size:13px">帧哈希命中 <b style="color:var(--warn)">${m.similar.length}</b> 条，${m.dedupe==='已合并'?'已合并为同一素材。':'疑似同一视频，请人工确认。'}</div>${sims}`:'<div style="font-size:13px">帧哈希命中 <b style="color:var(--ok)">0</b> 条，当前素材为唯一内容。</div>'}
        <button class="btn sm" style="margin-top:8px" data-quick="sameGame" data-g="${m.gameId}">同游戏更多素材 →</button></div>`;
  }
  function render(keepLimit){
    if(!keepLimit)state.limit=20;
    renderFacets();renderChips();renderStat();
    const el=document.getElementById('result');el.classList.add('loading');
    renderResult();requestAnimationFrame(()=>setTimeout(()=>el.classList.remove('loading'),100));
    renderDrawer();syncURL();
  }
  function clearAll(){F.forEach(f=>state.sel[f.key].clear());state.q='';document.getElementById('q').value='';render()}
  function openItem(id){state.open=id;renderDrawer();document.querySelectorAll('[data-id].card,tr[data-id]').forEach(n=>{n.classList.toggle('sel',n.dataset.id===id);if(n.tagName==='TR')n.style.background=n.dataset.id===id?'#EFF4FF':''});syncURL()}

  document.addEventListener('change',e=>{const k=e.target.dataset.k;if(!k)return;const S=state.sel[k];e.target.checked?S.add(e.target.value):S.delete(e.target.value);render()});
  document.addEventListener('click',e=>{
    const t=e.target.closest('button,[data-tog],.card,tr[data-id],.sim');if(!t)return;
    if(t.dataset.tog){closed[t.dataset.tog]=!closed[t.dataset.tog];renderFacets();return}
    if(t.dataset.more){expanded[t.dataset.more]=!expanded[t.dataset.more];renderFacets();return}
    if(t.dataset.rm){state.sel[t.dataset.rm].delete(t.dataset.v);render();return}
    if(t.dataset.rmq){state.q='';document.getElementById('q').value='';render();return}
    if(['clearChips','resetAll','clearEmpty'].includes(t.id)){clearAll();return}
    if(t.dataset.quick==='today'){state.sel.scope.clear();state.sel.scope.add('今日新增');render();return}
    if(t.dataset.quick==='todayOnly'){F.forEach(f=>state.sel[f.key].clear());state.q='';document.getElementById('q').value='';state.sel.scope.add('今日新增');render();return}
    if(t.dataset.quick==='sameGame'){F.forEach(f=>state.sel[f.key].clear());state.sel.game.add(t.dataset.g);render();return}
    if(t.dataset.v&&t.closest('#views')){state.view=t.dataset.v;render(true);return}
    if(t.id==='loadMore'){state.limit+=20;renderResult();return}
    if(t.id==='closeDrawer'){openItem(null);return}
    if(t.id==='toggleCopy'){const c=document.getElementById('copy');c.classList.toggle('clamp');t.textContent=c.classList.contains('clamp')?'展开全部':'收起';return}
    if(t.id==='copyId'){const m=materials.find(x=>x.id===state.open);navigator.clipboard&&navigator.clipboard.writeText(m.adxId).catch(()=>{});toast('已复制 '+m.adxId);return}
    if(t.dataset.op){const m=materials.find(x=>x.id===state.open);toast(`「${m.title}」${t.dataset.op}（演示，仅本地）`);return}
    if(t.dataset.id){openItem(t.dataset.id)}
  });
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&state.open)openItem(null)});
  let qt;document.getElementById('q').addEventListener('input',e=>{clearTimeout(qt);qt=setTimeout(()=>{state.q=e.target.value.trim();render()},200)});
  document.getElementById('sort').addEventListener('change',e=>{state.sort=e.target.value;render()});
  render();
})();
