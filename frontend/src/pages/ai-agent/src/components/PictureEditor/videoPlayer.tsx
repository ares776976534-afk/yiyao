import React, {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import { Slider } from "antd";
import { PlayCircleFilled, PauseCircleOutlined } from "@ant-design/icons";
import XgPlayer from "@/components/XgPlayer";
import * as theme from "@/components/studio-canvas/theme";
import styles from "./index.module.scss";

interface VideoPlayerProps {
  id: string;
  scale?: number;
  attributes: { [key: string]: any };
  onScreenShot: (screenshot: any) => void;
  showControls: boolean;
}
export default forwardRef((props: VideoPlayerProps, ref) => {
  const {
    id,
    attributes: { poster, src, watermark },
    onScreenShot = () => { },
    showControls,
  } = props;
  const player = useRef<any>();

  const [play, setPlay] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useImperativeHandle(
    ref,
    () => {
      return {
        play: () => {
          setShowVideo(true);
          setPlay(true);
        },
      };
    },
    []
  );

  const onSliderChange = (newValue) => {
    setCurrentTime(newValue);

    if (player.current) {
      player.current.setCurrentTime(newValue);
      player.current.screenShot().then((res) => {
        onScreenShot(res);
      });
    }
  };

  const handlePlay = () => {
    setPlay(true);
  }

  const handlePaused = () => {
    setPlay(false);
    player.current?.screenShot().then((res) => {
      onScreenShot(res);
      setShowVideo(false);
    });
  };

  const handleEnded = () => {
    // 播放结束重置当前时间
    setCurrentTime(0);
  };

  const formatTime = (time) => {
    const _value = Math.floor(time);
    const m = Math.floor(_value / 60)
      .toString()
      .padStart(2, "0");
    const s = Math.floor(_value % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  };

  useEffect(() => {
    if (play && player.current) {
      player.current.play();
    }
  }, [play, player.current]);

  return (
    <div className={`${styles.videoContainer} video-controls-container`}>
      {
        // showVideo && 
        (
          <div
            className={styles.videoPlayer}
            style={showVideo ? {
            } : {
              position: 'fixed',
              zIndex: -9999,
              opacity: 0,
              pointerEvents: 'none',
            }}
          >
            <XgPlayer
              ref={player}
              url={src}
              poster={poster}
              initCurrentTime={currentTime}
              onLoadedData={(instance) => {
                setDuration(Math.floor(instance.duration));
              }}
              onTimeUpdate={(instance) => {
                setCurrentTime(instance.currentTime);
              }}
              onPlay={handlePlay}
              onPause={handlePaused}
              onEnded={handleEnded}
            />

            {/* AI生成的图才显示水印，通过media_id判断 */}
            {!!watermark && (
              <img
                className={styles.watermark}
                src={theme.Images.watermark}
                alt="watermark"
              />
            )}
          </div>
        )
      }

      {showControls && (
        <div className={styles.controls}>
          {play ? (
            <div
              className={styles.actionBtn}
              onClick={() => {
                player.current?.pause();
                setPlay(false);
              }}
            >
              <PauseCircleOutlined style={{ fontSize: 24 }} />
            </div>
          ) : (
            <div
              className={styles.actionBtn}
              onClick={() => {
                setShowVideo(true);
                setPlay(true);
              }}
            >
              <PlayCircleFilled style={{ fontSize: 24 }} />
            </div>
          )}
          <div className={styles.processBar} style={{ flex: 1 }}>
            <Slider
              // disabled={!showVideo}
              max={duration}
              value={currentTime}
              onChange={onSliderChange}
              tooltip={{
                formatter: (value: number) => {
                  try {
                    return (
                      <span>
                        {formatTime(value)}/{formatTime(duration)}
                      </span>
                    );
                  } catch (e) {
                    return value;
                  }
                },
              }}
            />
          </div>
        </div>
      )}
    </div>);
});
