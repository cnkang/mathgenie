// 简化的测试工具，依赖全局清理机制
// 避免与 setupTests.ts 中的清理机制冲突

// 直接重新导出 @testing-library/react
// 让全局的 setupTests.ts 处理清理工作
export * from '@testing-library/react';
