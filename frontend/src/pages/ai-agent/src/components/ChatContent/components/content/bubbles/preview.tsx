import { useRef, useState, useEffect, useMemo } from "react";
import View from "@alife/channel-fe-materials-react-appear";
import { Image, Slider } from "antd";
import { OfferLinkIcon } from "@/components/InputChat/components/Icons";
import {
  PreviewIcon,
  DownloadIcon,
  LocateIcon,
  RightArrowIcon,
  PlayIcon,
  PausedIcon,
} from "../icons";
// import Player, { Events } from "xgplayer";
import download from "@/utils/download";
// import "xgplayer/dist/index.min.css";
import useDownloadConfirm from "@/components/DownloadConfirm";
import Feedback from "./feedback";
import XgPlayer from "@/components/XgPlayer";
import useToast from "@/components/Toast";
import { useStore } from "@/stores/context";
import * as theme from "@/components/studio-canvas/theme";
import { fallbackImages } from "@/components/ChatContent/assets";
import pcStyles from "./index.module.scss";
import mobileStyles from "./index.mobile.module.scss";
import { $t } from "@/i18n";
import aplus from "@/utils/log";
import {
  useMobileImagePreview,
  type TypeFileItem,
} from "@/components/MobileImagePreview";

const isShared =
  location.pathname.includes("/mobile-studio-share") ||
  location.pathname.includes("/share");

