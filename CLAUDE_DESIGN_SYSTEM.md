# Claude 暖纸手帐设计规范与配色系统指南 (Warm Parchment Design System)

> 本文档基于当前应用提炼，专为打造具有 **Claude / Anthropic 风格**、温润护眼、具书卷气质的桌面及 Web 应用而设计。

---

## 一、设计理念与美学哲学

1. **天然纸张质感（Warm Paper & Parchment）**
   - 彻底告别冷白（`#FFFFFF`）高对比度科技风与生硬刺眼的纯黑黑夜模式。
   - 以天然、未漂白的温暖纸张色（`#FAF7F2`）为全屏大画布基底，模拟复古高级纸张、精致手帐与经典出版物的触感。
2. **低刺激、高耐看的阅读体验**
   - 文字避免使用纯黑（`#000000`），选用带暖调的**深炭棕黑（`#38332B`）**，如同油墨沉淀在纸张上，长时间注视不易疲劳。
3. **点睛克制（Signature Accent）**
   - 沿用 Anthropic / Claude 标志性的**陶土橙 / 黏土红（Clay / Terracotta `#C97B63` / `#D97757`）**作为主交互焦点。
   - 搭配低饱和度的大地色相（鼠尾草绿、暖琥珀金、雾霾蓝、肉桂棕等），形成优雅统一的莫兰迪自然色系。
4. **轻量物理感（Micro Materiality）**
   - 摒弃大面积高扩散黑色投影，依靠 **极细米灰边框（`#E8DFD1`）**、**纯白卡片在纸张底色上的轻微色差**、以及微阴影（`shadow-2xs`）构筑温润自然的物理层级。

---

## 二、核心色彩规范速查

### 1. 基底与表面（Surfaces & Layers）

| 角色 | 色号 (HEX) | RGB / Tailwind | 说明与典型用途 |
| :--- | :--- | :--- | :--- |
| **画布主底色 (Canvas)** | `#FAF7F2` | `rgb(250, 247, 242)` | 全屏背景、App 视窗外层大底色。 |
| **次级基底 (Cream)** | `#F3EBDD` | `rgb(243, 235, 221)` | 工具栏底槽、分段选择器槽、输入框外壳。 |
| **卡片/内容面 (Surface)** | `#FFFFFF` | `rgb(255, 255, 255)` | 浮于纸张背景上的内容卡片、弹窗面板、下拉菜单。 |
| **高亮/活动卡片 (Highlight)** | `#FAF0ED` / `#FDFBF7`| 混入微量陶土暖色 | 当前聚焦项、今日看板列高亮底色。 |

### 2. 边框与分割线（Borders & Dividers）

| 角色 | 色号 (HEX) | 说明与典型用途 |
| :--- | :--- | :--- |
| **主边框 (Primary Border)** | `#E8DFD1` | 卡片外轮廓、模态框边线、导航栏底部分割线。 |
| **次级内分割线 (Divider)** | `#F0E9DF` | 卡片头部（Header）与正文之间的轻柔分割线。 |
| **微弱轮廓线 (Hairline)** | `#E8DFD1`/50 ~ 70% | 嵌套子组件、微弱边框。 |
| **陶土激活边框 (Active)** | `#F0D5CD` / `#C97B63` | 选中状态、获得焦点的输入框外框。 |

### 3. 字体与文字层级（Typography Hierarchy）

| 角色 | 色号 (HEX) | 说明与设计建议 |
| :--- | :--- | :--- |
| **主要文字 (Primary)** | `#38332B` | 页面大标题、卡片正文、核心数值。有铅字感，非死黑。 |
| **次要文字 (Secondary)** | `#58544E` ~ `#847D72` | 副标题、表单 Label、辅助文字、次级按钮。 |
| **弱化/元数据 (Muted)** | `#A4A09A` | 日期、时间区间、数据条数、计数器、图标默认色。 |
| **占位符/空状态 (Faint)** | `#C4B8A5` | 输入框 Placeholder、“暂无数据”空提示。 |

### 4. 品牌核心点睛色（Signature Clay）

