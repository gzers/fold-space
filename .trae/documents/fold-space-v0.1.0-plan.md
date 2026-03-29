# 褶宇宙 Fold-Space v0.1.0 开发计划

## 一、摘要
本计划旨在基于提供的原型设计与需求文档，指导实现「褶宇宙 Fold-Space」v0.1.0 首版的核心闭环。优先开发 P0 级任务，包含引导页、主画布、摄像头与麦克风的权限管理及降级兜底、时空薄片的创建/拖拽/连接/删除恢复流程，并完成本地数据持久化。所有界面及代码遵循全中文规范。

## 二、当前状态分析
- **项目结构**：目前为 Vite + React + TypeScript 空白工程（根目录结构完备，忽略冗余的 `frontend` 文件夹）。
- **缺失基础设施**：尚未集成路由、状态管理、样式框架、本地存储库及手势识别核心库。

## 三、架构假设与技术决策
- **样式方案**：使用 **Tailwind CSS**，以快速还原设计稿中的毛玻璃材质、情绪色谱等视觉规范。
- **状态管理**：使用 **Zustand**，轻量且高性能，适合画布中多张卡片的高频位置和状态更新。
- **持久化方案**：采用 **Dexie.js** 封装 IndexedDB，符合《存储机制设计》要求，实现“本地优先”的存储闭环。
- **路由方案**：使用 `react-router-dom` 进行 `Landing` 与 `Main Canvas` 间的切换。
- **手势识别**：接入 `@mediapipe/tasks-vision` 作为核心，实现 P0 级手势（展开新建、捏合拖拽、长握拳删除），并严格遵循手势识别失败或权限被拒情况下的“鼠标/触控降级”要求。
- **空间渲染**：为满足首版性能与开发速度，主画布采用 DOM + CSS 3D Transform（2.5D）实现，确保低配设备下依旧流畅。

## 四、提议的代码变更与实施步骤

### 步骤 1：基础设施搭建与依赖安装
- **文件**：`package.json`、`tailwind.config.js`、`src/index.css`
- **动作**：
  - 安装依赖：`tailwindcss`, `zustand`, `react-router-dom`, `dexie`, `lucide-react`, `@mediapipe/tasks-vision`, `clsx`, `tailwind-merge`。
  - 配置 Tailwind，引入原型文档中定义的 CSS 变量（如 `--void-bg`, `--emotion-calm` 等）。
  - 清理默认 Vite 样式，搭建全局深空背景基座。

### 步骤 2：存储层开发（Dexie.js）
- **文件**：`src/db/index.ts`, `src/db/hooks.ts`
- **动作**：
  - 初始化 `FoldSpaceDB`，创建 `folds`（主卡片）、`trash`（废纸篓）、`settings`（用户配置）三张表。
  - 封装增删改查及废纸篓软删除（保留30天）逻辑。

### 步骤 3：状态管理初始化
- **文件**：`src/store/useAppStore.ts`, `src/store/useCardStore.ts`
- **动作**：
  - `useAppStore`：管理权限状态（未申请/已允许/已拒绝）、当前视图模式、轻量模式、手势引导状态。
  - `useCardStore`：管理时空薄片的内存数据（位置、内容、连线关系），并与 Dexie.js 建立同步机制。

### 步骤 4：权限与设备流接入
- **文件**：`src/hooks/useCamera.ts`, `src/hooks/useMicrophone.ts`, `src/services/mediapipe.ts`
- **动作**：
  - 封装摄像头、麦克风的权限请求逻辑，明确处理被拒绝的兜底状态。
  - 初始化 MediaPipe Hands 实例，提供坐标回调钩子。

### 步骤 5：核心页面与组件开发
- **文件**：
  - `src/pages/Landing.tsx`：引导页，包含全中文的产品认知说明、权限申请入口及“跳过手势，使用鼠标”的兜底入口。
  - `src/pages/MainCanvas.tsx`：主画布框架，包含顶部状态栏、底部时间轴和右下角摄像头预览。
  - `src/components/Card/ChronoFold.tsx`：卡片组件，实现悬浮、选中、拖拽视觉及不同情绪色的渲染。
  - `src/components/Input/QuickInput.tsx`：快速输入层，实现语音与键盘的双轨输入，支持标签和情绪选择。
  - `src/components/Trash/Singularity.tsx`：废纸篓奇点，展示回收站列表、二次确认彻底删除逻辑。

### 步骤 6：手势与业务逻辑串联
- **文件**：`src/pages/MainCanvas.tsx`, `src/components/Canvas/ConnectionLines.tsx`
- **动作**：
  - 挂载手势识别监听器，将“捏合”映射为卡片拖拽，“展开”映射为触发新建卡片，“长握拳”映射为移入废纸篓。
  - 实现两卡片靠近或拖拽连线释放时的关系建立（SVG 或 Canvas 绘制高亮连线）。

### 步骤 7：辅助与引导层补全
- **文件**：`src/components/Overlay/GhostLayer.tsx`, `src/components/Overlay/SearchWormhole.tsx`
- **动作**：
  - 开发手势引导教学界面（P1/P0交界任务）。
  - 实现搜索面板，高亮命中结果并实现视角/视图定位（通过简单的 DOM 滚动或平移实现相机移动效果）。

## 五、验证步骤
1. **路由与基础渲染**：`npm run dev` 启动后，验证进入 Landing 页，文案均显示为中文。
2. **权限兜底验证**：
   - 拒绝摄像头权限，确认右下角显示权限受限的中文提示，且能够使用鼠标双击或点击 `+` 新建卡片。
   - 拒绝麦克风权限，确认在触发“新建”时自动进入键盘输入模式。
3. **CRUD 闭环与存储**：
   - 创建两张不同情绪色的卡片，通过拖拽排布并建立连线。
   - 刷新浏览器，确认卡片数据及连线关系通过 IndexedDB 成功恢复。
4. **废纸篓流程验证**：
   - 将卡片删除，确认卡片从主画布消失并进入“废纸篓奇点”。
   - 在废纸篓中点击恢复，确认卡片回到原位。
   - 验证彻底删除需要经过二次确认且不可逆。
5. **手势跑通（条件允许时）**：
   - 开启摄像头，举手张开五指，测试能否触发“新建日记”操作。