export const VideoPreview = (props) => {
  const {
    media_id,
    media_cover_url,
    media_url,
    coverWidth,
    coverHeight,
    style,
    onLoad,
    isMobile = false,
  } = props;
  const styles = isMobile ? mobileStyles : pcStyles;

  const player = useRef<any>();
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [play, setPlay] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // const timeUpdate = () => {
  //   const curTime = Math.round(player.current.currentTime);
  //   if (curTime !== currentTime) {
  //     setCurrentTime(curTime);
  //   }
  // };

  const formatTime = (time) => {
    const m = Math.floor(time / 60)
      .toString()
      .padStart(2, "0");
    const s = Math.floor(time % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  };

  const handlePlay = () => {
    setPlay(true);
  };

  const handlePaused = () => {
    setPlay(false);
  };

  const onSliderChange = (newValue) => {
    setCurrentTime(newValue);
    player.current.setCurrentTime(newValue);
  };

  return (
    <div
      className={styles.videoPreview}
      style={{
        width: coverWidth,
        height: coverHeight + 3,
        flexShrink: 0,
        ...style,
      }}
    >
      {/* AI生成的图才显示水印，通过media_id判断 */}
      {!!media_id && (
        <img
          className={styles.watermark}
          src={theme.Images.watermark}
          alt="watermark"
        />
      )}
      <XgPlayer
        ref={player}
        url={media_url}
        poster={media_cover_url}
        width={coverWidth}
        height={coverHeight}
        options={{
          controls: false,
          autoplay: false,
          autoplayMuted: false,
          videoFillMode: "contain",
          fullscreen: {
            needBackIcon: true,
            position: "root",
          },
        }}
        initCurrentTime={currentTime}
        onReady={() => {
          onLoad();
        }}
        onLoadedData={(instance) => {
          setDuration(Math.floor(instance.duration));
        }}
        onTimeUpdate={(instance) => {
          setCurrentTime(Math.round(instance.currentTime));
        }}
        onPlay={handlePlay}
        onPause={handlePaused}
      />
      <div className={styles.controller}>
        {!play ? (
          <div
            className={styles.btn}
            onClick={() => {
              player.current?.play();
            }}
          >
            <PlayIcon />
          </div>
        ) : (
          <div
            className={styles.btn}
            onClick={() => {
              player.current?.pause();
            }}
          >
            <PausedIcon />
          </div>
        )}
        <div className={styles.timeContainer}>
          <span className={styles.currentTime}>{formatTime(currentTime)}</span>
          <span>/</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
      <div className={styles.processBar}>
        <Slider
          max={duration}
          value={currentTime}
          onChange={onSliderChange}
          tooltip={{
            open: false,
          }}
        />
      </div>
      <div className={styles.actionWrap}>
        <div
          className={styles.actionBtn}
          onClick={() => {
            player.current.instance.getPlugin("fullscreen").handleFullscreen();
          }}
        >
          <PreviewIcon />
        </div>
        <div
          className={`${styles.actionBtn} ${
            downloading ? styles.actionBtnDisabled : ""
          }`}
          onClick={async () => {
            if (downloading) return;
            setDownloading(true);
            try {
              aplus.record("/alphashop.chat.download", "CLK", {
                type: "video",
              });
              await download(
                media_url,
                $t(
                  "global-1688-ai-app.ChatContent.content.bubbles.preview.videomp4",
                  `视频_${Date.now()}.mp4`,
                  [Date.now()],
                ),
              );
            } finally {
              setDownloading(false);
            }
          }}
        >
          <DownloadIcon />
        </div>
      </div>

      {/* 反馈按钮 */}
      {!isShared && !isMobile && <Feedback {...props} />}
    </div>
  );
};

export const LinkPreview = (props) => {
  const {
    logKey,
    src,
    style,
    width,
    height,
    item,
    onLoad = () => {},
    isMobile = false,
  } = props;
  const styles = isMobile ? mobileStyles : pcStyles;
  const store = useStore();
  const handleOpen = (offerId) => {
    window.open(`https://detail.1688.com/offer/${offerId}.html`);
  };

  return (
    <View
      className={styles["offer-item"]}
      style={{ flexShrink: 0, ...style }}
      onClick={() => {
        if (item.offerId) {
          if (logKey) {
            aplus.record(logKey, "CLK", {
              offer_id: item.offerId,
            });
          }
          handleOpen(item.offerId);
        }
      }}
      onFirstAppear={() => {
        if (logKey) {
          aplus.record(logKey, "EXP", {
            offer_id: item.offerId,
          });
        }
      }}
    >
      <Image
        src={src}
        width={width}
        height={height}
        style={{ objectFit: "cover" }}
        onLoad={onLoad}
        fallback={fallbackImages[store.theme]}
        onError={onLoad}
      />
      <div className={styles["offer-item-mask"]}>
        <OfferLinkIcon className={styles["offer-link-icon"]} />
      </div>
    </View>
  );
};

export const ImagePreview = (props) => {
  const {
    type = "role",
    width = 72,
    height = 72,
    src = "",
    onLoad = () => {},
    media_id,
    style,
    isMobile = false,
    borderRadius = "8px",
  } = props;
  const styles = isMobile ? mobileStyles : pcStyles;

  const [visible, setVisible] = useState(false);
  const downloadConfirm = useDownloadConfirm();
  const store = useStore();
  const toast = useToast();

  // mobile图片预览
  const { openSinglePreview, PreviewModal } = useMobileImagePreview();
  const handleMobilePreview = () => {
    openSinglePreview({
      imagePreviewUrl: src,
    } as TypeFileItem);
  };

  // 统一的预览触发函数
  const showPreview = () => {
    if (isMobile) {
      handleMobilePreview();
    } else {
      setVisible(true);
    }
  };

  return (
    <>
      <div
        className={styles.imageWrap}
        style={{ width: width, height: height }}
        onClick={isMobile ? showPreview : undefined}
      >
        <Image
          style={{
            borderRadius: borderRadius,
            objectFit: type === "role" ? "contain" : "cover",
            flexShrink: 0,
          }}
          width={width}
          height={height}
          src={src}
          preview={
            isMobile
              ? {
                  visible: false,
                  onVisibleChange: (value) => {
                    // mobile模式点击图片时触发自定义预览
                    if (value) {
                      handleMobilePreview();
                    }
                  },
                }
              : {
                  visible,
                  onVisibleChange: (value) => {
                    setVisible(value);
                  },
                  // 需要水印预览图的使用自定义组件
                  imageRender: media_id
                    ? (a, { transform }) => {
                        const { flipX, flipY, rotate, scale } = transform;
                        const scaleX = (flipX ? -1 : 1) * scale;
                        const scaleY = (flipY ? -1 : 1) * scale;

                        const trans = [
                          rotate ? `rotate(${rotate}deg)` : "",
                          scale ? `scale3d(${scaleX}, ${scaleY}, 1)` : "",
                        ]
                          .filter(Boolean)
                          .join(" ");

                        return (
                          <div
                            className={styles.customPreview}
                            style={{ transform: trans }}
                          >
                            <div style={{ display: "none" }}>{a}</div>
                            <img
                              className={styles.customPreviewImage}
                              src={src}
                            />
                            <img
                              className={styles.watermark}
                              src={theme.Images.watermark}
                              alt="watermark"
                            />
                          </div>
                        );
                      }
                    : undefined,
                }
          }
          fallback={fallbackImages[store.theme]}
          onLoad={onLoad}
          onError={onLoad}
        />

        {/* 用户方发送的图片 */}
        {type === "role" && !isMobile ? (
          <div className={`${styles.imageMaskContainer} ${styles.blackMask}`}>
            <div className={styles.iconContainer} onClick={showPreview}>
              <PreviewIcon />
            </div>
          </div>
        ) : (
          // AI生成的图
          <div>
            {/* AI生成的图才显示水印，通过media_id判断 */}
            {!!media_id && (
              <img
                className={styles.watermark}
                src={theme.Images.watermark}
                alt="watermark"
              />
            )}

            {!isMobile && (
              <div className={styles.actionWrapContainer}>
                <div className={styles.actionWrap}>
                  <div
                    className={styles.actionBtn}
                    title={$t(
                      "global-1688-ai-app.ChatContent.content.bubbles.preview.preview",
                      "预览",
                    )}
                    onClick={showPreview}
                  >
                    <PreviewIcon />
                  </div>

                  <div
                    className={styles.actionBtn}
                    title={$t(
                      "global-1688-ai-app.ChatContent.content.bubbles.preview.download",
                      "下载",
                    )}
                    onClick={() => {
                      aplus.record("/alphashop.chat.download", "CLK", {
                        type: "image",
                      });
                      downloadConfirm.confirm({
                        downloadContents: {
                          downloadList: [
                            {
                              type: "image",
                              downloadData: src,
                              needWatermark: !!media_id,
                              downloadName: $t(
                                "global-1688-ai-app.ChatContent.content.bubbles.preview.imagepng",
                                `图片_${media_id}`,
                                [media_id],
                              ),
                            },
                          ],
                        },
                      });
                    }}
                  >
                    <DownloadIcon />
                  </div>

                  {/* 定位按钮 */}
                  {!isShared && (
                    <div
                      className={styles.actionBtn}
                      title={$t(
                        "global-1688-ai-app.ChatContent.content.bubbles.preview.dw",
                        "定位",
                      )}
                      onClick={() => {
                        if (media_id) {
                          store?.locateElement(media_id).catch(() => {
                            toast.error("无法找到该图片");
                          });
                        } else {
                          toast.error("无法找到该图片");
                        }
                      }}
                    >
                      <LocateIcon />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 反馈按钮 */}
            {!isShared && !isMobile && <Feedback {...props} />}
          </div>
        )}
      </div>
      {/* Mobile图片预览Modal */}
      {isMobile && PreviewModal}
    </>
  );
};

export default function Preview(props) {
  const {
    logKey,
    sessionId,
    taskId,
    medias = [],
    type,
    swiper = false,
    width = 72,
    height = 72,
    coverWidth = 72,
    coverHeight = 72,
    onLoad = () => {},
    style,
    isMobile = false,
  } = props;
  const styles = isMobile ? mobileStyles : pcStyles;

  const loadedCount = useRef(0);
  const itemsContainer = useRef();

  const [curIndex, setCurIndex] = useState(0);

  const renderMedia = (item, index) => {
    const { media_type, media_cover_url } = item || {};

    const handleload = () => {
      loadedCount.current++;
      if (loadedCount.current === medias.length) {
        onLoad();
      }
    };

    // 根据图片数量设置圆角：单图 8px，多图 4px
    const imageBorderRadius = medias.length === 1 ? "8px" : "4px";

    let content;
    if (media_type === "image") {
      content = (
        <ImagePreview
          {...item}
          sessionId={sessionId}
          taskId={taskId}
          type={type}
          width={width}
          height={height}
          src={media_cover_url}
          onLoad={handleload}
          isMobile={isMobile}
          borderRadius={imageBorderRadius}
        />
      );
    } else if (media_type === "video") {
      content = (
        <VideoPreview
          {...item}
          sessionId={sessionId}
          taskId={taskId}
          coverWidth={coverWidth}
          coverHeight={coverHeight}
          onLoad={handleload}
          isMobile={isMobile}
        />
      );
    } else if (media_type === "link") {
      content = (
        <LinkPreview
          logKey={logKey}
          sessionId={sessionId}
          taskId={taskId}
          style={{ borderRadius: "8px" }}
          width={width}
          height={height}
          src={media_cover_url}
          item={item}
          onLoad={handleload}
          isMobile={isMobile}
        />
      );
    }

    return (
      <div key={`image-${index}`} style={{ flexShrink: 0 }}>
        {content}
      </div>
    );
  };

  const items = useMemo(() => {
    return medias?.map((item, index) => {
      return renderMedia(item, index);
    });
  }, [medias]);

  const onPrev = () => {
    const i = curIndex - 1;
    if (i >= 0) {
      setCurIndex(i);
    }
  };

  const onNext = () => {
    const i = curIndex + 1;
    if (i <= medias.length - 1) {
      setCurIndex(i);
    }
  };

  useEffect(() => {
    const container = itemsContainer.current;
    if (container && container.children) {
      const item = container.children[curIndex] || {};
      // item.scrollIntoView({
      //   behavior: 'smooth'
      // });
      container?.scrollTo({
        left: item.offsetLeft || 0,
        behavior: "smooth",
      });
    }
  }, [curIndex]);

  return swiper ? (
    <div className={styles.swiperContainer} {...style}>
      <div className={styles.itemsContainer} ref={itemsContainer}>
        {items}
      </div>
      {medias.length > 1 && (
        <>
          <div
            className={`${styles.iconWrap} ${styles.left}`}
            style={
              curIndex === 0
                ? {
                    cursor: "not-allowed",
                    opacity: ".4",
                  }
                : {}
            }
            onClick={onPrev}
          >
            <RightArrowIcon style={{ transform: "rotate(180deg)" }} />
          </div>
          <div
            className={`${styles.iconWrap} ${styles.right}`}
            style={
              curIndex === medias.length - 1
                ? {
                    cursor: "not-allowed",
                    opacity: ".4",
                  }
                : {}
            }
            onClick={onNext}
          >
            <RightArrowIcon />
          </div>
        </>
      )}
    </div>
  ) : (
    <div className={styles.previewWrap} style={{ ...style }}>
      {items}
    </div>
  );
}
