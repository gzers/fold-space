# 软件测试 (Software Testing) Spec

## Why
当前项目完成了 v0.1.0 核心功能的开发，但尚未配置测试框架，也缺少自动化测试来保障代码的稳定性和核心逻辑的正确性。引入测试可以有效防止未来迭代中的回归问题。

## What Changes
- 引入 `vitest`、`@testing-library/react`、`@testing-library/jest-dom`、`jsdom` 等测试相关依赖。
- 配置 Vite 以支持 Vitest，并设置测试环境（如 `jsdom`）。
- 编写核心状态管理（Zustand Store）的单元测试。
- 编写核心组件（如引导页 `Landing`）的基础渲染测试。

## Impact
- Affected specs: 软件质量保障能力
- Affected code: `vite.config.ts`, `package.json`, 新增的 `*.test.ts` 和 `*.test.tsx` 测试文件。

## ADDED Requirements
### Requirement: 自动化测试能力
系统应能通过运行统一的命令执行自动化测试。

#### Scenario: 运行测试命令
- **WHEN** 开发者在终端中运行 `npm run test`
- **THEN** 测试框架启动并执行所有的 `.test.ts` 和 `.test.tsx` 文件，输出测试通过的结果。

## MODIFIED Requirements
### Requirement: 构建配置
Vite 配置将被修改以集成 Vitest 运行环境，并支持测试文件的解析。