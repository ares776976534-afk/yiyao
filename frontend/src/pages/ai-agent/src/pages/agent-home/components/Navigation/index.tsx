import React, { useState, useEffect, useRef } from "react";
import styles from "./index.module.css";
import log from "@/utils/log";
import { LOG_KEYS } from "@/utils/logConfig";

interface NavigationItem {
  id: string;
  icon: React.ReactNode;
  text: string;
}

interface NavigationProps {
  items: NavigationItem[];
  activeId?: string;
  onItemClick?: (id: string) => void;
}

const buttonLogKeyMap: Record<string, string> = {
  selectProduct: LOG_KEYS.AGENT_HOME.BUTTON.INSIGHT,
  selectSeller: LOG_KEYS.AGENT_HOME.BUTTON.SOURCING,
  material: LOG_KEYS.AGENT_HOME.BUTTON.DESIGN,
  inquiry: LOG_KEYS.AGENT_HOME.BUTTON.INQUIRY,
  commonChat: LOG_KEYS.AGENT_HOME.BUTTON.CHAT,
};

const Navigation: React.FC<NavigationProps> = ({
  items,
  activeId = "product",
  onItemClick,
}) => {
  const [selectedId, setSelectedId] = useState(activeId);
  const exposedRef = useRef<Set<string>>(new Set());
  const clickingRef = useRef<string | null>(null);

  useEffect(() => {
    const logKey = buttonLogKeyMap[selectedId];
    if (logKey && !exposedRef.current.has(selectedId)) {
      exposedRef.current.add(selectedId);
      log.record(logKey as `/${string}.${string}.${string}`, 'EXP');
    }
  }, [selectedId]);

  const handleItemClick = (id: string) => {
    if (clickingRef.current === id) return;
    clickingRef.current = id;
    setTimeout(() => { clickingRef.current = null; }, 500);

    const logKey = buttonLogKeyMap[id];
    if (logKey) {
      log.record(logKey as `/${string}.${string}.${string}`, 'CLK');
    }
    setSelectedId(id);
    onItemClick?.(id);
  };

  return (
    <div className={styles.navigation} data-tour="tour-step-1">
      <span className={styles.navigationLeftLine} />
      {items.map((item, index) => {
        const isActive = selectedId === item.id;
        return (
          <React.Fragment key={item.id}>
            <div
              data-tour={isActive ? "tour-step-2" : ""}
              className={`${styles.navItem} ${
                isActive ? styles.navItemActive : ""
              }`}
              onClick={() => handleItemClick(item.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  handleItemClick(item.id);
                }
              }}
            >
              <span
                className={isActive ? styles.navIconActive : styles.navIcon}
              >
                {item.icon}
              </span>
              <span
                className={`${styles.navText} ${
                  isActive ? styles.navTextActive : styles.navText
                }`}
              >
                {item.text}
              </span>
            </div>
            {index < items.length - 1 && (
              <span className={styles.navigationLine} />
            )}
          </React.Fragment>
        );
      })}
      <span className={styles.navigationRightLine} />
    </div>
  );
};

export default Navigation;
