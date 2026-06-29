import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { v4 as uuidv4 } from 'uuid';
import Player, { Events } from "xgplayer";
import "xgplayer/dist/index.min.css";
import styles from "./index.module.scss";

interface XgPlayerProps {
  url: string;
  poster?: string;
  width?: number;
  height?: number;
  initCurrentTime?: number;
  options?: any;
  scale?: number;
  onReady?: () => void;
  onLoadedData?: (instance: any) => void;
  onTimeUpdate?: (instance: any) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
}
const XgPlayer = forwardRef((props: XgPlayerProps, ref) => {
  const {
    url,
    poster,
    width,
    height,
    initCurrentTime,
    scale = 1,
    options = {},
    onReady = () => {},
    onLoadedData = () => {},
    onTimeUpdate = () => {},
    onPlay = () => {},
    onPause = () => {},
    onEnded = () => {},
  } = props;
  const playerId = uuidv4();
  const player = useRef<any>();
  const shotInstance = useRef<any>();
  const baseScale = useRef<number>(1);

  useImperativeHandle(
    ref,
    () => ({
      play: () => {
        player.current.play();
      },
      pause: () => {
        player.current.pause();
      },
      screenShot: () => {
        return shotInstance.current
        ?.shot(width, height, {
          quality: 1,
        });
      },
      destroy: () => {
        player.current.destroy();
      },
      setCurrentTime: (currentTime: number) => {
        player.current.currentTime = currentTime;
      },
      instance: player.current,
    }),
    [shotInstance.current, player.current]
  );

  useEffect(() => {
    if (url) {
      initPlayer();
    }
  }, [url]);

  useEffect(() => {
    player.current?.resize?.();
  }, [width, height]);

  useEffect(() => {
    return () => {
      setTimeout(() => {
        player.current.destroy();
      }, 100);
    };
  }, []);

  const initPlayer = () => {
    const container = document.getElementById(playerId);
    if (container && url) {
      baseScale.current = scale;
      player.current = new Player({
        id: playerId,
        url,
        poster,
        autoplay: false,
        autoplayMuted: false,
        // muted: true,
        playsinline: true,
        width,
        height,
        videoFillMode: "contain",
        dynamicBg: {
          disable: false,
        },
        screenShot: true, //显示截图按钮
        videoAttributes: {
          crossOrigin: "anonymous",
        },
        keyboard: {
          disableBodyTrigger: true,
        },
        enableContextmenu: false,
        ...options,
      });

      // player.current.usePluginHooks('error', 'showError', (plugin) =>{
      //   // 自定义错误提示
      //   const errorDiv = document.createElement('div');
      //   errorDiv.innerHTML = ``;
      //   plugin.parent.appendChild(errorDiv);

      //   // 去掉默认错误提示
      //   return false;
      // });

      if (initCurrentTime) {
        player.current.currentTime = initCurrentTime;
      }

      player.current.on(Events.READY, onReady);

      player.current.on(Events.LOADED_DATA, () => {
        shotInstance.current = player.current.getPlugin("screenshot");
        onLoadedData?.(player.current);
      });

      player.current.on(Events.TIME_UPDATE, () =>
        onTimeUpdate?.(player.current)
      );

      player.current.on(Events.PLAY, onPlay);

      player.current.on(Events.PAUSE, onPause);

      player.current.on(Events.ENDED, onEnded);
    }
  };

  return (
    <div
      id={playerId}
      style={{
        ...(baseScale.current ? {
          transform: `scale(${scale / baseScale.current})`,
          transformOrigin: "top left",
        } : {}),
      }}
      className={styles.player}
    />
  );
});

export default XgPlayer;
