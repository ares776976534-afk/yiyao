import type { TypeApiTreeNode } from '@/services/claw/fileManagerTypes';
import { mapApiTreeToFileSystemNodes } from '@/services/claw/fileManagerApi';
import type { TypeFileContentPayload, TypeFileSystemNode } from './types';
import { getExtensionFromPath, inferPreviewKindFromExtension, languageHintFromExtension } from './previewKind';

/** 与目录树接口字段一致（name / fullPath / type / children），文件节点用 contentUrl 拉取预览 */
const MOCK_TREE_API: TypeApiTreeNode[] = [
  {
    name: 'all-files',
    fullPath: 'all-files',
    type: 'directory',
    isWorkspaceRoot: true,
    children: [
      {
        name: 'docs',
        fullPath: 'all-files/docs',
        type: 'directory',
        children: [
          {
            name: 'README.md',
            fullPath: 'all-files/docs/README.md',
            type: 'file',
            contentUrl: 'mock://repo/README.md',
            size: 512,
            modifiedTime: 1711789234000,
          },
          {
            name: 'guide.md',
            fullPath: 'all-files/docs/guide.md',
            type: 'file',
            contentUrl: 'mock://repo/guide.md',
            size: 256,
            modifiedTime: 1711789234000,
          },
        ],
      },
      {
        name: 'src',
        fullPath: 'all-files/src',
        type: 'directory',
        children: [
          {
            name: 'components',
            fullPath: 'all-files/src/components',
            type: 'directory',
            children: [
              {
                name: 'Button.tsx',
                fullPath: 'all-files/src/components/Button.tsx',
                type: 'file',
                contentUrl: 'mock://repo/src/components/Button.tsx',
                size: 400,
                modifiedTime: 1711789234000,
              },
              {
                name: 'Panel.tsx',
                fullPath: 'all-files/src/components/Panel.tsx',
                type: 'file',
                contentUrl: 'mock://repo/src/components/Panel.tsx',
                size: 380,
                modifiedTime: 1711789234000,
              },
            ],
          },
          {
            name: 'index.ts',
            fullPath: 'all-files/src/index.ts',
            type: 'file',
            contentUrl: 'mock://repo/src/index.ts',
            size: 120,
            modifiedTime: 1711789234000,
          },
        ],
      },
      {
        name: 'samples',
        fullPath: 'all-files/samples',
        type: 'directory',
        children: [
          {
            name: 'SkillStandard.pdf',
            fullPath: 'all-files/samples/SkillStandard.pdf',
            type: 'file',
            contentUrl: 'https://alpha-material-agent.oss-cn-hangzhou.aliyuncs.com/skillhub/SkillStandard.pdf',
            size: 0,
            modifiedTime: 1711789234000,
          },
          {
            name: 'demo.mp4',
            fullPath: 'all-files/samples/demo.mp4',
            type: 'file',
            contentUrl: 'https://alpha-material-agent.oss-accelerate.aliyuncs.com/video/17647550755661187296402.mp4',
            size: 0,
            modifiedTime: 1711789234000,
          },
          {
            name: 'avatar.png',
            fullPath: 'all-files/samples/avatar.png',
            type: 'file',
            contentUrl: 'https://img.alicdn.com/imgextra/i4/O1CN01Ffk9iC29ojCbyNZvb_!!6000000008115-2-tps-512-512.png',
            size: 0,
            modifiedTime: 1711789234000,
          },
          {
            name: 'extension.zip',
            fullPath: 'all-files/samples/extension.zip',
            type: 'file',
            contentUrl: 'https://g.alicdn.com/1688-global/1688-aibuy/0.1.1/chrome-mv3-1688-aibuy.zip',
            size: 0,
            modifiedTime: 1711789234000,
          },
          {
            name: 'hello.txt',
            fullPath: 'all-files/samples/hello.txt',
            type: 'file',
            contentUrl: 'mock://samples/hello.txt',
            size: 80,
            modifiedTime: 1711789234000,
          },
          {
            name: 'document.docx',
            fullPath: 'all-files/samples/document.docx',
            type: 'file',
            contentUrl: 'https://alpha-material-agent.oss-cn-hangzhou.aliyuncs.com/alphaclaw/files/claw_word.docx',
            size: 0,
            modifiedTime: 1711789234000,
          },
          {
            name: 'sheet.xlsx',
            fullPath: 'all-files/samples/sheet.xlsx',
            type: 'file',
            contentUrl: 'https://alpha-material-agent.oss-cn-hangzhou.aliyuncs.com/alphaclaw/files/claw_excel.xlsx',
            size: 0,
            modifiedTime: 1711789234000,
          },
        ],
      },
    ],
  },
];