| 角色 | 色号 (HEX) | 说明与典型用途 |
| :--- | :--- | :--- |
| **陶土主色 (Clay)** | `#C97B63` / `#D97757` | 主 CTA 按钮、激活高亮、核心数据、图表折线峰值。 |
| **陶土悬停 (Clay Hover)** | `#B66B54` / `#A45842` | 按钮 Hover 态、深色强调、警示强调文字。 |
| **浅陶土底色 (Clay Light)** | `#FAF0ED` | 标签背景、提醒卡片背景、高亮按钮背景。 |
| **浅陶土边框 (Clay Border)**| `#F0D5CD` | 配套浅陶土底色的边框。 |

---

## 三、大地系语义与标签色彩（莫兰迪自然三件套）

所有标签、情绪和状态色彩均采用统一规范：`主色 (Color) + 浅底 (BgColor) + 强调文字 (TextColor)`，保证无论是胶囊、药丸徽章还是状态条，色彩明度一致且不刺眼。

```
┌────────────────────────────────────────────────────────┐
│  [主色 Color]       作为圆点、进度条、图标、粗边框       │
│  [浅底 BgColor]     作为胶囊 Badge 背景、浅色色块底色     │
│  [强调深字 Text]    作为胶囊内部文字，保证高可读性与协调感  │
└────────────────────────────────────────────────────────┘
```

| 语义分类 | 主色 (Color) | 浅底 (BgColor) | 强调文字 (TextColor) | 推荐场景 |
| :--- | :--- | :--- | :--- | :--- |
| **陶土橙 (Clay)** | `#C97B63` | `#FAF0ED` | `#A45842` | 工作、关键目标、高优先级、忙碌 |
| **鼠尾草绿 (Sage)** | `#9EAD90` | `#F2F5F0` | `#526046` | 学习、健康生长、已完成、活力 |
| **暖琥珀金 (Gold)** | `#D6B16C` | `#FAF5EB` | `#8C6C26` | 健身、灵感闪光、愉悦、早间时段 |
| **雾霾蓝 (Slate Blue)** | `#889BA8` | `#F0F4F7` | `#435866` | 平静、阅读沉淀、专业、专注 |
| **复古肉桂 (Cinnamon)** | `#B58872` | `#F8F2EF` | `#7E533F` | 休息生活、日常反思、家庭 |
| **干枯玫瑰 (Rose)** | `#C28490` | `#FBF0F2` | `#824854` | 情感、社交、娱乐、纪念日 |
| **柔和橄榄 (Olive)** | `#B0A880` | `#F8F7EE` | `#635D38` | 财务理财、长周期规划 |
| **玄武暗灰 (Charcoal)** | `#777A80` | `#F1F2F3` | `#484B50` | 系统默认、晚间、未归档、归档 |

---

## 四、AI 与数据可视化专属色盘

在多模型比较、图表（折线图、堆叠柱状图、饼图）中，保持各平台辨识度的同时，微调饱和度使其自然融入纸质风格：

| 平台 / 模型 | 主色 (HEX) | 浅底色 (HEX) | 边框色 (HEX) | 文字色 (HEX) |
| :--- | :--- | :--- | :--- | :--- |
| **Claude** | `#D97757` | `#FAF0ED` | `#F0D5CD` | `#A45842` |
| **OpenAI / Codex** | `#7D99FF` | `#EEF2FF` | `#CBD6FC` | `#4358A8` |
| **Gemini** | `#4285F4` | `#EBF3FE` | `#C5DCFB` | `#2558B0` |
| **Copilot** | `#4DC7AD` | `#EAF8F4` | `#BEEBE0` | `#297D6B` |
| **DeepSeek** | `#4E6BF2` | `#EEF2FF` | `#CDD7FD` | `#334DB8` |

### 图表设计细节：
- **网格线（Grid Lines）**：使用 `#E8DFD1` 或 `#F0E9DF`，虚线 `strokeDasharray: "3 3"`，透明度 0.6~0.8。
- **坐标轴文字（Axis Labels）**：`#A4A09A`，字体使用 `font-mono`，字号 `10px` ~ `11px`。
- **Tooltip 提示浮层**：背景使用 `#FFFFFF` 配合 `#E8DFD1` 边框，阴影使用 `shadow-lg`，圆角 `rounded-xl`。

