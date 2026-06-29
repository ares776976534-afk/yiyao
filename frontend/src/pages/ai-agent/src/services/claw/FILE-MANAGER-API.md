# AlphaClaw 文件管理 API 文档

## 概述

AlphaClaw 文件管理 API 提供了查看和下载用户在无影云服务器上的 /home/wuying 目录下所有文件的能力。

**基础路径**: `/alphaclaw/files`

**权限要求**:
- 需要用户登录
- 需要在 `server_command_whitelist` 白名单中

**访问范围**:
- `/home/wuying` 目录下的所有文件和子目录
- 包括 .openclaw、workspace、配置文件等所有内容

---

## API 接口

### 1. 获取目录树

获取 /home/wuying 目录的完整文件目录树结构。

**请求**:
```
GET /alphaclaw/files/tree
```

**响应**:
```json
{
  "success": true,
  "data": [
    {
      "name": "wuying",
      "path": "wuying",
      "type": "directory",
      "isWorkspaceRoot": true,
      "children": [
        {
          "name": ".openclaw",
          "path": "wuying/.openclaw",
          "type": "directory",
          "modifiedTime": 1711789234000,
          "children": [...]
        },
        {
          "name": ".bashrc",
          "path": "wuying/.bashrc",
          "type": "file",
          "size": 1234,
          "modifiedTime": 1711789234000
        },
        {
          "name": "workspace",
          "path": "wuying/workspace",
          "type": "directory",
          "children": [...]
        }
      ]
    }
  ]
}
```

**字段说明**:
- `name`: 文件或文件夹名称
- `path`: 相对路径（相对于 /home/wuying/）
- `type`: 节点类型（`file` / `directory`）
- `size`: 文件大小（字节数，仅文件有效）
- `modifiedTime`: 修改时间（Unix 时间戳，毫秒）
- `children`: 子节点列表（仅目录有效）
- `isWorkspaceRoot`: 是否为根目录

**使用场景**:
- 前端初始加载时获取完整目录树
- 用户点击刷新按钮时重新获取
- 前端负责展示、折叠/展开控制

---

### 2. 获取文件内容

获取指定文件的内容，用于在线预览。

**请求**:
```
GET /alphaclaw/files/file/content?filePath=.openclaw/workspace/README.md
```

**参数**:
| 参数名 | 类型 | 必填 | 说明 |
|-------|------|------|------|
| filePath | string | 是 | 文件路径（相对于 /home/wuying/，如 .openclaw/workspace/README.md） |

**响应**:
```json
{
  "success": true,
  "data": {
    "success": true,
    "filePath": ".openclaw/workspace/README.md",
    "content": "# Workspace\n\nThis is my workspace...",
    "size": 1234
  }
}
```

**字段说明**:
- `success`: 是否成功获取文件内容
- `filePath`: 文件路径
- `content`: 文件内容（文本格式）
- `size`: 文件大小（字节数）
- `error`: 错误信息（如果失败）

**使用场景**:
- 用户点击文件时在右侧预览区域显示内容
- 按需加载，只在点击时请求

**安全限制**:
- 禁止路径穿越（不能包含 ".."）
- 禁止绝对路径（不能以 "/" 开头）
- 只能访问 /home/wuying 目录下的文件

---

### 3. 下载文件

下载指定文件到本地。

**请求**:
```
GET /alphaclaw/files/file/download?filePath=.openclaw/workspace/README.md
```

**参数**:
| 参数名 | 类型 | 必填 | 说明 |
|-------|------|------|------|
| filePath | string | 是 | 文件路径（相对于 /home/wuying/） |

**响应**:
- Content-Type: `application/octet-stream`
- Content-Disposition: `attachment; filename="README.md"`
- 二进制文件流

**使用场景**:
- 用户点击下载按钮
- 浏览器会自动触发文件下载

**安全限制**:
- 禁止路径穿越（不能包含 ".."）
- 禁止绝对路径（不能以 "/" 开头）
- 只能下载 /home/wuying 目录下的文件

---

## 错误码

| 错误码 | 说明 |
|-------|------|
| NO_PERMISSION | 用户无权限访问工作空间 |
| PARAM_ERROR | 参数错误（filePath 为空） |
| GET_TREE_ERROR | 获取目录树失败 |
| GET_CONTENT_FAILED | 获取文件内容失败 |
| GET_CONTENT_ERROR | 获取文件内容异常 |

---

## 技术实现

### AgentBay SDK
- 使用 `session.getCommand().executeCommand()` 执行 ls 命令获取目录结构
- 使用 `session.getFilesystem().readFile()` 读取文件内容

### 性能优化
- 使用 `ls -laR` 命令一次性获取完整目录树（前5000行）
- 前端缓存目录树，减少重复请求
- 文件内容按需加载（用户点击时才请求）
- 命令超时设置：ls 30秒，readFile 使用默认

### 命令选择
- **v2 (当前)**: 使用 `ls -laR --time-style=+%s` 获取目录树
  - 更好的兼容性，在所有 Unix/Linux 环境中都支持
  - 包含文件大小、修改时间、权限等信息
  - 输出格式易于解析
- **v1 (已弃用)**: 使用 `find . -maxdepth 10 -printf`
  - `-printf` 参数在某些环境中不被支持

### 安全机制
- 白名单验证：`server_command_whitelist`
- 路径验证：禁止路径穿越（..）和绝对路径（/）
- 访问限制：只能访问 /home/wuying 目录

---

## 使用示例

### 前端获取目录树
```javascript
// 1. 获取目录树
const response = await fetch('/alphaclaw/files/tree');
const { data } = await response.json();

// 2. 渲染树形结构（默认折叠）
// data[0] 是 wuying 根目录
renderTree(data[0], { collapsed: true });

// 3. 用户点击文件时，获取文件内容
async function onFileClick(filePath) {
  // filePath 示例: "wuying/.openclaw/workspace/README.md"
  // 需要去掉 "wuying/" 前缀
  const relativePath = filePath.replace(/^wuying\//, '');
  const response = await fetch(`/alphaclaw/files/file/content?filePath=${encodeURIComponent(relativePath)}`);
  const { data } = await response.json();

  if (data.success) {
    showPreview(data.content);
  }
}

// 4. 用户点击下载时
function onDownload(filePath) {
  const relativePath = filePath.replace(/^wuying\//, '');
  window.open(`/alphaclaw/files/file/download?filePath=${encodeURIComponent(relativePath)}`);
}
```

---

## 常见问题

### Q: 为什么不分页返回目录树？
A: /home/wuying 目录文件通常不会太大（几百到几千个文件），一次性返回完整树可以提供更好的用户体验（前端控制展开/折叠），同时减少请求次数。find 命令设置了 maxdepth=10 限制递归深度。

### Q: 文件内容预览有大小限制吗？
A: 当前没有显式限制，但建议前端根据文件大小决定是否预览（如超过 1MB 提示用户下载）。

### Q: 刷新频率建议？
A: 建议由用户手动点击刷新按钮触发，避免自动轮询造成性能压力。如果需要实时性，可以考虑 5-10 秒轮询间隔。

### Q: 支持哪些文件类型预览？
A: 当前返回原始文本内容，前端可根据文件扩展名决定如何渲染（如 .md 用 markdown 渲染器，.json 用 JSON 格式化器等）。

---

## 版本历史

### v1.0.0 (2026-03-31)
- 初始版本
- 支持获取工作空间目录树
- 支持获取文件内容
- 支持下载文件