const MOCK_CONTENT_MAP: Record<string, TypeFileContentPayload> = {
  'mock://repo/README.md': {
    url: 'mock://repo/README.md',
    previewKind: 'markdown',
    content: '# AlphaClaw Workspace\n\n这是一个用于演示右侧文件系统的 mock 仓库。\n\n## 特性\n\n- 目录树由接口序列化返回\n- 文件内容按 URL 异步加载\n- 预览区域风格参考 GitHub',
  },
  'mock://repo/guide.md': {
    url: 'mock://repo/guide.md',
    previewKind: 'markdown',
    content: '# Usage Guide\n\n1. 点击左侧目录展开节点\n2. 点击文件查看内容\n3. 切换文件时保留目录展开状态',
  },
  'mock://repo/src/components/Button.tsx': {
    url: 'mock://repo/src/components/Button.tsx',
    previewKind: 'code',
    language: 'tsx',
    content: "import React from 'react';\n\ninterface TypeButtonProps {\n  label: string;\n  onClick?: () => void;\n}\n\nexport default function Button({ label, onClick }: TypeButtonProps) {\n  return <button onClick={onClick}>{label}</button>;\n}\n",
  },
  'mock://repo/src/components/Panel.tsx': {
    url: 'mock://repo/src/components/Panel.tsx',
    previewKind: 'code',
    language: 'tsx',
    content: "import React from 'react';\n\nexport function Panel({ children }: { children: React.ReactNode }) {\n  return <section>{children}</section>;\n}\n",
  },
  'mock://repo/src/index.ts': {
    url: 'mock://repo/src/index.ts',
    previewKind: 'code',
    language: 'ts',
    content: "export * from './components/Panel';\n",
  },
  'mock://samples/hello.txt': {
    url: 'mock://samples/hello.txt',
    previewKind: 'plainText',
    content: '纯文本示例（GitHub 风格：等宽字体 + 行号）。\n后端就绪后可改为根据 contentUrl 拉取正文。',
  },
  'mock://samples/document.docx': {
    url: 'https://file-examples.com/storage/fe/fe68bc1b0a4458f5b0d5aa67/2017/02/file-sample_100kB.docx',
    previewKind: 'officeWord',
    content: '',
  },
  'mock://samples/sheet.xlsx': {
    url: 'https://file-examples.com/storage/fe/fe68bc1b0a4458f5b0d5aa67/2017/02/file_example_XLSX_10.xlsx',
    previewKind: 'officeExcel',
    content: '',
  },
};

export async function querySerializedFileTree(): Promise<TypeFileSystemNode[]> {
  await new Promise((resolve) => setTimeout(resolve, 120));
  return mapApiTreeToFileSystemNodes(MOCK_TREE_API);
}

export async function queryFileContentByUrl(contentUrl: string): Promise<TypeFileContentPayload> {
  await new Promise((resolve) => setTimeout(resolve, 120));
  const mapped = MOCK_CONTENT_MAP[contentUrl];
  if (mapped) {
    return mapped;
  }
  if (/^https?:\/\//i.test(contentUrl)) {
    const ext = getExtensionFromPath(contentUrl);
    const kind = inferPreviewKindFromExtension(ext);
    if (kind === 'plainText' || kind === 'code' || kind === 'markdown') {
      try {
        const res = await fetch(contentUrl, { mode: 'cors' });
        if (!res.ok) {
          throw new Error('bad status');
        }
        const text = await res.text();
        return {
          url: contentUrl,
          content: text,
          previewKind: kind === 'markdown' ? 'markdown' : kind === 'code' ? 'code' : 'plainText',
          language: languageHintFromExtension(ext),
        };
      } catch {
        return {
          url: contentUrl,
          content:
            '无法加载文本内容（可能受跨域限制或网络错误）。可尝试使用工具栏「复制链接」在新窗口打开。',
          previewKind: 'plainText',
        };
      }
    }
    return {
      url: contentUrl,
      content: '',
      previewKind: kind,
    };
  }
  throw new Error('File content not found');
}
