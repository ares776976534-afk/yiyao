import pcStyles from "./index.module.scss";
import mobileStyles from "./index.mobile.module.scss";
import { useState, Fragment } from "react";
import { Image } from "antd";
import Preview, { VideoPreview } from "./preview";

export default function UserBubble(props) {
  const { content, isMobile = false, logKey } = props;
  const styles = isMobile ? mobileStyles : pcStyles;
  const { media_items = [] } = content || {};

  return (
    <div className={styles.userBubble}>
      {media_items.length > 0 && (
        <div
          className={styles.mediaContainer}
          style={{ marginBottom: content.content ? 10 : 0 }}
        >
          <Preview
            logKey={logKey}
            style={{ justifyContent: "flex-end" }}
            medias={media_items}
            width={64}
            height={64}
            isMobile={isMobile}
          />
        </div>
      )}
      {content.content && (
        <pre className={styles.contentText}>{content.content}</pre>
      )}
    </div>
  );
}
