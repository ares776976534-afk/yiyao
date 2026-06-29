import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import MarkdownContent from '@/pages/claw/components/Markdown';
import AlphaMarkdown from '@/pages/claw/components/AlphaMarkdown';
import './index.scss';

const text = `
"根据项目上下文，我目前有以下 **8 个技能**可用：\n\n## 技能列表\n\n| 技能名 | 描述 |\n|--------|------|\n| **feishu-doc** | 飞书文档读写操作，处理飞书云文档或 docx 链接 |\n| **feishu-drive** | 飞书云存储文件管理，处理云空间和文件夹 |\n| **feishu-perm** | 飞书权限管理，处理文档和文件的分享、权限、协作者 |\n| **feishu-wiki** | 飞书知识库导航，处理知识库和 wiki 链接 |\n| **healthcheck** | 主机安全加固和风险配置，用于安全审计、防火墙/SSH/更新加固等 |\n| **skill-creator** | 创建、编辑、改进或审计 AgentSkills |\n| **tmux** | 远程控制 tmux 会话，发送按键和抓取面板输出 |\n| **video-frames** | 使用 ffmpeg 从视频中提取帧或短片段 |\n| **weather** | 获取当前天气和预报，通过 wttr.in 或 Open-Meteo |\n\n---\n\n你想使用哪个技能？或者需要我详细介绍某个技能的具体用法？"
`
const text2 = `
"根据项目上下文，
\`\`\`\`
code
核心引用
\`\`\`\`
我目前有"
`

export default function Test() {
  return (
    <div>
      {/* <MarkdownContent text={text2} /> */}
      <AlphaMarkdown className="alpha-markdown" text={text2} />

      {/* <div className="alpha-markdown">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{text2}</ReactMarkdown>
      </div> */}
    </div>
  );
}