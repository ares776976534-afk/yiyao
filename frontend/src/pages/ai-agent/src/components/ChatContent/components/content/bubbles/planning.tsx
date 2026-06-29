import pcStyles from './index.module.scss';
import mobileStyles from './index.mobile.module.scss';
import { ThoughtChain } from '@ant-design/x';
import { Steps } from 'antd';
import { useState, useEffect, useRef } from 'react';

export default function PlanningBubble(props) {
  const { content, isMobile = false } = props;
  const styles = isMobile ? mobileStyles : pcStyles;
  const { title, is_uncompleted, content: _content = [], icon } = content || {};
  // const [showContentMask, setShowContentMask] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showCollapsed, setShowCollapsed] = useState(false);

  useEffect(() => {
    if (is_uncompleted) {
      // 不折叠
      setCollapsed(false);
    } else {
      if (containerRef.current && containerRef.current.offsetHeight > 82) {
        // 内容高度不大于82px时，不折叠也不展示折叠按钮
        setShowCollapsed(true);
        setCollapsed(true);
      }
    }
  }, [is_uncompleted]);

  return (
    <div className={styles.planningContainer}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          {icon && (
            <div
              className={styles.icon}
              style={{ maskImage: `url(${icon})` }}
            />
          )}
          <div className={styles.title}>{title}</div>
        </div>
        {showCollapsed && (
          <div
            className={styles.arrowDown}
            style={{
              transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)',
            }}
            onClick={() => setCollapsed(!collapsed)}
          />
        )}
      </div>

      <div className={styles.planningContent}>
        <div
          ref={containerRef}
          style={{
            height: collapsed ? '78px' : 'auto',
            overflow: 'auto',
          }}
        >
          <div className={styles.stepsContent}>
            {Array.isArray(_content) &&
              _content?.map((item, index) => {
                return (
                  <div key={index} className={styles.stepItemContainer}>
                    <div className={styles.stepItemIcon}>{index + 1}.</div>
                    {index !== _content.length - 1 && (
                      <div className={styles.stepItemLine}>
                        <div className={styles.line} />
                      </div>
                    )}
                    <div className={styles.stepItemContent}>
                      <div className={styles.stepItemTitle}>{item.title}</div>
                      <div className={styles.stepItemDescription}>
                        {item.description}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {!is_uncompleted && collapsed && (
          <div className={styles.collapsedMask} />
        )}
      </div>
    </div>
  );
}
