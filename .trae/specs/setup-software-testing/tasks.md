# Tasks
- [x] Task 1: 安装测试所需的依赖
  - [x] SubTask 1.1: 安装 `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom` 作为开发依赖。
- [x] Task 2: 配置测试环境
  - [x] SubTask 2.1: 在 `vite.config.ts` 中配置 vitest 环境。
  - [x] SubTask 2.2: 在 `package.json` 中添加 `"test": "vitest run"` 脚本。
  - [x] SubTask 2.3: 创建测试入口 setup 文件 `src/setupTests.ts`，引入 jest-dom 扩展。
- [x] Task 3: 编写核心逻辑单元测试
  - [x] SubTask 3.1: 为 `src/store/useAppStore.ts` 编写状态变更测试。
  - [x] SubTask 3.2: 为 `src/store/useCardStore.ts` 编写核心逻辑测试（需对 IndexedDB 进行基础 Mock 或绕过）。
- [x] Task 4: 编写 UI 组件测试
  - [x] SubTask 4.1: 为 `src/pages/Landing.tsx` 编写基础的页面渲染与文案呈现测试。

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 2]
- [Task 4] depends on [Task 2]