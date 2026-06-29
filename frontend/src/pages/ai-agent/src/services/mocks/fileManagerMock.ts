import type { TypeApiTreeNode } from '@/services/claw/fileManagerTypes';

/** 与 FILE-MANAGER-API.md「获取目录树」响应示例一致，并补全文档中 [...] 占位 */
export const mockFileManagerTreeData: TypeApiTreeNode[] = [
  {
    name: 'wuying',
    fullPath: 'wuying',
    type: 'directory',
    isWorkspaceRoot: true,
    children: [
      {
        name: '.openclaw',
        fullPath: 'wuying/.openclaw',
        type: 'directory',
        modifiedTime: 1711789234000,
        children: [
          {
            name: 'workspace',
            fullPath: 'wuying/.openclaw/workspace',
            type: 'directory',
            modifiedTime: 1711789234000,
            children: [
              {
                name: 'README.md',
                fullPath: 'wuying/.openclaw/workspace/README.md',
                type: 'file',
                size: 1234,
                modifiedTime: 1711789234000,
              },
            ],
          },
        ],
      },
      {
        name: '.bashrc',
        fullPath: 'wuying/.bashrc',
        type: 'file',
        size: 1234,
        modifiedTime: 1711789234000,
      },
      {
        name: 'workspace',
        fullPath: 'wuying/workspace',
        type: 'directory',
        modifiedTime: 1711789234000,
        children: [],
      },
    ],
  },
];

/** 与文档「获取文件内容」示例中 data.content 一致 */
const mockContentReadme = '# Workspace\n\nThis is my workspace...';

export const mockFileManagerBodyByPath: Record<string, { content: string; size: number }> = {
  'wuying/.openclaw/workspace/README.md': {
    content: mockContentReadme,
    size: 1234,
  },
  'wuying/.bashrc': {
    content: '# ~/.bashrc (mock)\nexport EXAMPLE=1\n',
    size: 36,
  },
};

export const fileManagerMockDelayMs = 120;

export function delayFileManagerMock(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, fileManagerMockDelayMs);
  });
}

/** 模拟 GET /alphaclaw/files/directory：只返回该路径下的直接子节点 */
export function mockFetchDirectoryChildren(dirPath: string): TypeApiTreeNode[] {
  const walk = (nodes: TypeApiTreeNode[]): TypeApiTreeNode[] | undefined => {
    for (const n of nodes) {
      if (n.fullPath === dirPath) {
        if (n.type === 'directory') {
          return n.children ?? [];
        }
        return [];
      }
      if (n.type === 'directory' && n.children?.length) {
        const sub = walk(n.children);
        if (sub !== undefined) {
          return sub;
        }
      }
    }
    return undefined;
  };
  return walk(mockFileManagerTreeData) ?? [];
}
