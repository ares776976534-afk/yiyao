/**
 * 图标预览组件,用于方便预览图标资源。请不要在项目中使用。
 */
import React from 'react';
import { Modal, message } from 'antd';
import * as clipboard from "clipboard-polyfill";
import * as IconsFromIcons from '../Icons';
import * as IconsFromIcon from '../Icon';
import { $t } from '@/i18n';

type TypeIconCardProps = {
  name: string;
  IconComponent: React.ComponentType<any>;
  color: string;
};

const IconCard: React.FC<TypeIconCardProps> = ({ name, IconComponent, color }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  // 白色图标列表（需要深色背景才能看见）
  const whiteIconNames = ['CattleIcon', 'CheckMarkIcon', 'ImgLinkIcon', 'SendIcon',
    'AddWhiteIcon', 'AiIcon', 'ApiDocumentIcon', 'CloseIcon', 'DocumentAddIcon',
    'DocumentExternalIcon', 'DocumentPlusIcon', 'DocumentStarIcon', 'EditIcon', 'MagnifyIcon',
  ];
  const isWhiteIcon = whiteIconNames.includes(name);

  const cardStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '16px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: isHovered ? '0 4px 8px rgba(0,0,0,0.15)' : '0 1px 3px rgba(0,0,0,0.1)',
    transition: 'all 0.2s',
    cursor: 'pointer',
    transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
  };

  const iconContainerStyle: React.CSSProperties = {
    width: '48px',
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '8px',
    color,
    // 为白色图标添加深色背景
    backgroundColor: isWhiteIcon ? '#333' : 'transparent',
    borderRadius: isWhiteIcon ? '4px' : '0',
    padding: isWhiteIcon ? '4px' : '0',
  };

  const nameStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#666',
    textAlign: 'center',
    wordBreak: 'break-word',
  };

  const handleCopyName = async () => {
    try {
      await clipboard.writeText(name);
      message.success($t("global-1688-ai-app.icon-preview.ycopy", `已复制: ${name}`, [name]));
    } catch (err) {
      message.error('复制失败');
    }
  };

  return (
    <div
      style={cardStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCopyName}
    >
      <div style={iconContainerStyle}>
        <IconComponent width={32} height={32} />
      </div>
      <div style={nameStyle}>
        {name}
      </div>
    </div>
  );
};

/**
 *
 * @deprecated 请不要在项目中使用。这个组件只是为了方便预览图标资源。
 * @returns {React.ReactNode}
 */
export const IconPreview: React.FC = () => {
  const [open, setOpen] = React.useState(true);

  // 从 src/components/Icons 获取所有图标
  const iconsFromIconsDir = Object.entries(IconsFromIcons).filter(
    ([name]) => name !== 'default' && typeof IconsFromIcons[name as keyof typeof IconsFromIcons] === 'function',
  );

  // 从 src/components/Icon 获取所有图标
  const iconsFromIconDir = Object.entries(IconsFromIcon).filter(
    ([name]) => name !== 'default' && typeof IconsFromIcon[name as keyof typeof IconsFromIcon] === 'function',
  );

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      width={1200}
      centered
      title={$t("global-1688-ai-app.icon-preview.iconPreview", "图标预览")}
      destroyOnHidden
    >
      <div style={{ maxHeight: '70vh', overflowY: 'auto', padding: '20px 0' }}>
        {/* src/components/Icons */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#333' }}>{$t("global-1688-ai-app.icon-preview.smno", `src/components/Icons (${iconsFromIconsDir.length}个)`, [iconsFromIconsDir.length])}</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: '16px',
            }}
          >
            {iconsFromIconsDir.map(([name, IconComponent]) => (
              <IconCard
                key={name}
                name={name}
                IconComponent={IconComponent}
                color="#1890ff"
              />
            ))}
          </div>
        </div>

        {/* src/components/Icon */}
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#333' }}>{$t("global-1688-ai-app.icon-preview.smno.2", `src/components/Icon (${iconsFromIconDir.length}个)`, [iconsFromIconDir.length])}</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: '16px',
            }}
          >
            {iconsFromIconDir.map(([name, IconComponent]) => (
              <IconCard
                key={name}
                name={name}
                IconComponent={IconComponent}
                color="#52c41a"
              />
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};
