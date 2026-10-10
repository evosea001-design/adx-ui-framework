/* 假数据：仅用于交互框架演示，不调用任何 ADX MCP */
window.ADX = (function(){
  const games = [
    {id:'g01',name:'我的花园世界',group:'重点',ptype:'长期热门',theme:'田园',gameplay:'模拟经营',art:'卡通',platforms:['抖音','微信'],ranks:['买量总榜','轻度'],trend:[32,35,41,38,46,52,58],likes:1286000,plays:42300000,news:'近7天新增素材 +38%，主打花园装扮',color:'#22C55E'},
    {id:'g02',name:'时尚百货城',group:'重点',ptype:'素材量突增',theme:'都市',gameplay:'模拟经营',art:'卡通',platforms:['抖音'],ranks:['买量总榜','轻度','新品'],trend:[12,14,13,22,35,48,61],likes:842000,plays:30100000,news:'素材量单周翻倍，新增换装剧情向',color:'#EC4899'},
    {id:'g03',name:'三国：冰河时代',group:'重点',ptype:'长期热门',theme:'三国',gameplay:'SLG',art:'写实',platforms:['抖音','微信'],ranks:['买量总榜','重度'],trend:[60,58,62,59,61,57,55],likes:1532000,plays:56800000,news:'投放稳定，真人口播占比上升',color:'#0EA5E9'},
    {id:'g04',name:'灵画师',group:'重点',ptype:'新项目',theme:'仙侠',gameplay:'卡牌',art:'国风',platforms:['抖音'],ranks:['新品','预约'],trend:[0,2,4,9,15,22,30],likes:356000,plays:9800000,news:'10/08 开启预约，首批素材上线',color:'#A855F7'},
    {id:'g05',name:'无尽冬日',group:'重点',ptype:'长期热门',theme:'末日',gameplay:'SLG',art:'写实',platforms:['抖音','微信'],ranks:['买量总榜','重度'],trend:[70,72,69,74,71,76,78],likes:2104000,plays:81200000,news:'头部素材持续跑量，冰雪生存题材',color:'#38BDF8'},
    {id:'g06',name:'疯狂水世界',group:'重点',ptype:'素材量突增',theme:'休闲',gameplay:'消除',art:'卡通',platforms:['微信'],ranks:['轻度','买量总榜'],trend:[8,9,15,18,27,33,40],likes:618000,plays:21500000,news:'微信小游戏榜升至前 20',color:'#06B6D4'},
    {id:'g07',name:'奔奔王国',group:'重点',ptype:'新项目',theme:'魔幻',gameplay:'塔防',art:'卡通',platforms:['抖音','微信'],ranks:['新品','轻度'],trend:[0,0,3,6,8,14,19],likes:221000,plays:6400000,news:'新品期，素材以玩法演示为主',color:'#F59E0B'},
    {id:'g08',name:'永远的蔚蓝星球',group:'头部',ptype:'长期热门',theme:'科幻',gameplay:'SLG',art:'写实',platforms:['抖音','微信'],ranks:['买量总榜','重度'],trend:[88,85,90,87,92,89,91],likes:2876000,plays:98400000,news:'头部常驻，CG 混剪素材占比高',color:'#2563EB'},
    {id:'g09',name:'造化仙府',group:'头部',ptype:'长期热门',theme:'仙侠',gameplay:'放置',art:'国风',platforms:['抖音'],ranks:['买量总榜','重度'],trend:[66,64,63,60,62,58,57],likes:1678000,plays:63500000,news:'投放略降，素材转向剧情短片',color:'#14B8A6'},
    {id:'g10',name:'下方了',group:'竞品',ptype:'对标竞品',theme:'休闲',gameplay:'消除',art:'卡通',platforms:['微信'],ranks:['轻度'],trend:[20,24,22,26,25,28,27],likes:402000,plays:14200000,news:'与「疯狂水世界」素材风格接近',color:'#F97316'},
    {id:'g11',name:'无限轮回',group:'竞品',ptype:'对标竞品',theme:'魔幻',gameplay:'Roguelike',art:'像素',platforms:['抖音'],ranks:['买量总榜','重度','新品'],trend:[10,18,25,31,36,42,47],likes:735000,plays:25900000,news:'新增 3 个肉鸽爽点类素材方向',color:'#6366F1'},
    {id:'g12',name:'荒无之下',group:'竞品',ptype:'对标竞品',theme:'末日',gameplay:'SLG',art:'写实',platforms:['抖音','微信'],ranks:['重度','预约'],trend:[5,7,9,12,11,16,18],likes:289000,plays:8700000,news:'对标「无尽冬日」，预约期素材',color:'#64748B'}
  ];
  const facets = [
    {key:'group',label:'监测分组',values:['重点','头部','竞品']},
    {key:'ptype',label:'项目类型',values:['长期热门','素材量突增','新项目','对标竞品']},
    {key:'theme',label:'题材',values:['田园','都市','三国','仙侠','末日','休闲','魔幻','科幻']},
    {key:'gameplay',label:'玩法',values:['模拟经营','SLG','卡牌','消除','塔防','放置','Roguelike']},
    {key:'art',label:'画风',values:['卡通','写实','国风','像素']},
    {key:'platforms',label:'平台',values:['抖音','微信']},
    {key:'ranks',label:'榜单类型',values:['买量总榜','轻度','重度','新品','预约']}
  ];
  const TODAY='2026-10-10';
  const medias={'抖音':'#111827','微信':'#16A34A','快手':'#F97316','穿山甲':'#2563EB'};
  const titlesBy={
    g01:['梦幻花园漂浮岛','花开魔法小镇','夜之花园秘境','精灵花海小径'],
    g02:['百货城开业大促','换装逆袭记','一秒变富婆'],
    g03:['冰河下的赤壁','主公快来守城','真人口播：冰封三国'],
    g04:['执笔画仙途','国风画卷开局'],
    g05:['暴风雪来临前','最后的火炉','冰原求生 60 秒'],
    g06:['水上乐园大爆炸','三消冲浪'],
    g07:['奔奔建国记','小兵塔防挑战'],
    g08:['蔚蓝星球 CG 混剪','舰队出征'],
    g09:['仙府日常剧情','挂机也能成仙'],
    g10:['下方了！消除爽到底'],
    g11:['第 99 次轮回','肉鸽爽点合集'],
    g12:['荒原之下的避难所']
  };
  const tagsPool=['剧情','玩法演示','真人口播','CG混剪','爽点','福利','对比','UGC风','开局','换装'];
  const mediaKeys=Object.keys(medias);
  // 伪随机，保证每次一致
  let s=7;const rnd=()=>{s=(s*9301+49297)%233280;return s/233280};
  const materials=[];let n=1;
  games.forEach((g,gi)=>{
    titlesBy[g.id].forEach((t,ti)=>{
      const today = (n%5!==0 && n%3!==1) || g.id==='g01';
      const dd = today?TODAY:('2026-10-0'+(1+Math.floor(rnd()*9)));
      const dupRoll=rnd();
      const dedupe = dupRoll<0.26?'疑似重复':(dupRoll<0.34?'已合并':'唯一');
      const media = g.platforms.includes('微信')&&rnd()<0.4?'微信':mediaKeys[Math.floor(rnd()*mediaKeys.length)];
      const likes=Math.round((g.likes/40)*(0.3+rnd()*1.4));
      const plays=Math.round((g.plays/40)*(0.3+rnd()*1.4));
      materials.push({
        id:'m'+String(n).padStart(3,'0'),adxId:'ADX-VID-202610'+String(10-(today?0:1)).padStart(2,'0')+'-'+String(100000+n*137).slice(-6),
        gameId:g.id,game:g.name,title:t,media,type:rnd()<0.85?'视频':'图片',
        dur:Math.round(12+rnd()*48),likes,plays,plans:Math.round(5+rnd()*120),days:today?Math.round(rnd()*2):Math.round(1+rnd()*30),
        date:dd,today,dedupe,
        ratio:[0.56,0.75,1,1.33,1.78][Math.floor(rnd()*5)],
        color:g.color,hue:Math.floor(rnd()*360),
        copy:`【${g.name}】${t}。${['三秒入戏，开局即高能！','现在下载，领取新手大礼包。','这才是真正的'+g.theme+'题材，你敢来挑战吗？','跟着节奏点一点，轻松上手。'][Math.floor(rnd()*4)]}${['画面以'+g.art+'风格呈现，配合'+g.gameplay+'核心玩法演示。','结尾强引导下载，CTA 出现在第 '+Math.round(3+rnd()*10)+' 秒。'][Math.floor(rnd()*2)]}`,
        tags:[g.name,g.theme,g.gameplay,tagsPool[Math.floor(rnd()*tagsPool.length)],tagsPool[Math.floor(rnd()*tagsPool.length)]].filter((v,i,a)=>a.indexOf(v)===i)
      });n++;
    });
  });
  // 相似素材：同游戏内的其它素材，疑似重复给出帧哈希命中
  materials.forEach(m=>{
    const peers=materials.filter(x=>x.gameId===m.gameId&&x.id!==m.id);
    m.similar=m.dedupe==='唯一'?[]:peers.slice(0,2).map((p,i)=>({id:p.id,hit:m.dedupe==='已合并'?100:(92-i*7),by:i===0?'帧哈希':'音频指纹'}));
  });
  return {games,facets,materials,medias,TODAY};
})();
window.fmt=n=>n>=1e8?(n/1e8).toFixed(1)+'亿':n>=1e4?(n/1e4).toFixed(n>=1e5?0:1)+'万':String(n);
window.toast=(msg)=>{let t=document.querySelector('.toast');if(!t){t=document.createElement('div');t.className='toast';document.body.appendChild(t)}t.textContent=msg;t.classList.add('show');clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove('show'),1800)};
window.esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
