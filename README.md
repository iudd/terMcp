# TerMCP - Terminal MCP Server

## 项目概述

TerMCP 是一个基于 Model Context Protocol (MCP) 规范开发的终端工具服务器。它允许 AI 助手通过标准协议与终端命令交互，提供安全的命令执行、文件操作和系统信息查询功能。

## 功能特性

- **命令执行**：安全执行终端命令，支持参数验证和结果返回
- **文件操作**：读取、写入、列出目录等文件系统操作
- **系统信息**：获取系统状态、进程信息等
- **安全控制**：命令白名单、权限检查、超时控制
- **MCP 兼容**：完全遵循 MCP 2025-06-18 规范

## 架构设计

### 核心组件

1. **Server 类**：继承 MCP SDK Server，实现协议处理
2. **Tool Manager**：管理工具注册和执行
3. **Security Layer**：安全验证和权限控制
4. **Transport Layer**：支持 stdio 和 SSE 传输

### 数据流

```
Client Request -> MCP Protocol -> Server Handler -> Tool Execution -> Response
```

## 开发规范

### 遵循 MCP 规范

- 协议版本：2025-06-18
- 通信：JSON-RPC 2.0
- 能力声明：tools, resources, logging

### 代码质量

- 使用 TypeScript 开发
- 遵循 ESLint 和 Prettier 规范
- 单元测试覆盖率 > 80%
- 错误处理：Fail-Fast 原则

## 开发步骤

### 1. 环境准备

```bash
# 安装依赖
npm install @modelcontextprotocol/sdk typescript eslint prettier
```

### 2. 项目结构

```
terMcp/
├── src/
│   ├── server.ts          # 主服务器文件
│   ├── tools/             # 工具实现
│   │   ├── command.ts     # 命令执行工具
│   │   ├── file.ts        # 文件操作工具
│   │   ├── filesystem.ts  # 扩展文件管理工具
│   │   └── system.ts      # 系统信息工具
│   ├── utils/             # 工具函数
│   └── types/             # 类型定义
├── test/                  # 测试文件
├── docs/                  # 文档
├── package.json
├── tsconfig.json
├── eslint.config.js
└── README.md
```

### 3. 实现核心逻辑

#### Server 初始化

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new Server(
  {
    name: 'terMcp',
    version: '1.0.0'
  },
  {
    capabilities: {
      tools: { listChanged: true },
      resources: {},
      logging: {}
    }
  }
);
```

#### 工具实现示例

```typescript
// tools/command.ts
export const commandTool = {
  name: 'execute_command',
  description: 'Execute terminal command safely',
  inputSchema: {
    type: 'object',
    properties: {
      command: { type: 'string' },
      args: { type: 'array', items: { type: 'string' } },
      timeout: { type: 'number', default: 30000 }
    },
    required: ['command']
  }
};

server.setRequestHandler('tools/call', async (request) => {
  if (request.params.name === 'execute_command') {
    // 实现命令执行逻辑
    const result = await executeCommand(request.params.arguments);
    return { content: [{ type: 'text', text: result }] };
  }
});
```

### 4. 安全考虑

- 命令白名单验证
- 路径安全检查
- 执行超时控制
- 权限隔离

### 5. 测试和部署

- 单元测试：Jest
- 集成测试：MCP Inspector
- 打包：npm run build
- 运行：npm start

## API 参考

### 工具列表

#### 基础工具
- `execute_command`：执行终端命令
- `read_file`：读取文件内容
- `write_file`：写入文件
- `list_directory`：列出目录
- `get_system_info`：获取系统信息

#### 文件管理工具（扩展）
- `create_file`：创建新文件
- `create_directory`：创建新目录
- `delete_file`：删除文件
- `delete_directory`：删除目录（递归）
- `copy_file`：复制文件
- `move_file`：移动/重命名文件
- `get_file_info`：获取文件详细信息（大小、权限、修改时间等）
- `change_permissions`：修改文件权限
- `search_files`：在目录中搜索文件（支持通配符和正则）
- `compress_file`：压缩文件/目录
- `extract_file`：解压文件
- `calculate_hash`：计算文件哈希值（MD5/SHA256）

### 错误处理

使用标准 MCP 错误码：
- `InvalidRequest`: 参数无效
- `MethodNotFound`: 方法不存在
- `InternalError`: 内部错误

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交代码和测试
4. 创建 Pull Request

## 许可证

MIT License

## 联系

如有问题，请提交 Issue 或联系维护者。