---

## 五、质感与微交互规范

### 1. 模态框与遮罩（Backdrop）
- ❌ **避免使用**：冰冷生硬的黑透遮罩 `rgba(0, 0, 0, 0.5)`。
- ✅ **推荐使用**：带暖咖啡底色的微模糊蒙层：
  ```css
  background-color: rgba(44, 39, 35, 0.35); /* #2C2723 with 35% opacity */
  backdrop-filter: blur(4px);
  ```

### 2. 阴影规范（Shadows）
整体依赖边框界定，阴影极轻极克制：
- **微卡片/轻按钮**：`shadow-2xs`（`0 1px 2px 0 rgba(0, 0, 0, 0.03)`）
- **悬浮卡片/轻浮层**：`shadow-xs`（`0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)`）
- **弹出菜单/抽屉**：`shadow-xl` / `shadow-2xl`，但始终伴随 `border border-[#E8DFD1]`。

### 3. 圆角系统（Border Radius）
- **大模态弹窗 / 侧边抽屉**：`rounded-2xl`（16px）
- **常规卡片 / 模块容器**：`rounded-xl`（12px）
- **按钮 / 输入框 / 下拉菜单项**：`rounded-lg`（8px）
- **状态徽章 / 胶囊 / 头像**：`rounded-full`

### 4. 纸质滚动条样式（Custom Scrollbars）
```css
::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #DDD3C3;
  border-radius: 9999px;
}

::-webkit-scrollbar-thumb:hover {
  background: #C4B8A5;
}
```

### 5. 字体栈（Typography Stack）
```css
font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Segoe UI", Roboto, sans-serif;
font-feature-settings: "cv02", "cv03", "cv04", "cv11"; /* 数字与标点特性优化 */
```

---

## 六、常用 UI 组件实战组装代码

### 1. 基础内容卡片（Card）
```tsx
<div className="bg-white rounded-xl border border-[#E8DFD1] shadow-2xs hover:shadow-xs transition-shadow overflow-hidden">
  {/* Header */}
  <div className="px-4 py-3 border-b border-[#F0E9DF] bg-[#FAF7F2]/60 flex items-center justify-between">
    <h3 className="text-sm font-semibold text-[#38332B]">卡片标题</h3>
    <span className="text-xs text-[#A4A09A] font-mono">12 条记录</span>
  </div>
  
  {/* Body */}
  <div className="p-4 space-y-2 text-xs text-[#38332B]">
    内容区域...
  </div>
</div>
```

### 2. 分段切换器（Segmented Control）
```tsx
<div className="flex items-center space-x-1 bg-[#F3EBDD]/70 p-1 rounded-xl border border-[#E8DFD1]">
  <button className="px-3 py-1 bg-white text-[#38332B] font-semibold text-xs rounded-lg shadow-2xs">
    已激活项
  </button>
  <button className="px-3 py-1 text-[#58544E] hover:text-[#38332B] hover:bg-white/60 text-xs rounded-lg transition-colors">
    次级选项
  </button>
</div>
```

### 3. 主操作与次级按钮（Buttons）
```tsx
{/* 主操作（陶土橙实心） */}
<button className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-[#C97B63] hover:bg-[#B66B54] text-white text-xs font-medium shadow-2xs transition-colors">
  <span>确定提交</span>
</button>

{/* 次级操作（浅米底边框） */}
<button className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#F3EBDD]/50 text-[#58544E] hover:text-[#38332B] text-xs font-medium border border-[#E8DFD1] shadow-2xs transition-colors">
  <span>取消</span>
</button>

{/* 点睛轻按钮（浅陶土底） */}
<button className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#FAF0ED] hover:bg-[#F5E5E0] text-[#A45842] text-xs font-medium border border-[#F0D5CD] transition-colors">
  <span>AI 提炼总结</span>
</button>
```

