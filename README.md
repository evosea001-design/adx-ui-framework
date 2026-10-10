# ADX 检索库 · 静态交互框架（假数据，不调用 ADX MCP）
预览：cd /workspace/adx-ui-framework && python3 -m http.server 8765 → http://localhost:8765/index.html
也可直接双击 index.html 打开（纯静态，无外部依赖）。
- index.html      游戏筛选页（分面筛选 / chip / 查看 N 条 / 表格+迷你趋势图 / 加入名单）
- library.html    库内容页（瀑布流默认，可切网格/表格；侧面板详情；URL 带 game 参数自动过滤）
- assets/data.js  12 款检测名单 + 27 条素材假数据
- assets/filter.js / library.js / style.css
URL 参数：index.html?group=重点&theme=…&q=…&sort=…；library.html?game=g01,g05&media=抖音&scope=今日新增&view=grid|table&id=m003
