# 如果麦田还记得你

一个为移动端打造的、单页沉浸式故事纪念网站。它以中文叙事为主，讲述安娜、艾利克斯、稻草人与白色渡鸦的故事。

## 本地运行

```bash
npm install
npm run dev
```

访问 `http://localhost:3000`。发布前依次执行：

```bash
npm run typecheck
npm run lint
npm run build
```

## 内容与素材

- 纪念日期、地点、角色名、文案与所有图片路径集中在 `app/data/story.ts`。
- 章节用独立的 `Scene`、`Chapter`、`Treasures`、`Seasons`、`Paris` 与纪念卡组件表达；主页面仍保持连续滚动叙事。
- `public/images/` 包含为本项目生成的原创水彩／印象派 WebP 正式场景素材；封面、初见、宝物、四季、火光、巴黎与星星归处保持统一角色和色彩语言。所有实际使用路径集中在 `app/data/story.ts`。
- 音乐默认关闭，当前统一播放 `public/audio/background.mp3` 中的已授权音频。

## Starlight Trail

- `components/effects/StarlightCursor.tsx`：仅对 `hover: hover` 且 `pointer: fine` 的桌面指针启用 SVG 四角星光标，使用 `requestAnimationFrame` 跟随并在离开窗口时隐藏。
- `components/effects/StarlightParticles.tsx`：手机轻触星光绽放、低频滑动轨迹、桌面短轨迹与点击绽放，限制同时在场粒子为 28 个，动画结束立即清理。
- 燃烧麦田自动降低粒子数；巴黎偏暖白、偶发小流星；星星归处的粒子向上浮动。系统减少动态效果偏好会关闭持续粒子和自定义指针。

## GitHub Pages 部署

推送到 `main` 后，`.github/workflows/deploy-pages.yml` 会自动运行检查、生成静态站点并发布到：

`https://yzl199706-ui.github.io/stealing-all-the-stars-of-paris-site/`

GitHub Actions 构建时会自动启用 Next.js 静态导出与仓库子路径；本地开发仍使用根路径，不需要额外环境变量。

不需要环境变量、账号系统或数据库；页面不收集访问者信息。