### 4. 标签胶囊（Badge）
```tsx
{/* 陶土橙胶囊 */}
<span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#FAF0ED] text-[#A45842] border border-[#F0D5CD]">
  工作项目
</span>

{/* 鼠尾草绿胶囊 */}
<span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F2F5F0] text-[#526046] border border-[#E1EAD8]">
  个人成长
</span>
```

---

## 七、可直接复用的工程配置文件

### 1. `tailwind.config.js`
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        claude: {
          // 基底与面板
          bg: '#FAF7F2',
          cream: '#F3EBDD',
          card: '#FFFFFF',
          
          // 边框系统
          border: '#E8DFD1',
          borderLight: '#F0E9DF',
          
          // 文字层级
          text: '#38332B',
          textSecondary: '#58544E',
          textMuted: '#847D72',
          textFaint: '#A4A09A',
          placeholder: '#C4B8A5',
          
          // 品牌主色 (Clay)
          clay: '#C97B63',
          clayLight: '#FAF0ED',
          clayDark: '#B66B54',
          clayDeep: '#A45842',
          clayBorder: '#F0D5CD',

          // 自然辅助色
          sage: '#9EAD90',
          sageLight: '#F2F5F0',
          sageDark: '#526046',

          gold: '#D6B16C',
          goldLight: '#FAF5EB',
          goldDark: '#8C6C26',

          slate: '#889BA8',
          slateLight: '#F0F4F7',
          slateDark: '#435866',

          cinnamon: '#B58872',
          cinnamonLight: '#F8F2EF',
          cinnamonDark: '#7E533F',

          rose: '#C28490',
          roseLight: '#FBF0F2',
          roseDark: '#824854',

          charcoal: '#777A80',
          charcoalLight: '#F1F2F3',
          charcoalDark: '#484B50',
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Text",
          "PingFang SC",
          "Hiragino Sans GB",
          "Microsoft YaHei",
          "sans-serif"
        ],
      },
      boxShadow: {
        '2xs': '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'xs': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
```

### 2. TypeScript 色彩常量库 (`src/constants/theme.ts`)
```typescript
export interface ColorToken {
  color: string;
  bgColor: string;
  textColor: string;
  borderColor?: string;
  label: string;
}

export const CLAUDE_THEME = {
  bg: '#FAF7F2',
  cream: '#F3EBDD',
  card: '#FFFFFF',
  border: '#E8DFD1',
  borderLight: '#F0E9DF',
  text: '#38332B',
  textSecondary: '#58544E',
  textMuted: '#847D72',
  textFaint: '#A4A09A',
  backdrop: 'rgba(44, 39, 35, 0.35)',
} as const;

export const NATURAL_PALETTES: Record<string, ColorToken> = {
  clay: {
    color: '#C97B63',
    bgColor: '#FAF0ED',
    textColor: '#A45842',
    borderColor: '#F0D5CD',
    label: '陶土橙',
  },
  sage: {
    color: '#9EAD90',
    bgColor: '#F2F5F0',
    textColor: '#526046',
    borderColor: '#E1EAD8',
    label: '鼠尾草绿',
  },
  gold: {
    color: '#D6B16C',
    bgColor: '#FAF5EB',
    textColor: '#8C6C26',
    borderColor: '#F0E5CE',
    label: '暖金',
  },
  slate: {
    color: '#889BA8',
    bgColor: '#F0F4F7',
    textColor: '#435866',
    borderColor: '#DCE4EB',
    label: '雾霾蓝',
  },
  cinnamon: {
    color: '#B58872',
    bgColor: '#F8F2EF',
    textColor: '#7E533F',
    borderColor: '#EFE2DC',
    label: '肉桂棕',
  },
  rose: {
    color: '#C28490',
    bgColor: '#FBF0F2',
    textColor: '#824854',
    borderColor: '#F5DBE0',
    label: '干枯玫瑰',
  },
  charcoal: {
    color: '#777A80',
    bgColor: '#F1F2F3',
    textColor: '#484B50',
    borderColor: '#E2E4E7',
    label: '暗灰',
  },
};
```
