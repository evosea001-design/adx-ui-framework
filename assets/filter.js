(function(){
  const {games,facets}=ADX;
  const LS='adx_watchlist';
  const state={sel:{},q:'',sort:'likes'};
  facets.forEach(f=>state.sel[f.key]=new Set());
  let watch=new Set(JSON.parse(localStorage.getItem(LS)||'null')||games.filter(g=>g.group!=='竞品').map(g=>g.id));
  const open={};facets.forEach((f,i)=>open[f.key]=true);
  const expanded={};

  // URL -> state
  const p=new URLSearchParams(location.search);
  facets.forEach(f=>{const v=p.get(f.key);if(v)v.split(',').forEach(x=>state.sel[f.key].add(x))});
  state.q=p.get('q')||'';state.sort=p.get('sort')||'likes';
  document.getElementById('q').value=state.q;document.getElementById('sort').value=state.sort;

  const val=(g,k)=>Array.isArray(g[k])?g[k]:[g[k]];
  function match(g,skip){
    if(state.q){const s=state.q.toLowerCase();if(![g.name,g.theme,g.gameplay,g.art,g.ptype].join(' ').toLowerCase().includes(s))return false}
    return facets.every(f=>{if(f.key===skip)return true;const S=state.sel[f.key];if(!S.size)return true;return val(g,f.key).some(v=>S.has(v))});
  }
  const results=()=>games.filter(g=>match(g)).sort((a,b)=>{
    if(state.sort==='name')return a.name.localeCompare(b.name,'zh');
    if(state.sort==='trend')return growth(b)-growth(a);
    return b[state.sort]-a[state.sort];
  });
  const growth=g=>{const t=g.trend;return t[0]?(t[t.length-1]-t[0])/t[0]*100:999};

  function syncURL(){
    const q=new URLSearchParams();
    facets.forEach(f=>{if(state.sel[f.key].size)q.set(f.key,[...state.sel[f.key]].join(','))});
    if(state.q)q.set('q',state.q);if(state.sort!=='likes')q.set('sort',state.sort);
    history.replaceState(null,'','?'+q.toString());
  }

  function renderFacets(){
    const el=document.getElementById('facets');
    el.innerHTML=facets.map(f=>{
      const counts={};f.values.forEach(v=>counts[v]=games.filter(g=>match(g,f.key)&&val(g,f.key).includes(v)).length);
      const limit=expanded[f.key]?99:6;
      const opts=f.values.filter((v,i)=>i<limit||state.sel[f.key].has(v)).map(v=>{
        const on=state.sel[f.key].has(v),dis=!on&&counts[v]===0;
        return `<label class="opt${dis?' dis':''}" title="${dis?'当前条件下无结果':''}"><input type="checkbox" data-k="${f.key}" value="${esc(v)}" ${on?'checked':''} ${dis?'disabled':''}>${esc(v)}<span class="n">${counts[v]}</span></label>`}).join('');
      const more=f.values.length>6?`<button class="more" data-more="${f.key}">${expanded[f.key]?'收起':'展开全部（'+f.values.length+'）'}</button>`:'';
      const n=state.sel[f.key].size;
      return `<div class="facet${open[f.key]?'':' closed'}"><div class="facet-hd" data-tog="${f.key}"><span>${f.label}${n?` <span style="color:var(--pri)">· ${n}</span>`:''}</span><span class="arw">▾</span></div><div class="facet-bd">${opts}${more}</div></div>`}).join('');
  }
  function renderChips(){
    const el=document.getElementById('chips');const chips=[];
    facets.forEach(f=>state.sel[f.key].forEach(v=>chips.push(`<span class="chip">${f.label}：${esc(v)}<button data-rm="${f.key}" data-v="${esc(v)}" aria-label="移除">×</button></span>`)));
    if(state.q)chips.push(`<span class="chip">关键词：${esc(state.q)}<button data-rmq="1">×</button></span>`);
    el.innerHTML=(chips.length?chips.join(''):'<span class="hint">已选条件会显示在这里，可单独删除</span>')+(chips.length?'<button class="btn ghost sm clear" id="clearChips">清空筛选</button>':'');
  }
  function spark(t,c){
    const w=96,h=28,max=Math.max(...t,1),min=Math.min(...t);
    const pts=t.map((v,i)=>`${(i/(t.length-1)*w).toFixed(1)},${(h-3-(v-min)/((max-min)||1)*(h-6)).toFixed(1)}`).join(' ');
    return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><polyline fill="none" stroke="${c}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" points="${pts}"/></svg>`;
  }
  function renderTable(list){
    const el=document.getElementById('result');
    if(!list.length){el.innerHTML=`<div class="empty"><div class="ico">⌀</div><h3>没有符合条件的游戏</h3><p>当前组合过于严格，试试删掉几个条件或换个关键词。</p><div class="acts"><button class="btn pri" data-act="clear">清空筛选</button><button class="btn" data-act="undo">撤销上一个条件</button></div></div>`;return}
    el.innerHTML=`<table class="tbl"><thead><tr><th>游戏名</th><th>分组</th><th>题材 / 玩法</th><th>近期趋势</th><th class="num sortable" data-s="likes">点赞前100${state.sort==='likes'?' ↓':''}</th><th class="num sortable" data-s="plays">播放前100${state.sort==='plays'?' ↓':''}</th><th>近期动态</th><th>操作</th></tr></thead><tbody>${list.map(g=>{
      const gr=growth(g),up=gr>=0;
      return `<tr><td><div class="gname"><span class="gicon" style="background:linear-gradient(135deg,${g.color},#fff0 140%)"></span><div>${esc(g.name)}<small>${g.ptype} · ${g.platforms.join('/')}</small></div></div></td>
      <td><span class="tag g-${g.group}">${g.group}</span></td>
      <td><span class="tag">${g.theme}</span> <span class="tag">${g.gameplay}</span></td>
      <td><div style="display:flex;align-items:center;gap:8px">${spark(g.trend,up?'#16A34A':'#DC2626')}<span class="${up?'up':'down'}" style="font-size:12px">${gr===999?'新':(up?'+':'')+gr.toFixed(0)+'%'}</span></div></td>
      <td class="num">${fmt(g.likes)}</td><td class="num">${fmt(g.plays)}</td>
      <td class="news">${esc(g.news)}</td>
      <td><div class="ops"><a class="btn sm" href="library.html?game=${g.id}">查看素材</a><button class="btn sm${watch.has(g.id)?' listed':''}" data-watch="${g.id}">${watch.has(g.id)?'✓ 已在名单':'+ 加入名单'}</button></div></td></tr>`}).join('')}</tbody></table>`;
  }
  let history_=[];
  function render(){
    const list=results();
    renderFacets();renderChips();
    const el=document.getElementById('result');el.classList.add('loading');
    setTimeout(()=>{renderTable(list);el.classList.remove('loading')},120); // 模拟异步：结果区变暗，筛选区不动
    document.getElementById('count').innerHTML=`共 <b>${list.length}</b> 款游戏`;
    const b=document.getElementById('viewBtn');b.textContent=`查看 ${list.length} 条`;b.disabled=!list.length;
    document.getElementById('listCount').textContent=watch.size;
    syncURL();
  }
  function clearAll(){facets.forEach(f=>state.sel[f.key].clear());state.q='';document.getElementById('q').value='';history_=[];render()}

  document.addEventListener('change',e=>{const k=e.target.dataset.k;if(!k)return;
    const S=state.sel[k];if(e.target.checked){S.add(e.target.value);history_.push([k,e.target.value])}else S.delete(e.target.value);render()});
  document.addEventListener('click',e=>{const t=e.target.closest('button,[data-tog],th');if(!t)return;
    if(t.dataset.tog){open[t.dataset.tog]=!open[t.dataset.tog];renderFacets();return}
    if(t.dataset.more){expanded[t.dataset.more]=!expanded[t.dataset.more];renderFacets();return}
    if(t.dataset.rm){state.sel[t.dataset.rm].delete(t.dataset.v);render();return}
    if(t.dataset.rmq){state.q='';document.getElementById('q').value='';render();return}
    if(t.id==='clearChips'||t.id==='resetAll'||t.dataset.act==='clear'){clearAll();return}
    if(t.dataset.act==='undo'){const last=history_.pop();if(last)state.sel[last[0]].delete(last[1]);else clearAll();render();return}
    if(t.dataset.s){state.sort=t.dataset.s;document.getElementById('sort').value=state.sort;render();return}
    if(t.dataset.watch){const id=t.dataset.watch,g=games.find(x=>x.id===id);
      if(watch.has(id)){watch.delete(id);toast(`已将「${g.name}」移出检测名单`)}else{watch.add(id);toast(`已将「${g.name}」加入检测名单`)}
      localStorage.setItem(LS,JSON.stringify([...watch]));render();return}
    if(t.id==='viewBtn'){const ids=results().map(g=>g.id);location.href='library.html?game='+ids.join(',')+'&from=filter';return}
  });
  let qt;document.getElementById('q').addEventListener('input',e=>{clearTimeout(qt);qt=setTimeout(()=>{state.q=e.target.value.trim();render()},200)});
  document.getElementById('sort').addEventListener('change',e=>{state.sort=e.target.value;render()});
  document.getElementById('range').addEventListener('change',e=>toast('时间窗已切换为'+e.target.value+'（演示数据不变）'));
  render();
})();
