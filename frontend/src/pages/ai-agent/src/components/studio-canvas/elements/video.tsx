import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useContext,
} from "react";
import { Image, Group, Rect } from "react-konva";
import Konva from "konva";
import { useImage } from "react-konva-utils";
import Base, { getProps } from "./element";
import WorkingMask from "./workingMask";
import StaticLoading from "./StaticLoading";
import PortalContainer from "./portalContainer";
import { IconPlay } from "../icons";
import { useStore } from "@/stores/context";
import { CanvasContext } from "../context/canvas";
import VideoPlayer from "@/components/PictureEditor/videoPlayer";
import { Images } from "../theme";
import { TypeLayer } from "../types.d";
import "xgplayer/dist/index.min.css";
import { $t } from '@/i18n';

interface EditRect {
  lt: { x: number; y: number };
  rt: { x: number; y: number };
  lb: { x: number; y: number };
  rb: { x: number; y: number };
}

type TypeImageProps = TypeLayer & {
  onLoad?: (props: { width: number; height: number }) => void;
  showPlayIcon?: boolean;
  poster?: string;
  onPlay?: () => void;
  watermark?: boolean;
};

enum EnumEditeState {
  addChat = "addChat",
  play = "play",
}

const calcEditRect = (rect: {
  x: number;
  y: number;
  width: number;
  height: number;
}) => {
  const lt = { x: rect.x, y: rect.y };
  const rt = { x: rect.x + rect.width, y: rect.y };
  const lb = { x: rect.x, y: rect.y + rect.height };
  const rb = { x: rect.x + rect.width, y: rect.y + rect.height };

  return { lt, rt, lb, rb };
};

const isRectChanged = (
  editRect1: EditRect | undefined,
  editRect2: EditRect | undefined
): boolean => {
  if (!editRect1 || !editRect2) {
    return true;
  }

  return (
    editRect1.lt.x !== editRect2.lt.x ||
    editRect1.lt.y !== editRect2.lt.y ||
    editRect1.rt.x !== editRect2.rt.x ||
    editRect1.rt.y !== editRect2.rt.y ||
    editRect1.lb.x !== editRect2.lb.x ||
    editRect1.lb.y !== editRect2.lb.y ||
    editRect1.rb.x !== editRect2.rb.x ||
    editRect1.rb.y !== editRect2.rb.y
  );
};

const VideoCover = forwardRef<any, TypeImageProps>((props, ref) => {
  const {
    attributes,
    showPlayIcon = true,
    poster,
    onPlay,
    onLoad,
    watermark,
    ...extProps
  } = props || {};
  const [image] = useImage(poster || "", "anonymous");
  const [playIcon] = useImage(Images.videoPlayIcon);
  const [width, setWidth] = useState(extProps.width || 0);
  const [height, setHeight] = useState(extProps.height || 0);
  const [showMask, setShowMask] = useState(true);
  const waterMarkImage = useImage(
    Images.watermark,
    "anonymous"
  )[0] as unknown as CanvasImageSource;
  const widthForHeightRatio = 34 / 25; // 水印宽高比
  const playIconSize = 0.2 * Math.min(width, height);

  useEffect(() => {
    const loadData = {
      width,
      height,
    };

    // img对象
    if (image?.naturalWidth && !extProps.width) {
      setWidth(image.naturalWidth);
      loadData.width = image.naturalWidth;
    }

    if (image?.naturalHeight && !extProps.height) {
      setHeight(image.naturalHeight);
      loadData.height = image.naturalHeight;
    }

    if (image?.naturalWidth || image?.naturalHeight) {
      setShowMask(false);
    }

    onLoad?.(loadData);
  }, [image]);

  return (
    <Group>
      {image ? (
        <Image
          ref={ref}
          {...extProps}
          image={image}
          width={width}
          height={height}
        />
      ) : (
        <StaticLoading
          ref={ref}
          {...extProps}
          width={width || extProps.width || 240}
          height={height || extProps.height || 240}
        />
      )}
      {showMask && image && (
        <Rect width={width} height={height} fill="rgba(255, 255, 255, .2)" />
      )}
      {showPlayIcon && (
        <Image
          x={(width - playIconSize) / 2}
          y={(height - playIconSize) / 2}
          image={playIcon}
          width={playIconSize}
          height={playIconSize}
          onPointerEnter={(e) => {
            const container = e.target?.getStage()?.container();
            if (container) {
              container.style.cursor = 'pointer';
            }
          }}
          onPointerLeave={(e) => {
            const container = e.target?.getStage()?.container();
            if (container) {
              container.style.cursor = 'default';
            }
          }}
          onClick={() => {
            onPlay?.();
          }}
        />
      )}

      {/* AI水印 */}
      {!!watermark && (
        <Image
          x={0.01 * width}
          y={0.01 * height}
          width={0.1 * width}
          height={(0.1 * width) / widthForHeightRatio}
          image={waterMarkImage}
        />
      )}
    </Group>
  );
});

const Element = forwardRef((props: TypeLayer, outRef: any) => {
  const store = useStore();
  const { id, loading } = props;
  const { baseProps, childrenProps } = getProps(props);
  const { src, poster, watermark } = childrenProps?.attributes || {};
  const ref = useRef<Konva.Node>();
  const canvasContext = useContext(CanvasContext);
  const selectedIds = canvasContext?.selectedIds || [];
  const [editState, setEditState] = useState<EnumEditeState | null>(null);
  const [curPoster, setCurPoster] = useState(poster);

  const baseRef = useRef<any>(null);
  const videoRef = useRef<any>();

  const pointsRef = useRef<{
    lt: { x: number; y: number };
    rt: { x: number; y: number };
    lb: { x: number; y: number };
    rb: { x: number; y: number };
  }>({
    lt: { x: 0, y: 0 },
    rt: { x: 0, y: 0 },
    lb: { x: 0, y: 0 },
    rb: { x: 0, y: 0 },
  });

  const isOnlySelected = !!(selectedIds?.length === 1 && id && selectedIds?.includes(id));

  const handleMenuClick = ({ key }: { key: EnumEditeState }) => {
    switch (key) {
      case EnumEditeState.addChat:
        store.addImagesToChat([
          {
            url: src || "",
            width: baseProps.width || 0,
            height: baseProps.height || 0,
          },
        ]);
      case EnumEditeState.play:
        videoRef.current?.play();
        break;
    }
    setEditState(key);
  };

  const handleMenuAction = async (key: EnumEditeState, params: string | Record<string, any>, batchIds?: string[]) => {
    switch (key) {
      case EnumEditeState.play:
        if (batchIds?.length) {
          return;
        }
        break;
    }
  };

  // 注册菜单点击事件
  const _ref = canvasContext.getRef(id as string);
  if (_ref) {
    _ref.onMenuClick = handleMenuClick;
    _ref.handleMenuAction = handleMenuAction;

    _ref.loading = (loading: boolean) => {
      // 通过更新元素属性来触发图片的loading状态
      canvasContext.updateElement(props.id as string, {
        attributes: {
          ...props.attributes,
        },
        loading: !!loading,
      });
    };

    _ref.getData = () => {
      return {
        id: props.id,
        type: "video",
        watermark,
        src,
        width: baseProps.width,
        height: baseProps.height,
        downloadData: src,
      };
    };
  }

  useEffect(() => {
    if (selectedIds?.length !== 1 || !id || !selectedIds?.includes(id)) {
      setEditState(null);
    }
  }, [selectedIds, id]);

  return (
    <Base
      {...baseProps}
      ref={baseRef}
    >
      <VideoCover
        {...childrenProps}
        ref={ref}
        width={baseProps.width}
        height={baseProps.height}
        poster={curPoster}
        watermark={!!watermark}
        onPlay={() => {
          videoRef.current?.play();
        }}
      />

      {!!loading && <WorkingMask parentRef={baseRef.current?.ref} />}

      <PortalContainer
        className="studio-element-menu"
        parentRef={baseRef.current?.ref}
        transformFunc={(points) => {
          pointsRef.current = points;
          return {
            "--left": (points?.lt?.x || 0) + "px",
            "--right": (points?.rt?.x || 0) + "px",
            "--top": (points?.lt?.y || 0) + "px",
            "--bottom": (points?.lb?.y || 0) + "px",
            "--width": (points?.rt?.x || 0) - (points?.lt?.x || 0) + "px",
            "--height": (points?.lb?.y || 0) - (points?.lt?.y || 0) + "px",
          };
        }}
      >
        <VideoPlayer
          ref={videoRef}
          id={id || ""}
          attributes={childrenProps.attributes || {}}
          onScreenShot={(url) => {
            setCurPoster(url);
          }}
          showControls={isOnlySelected}
        />
      </PortalContainer>
    </Base>
  );
});

(Element as any).icon = "▶️";
(Element as any).displayName = $t("global-1688-ai-app.studio-canvas.elements.video.video", "视频");
(Element as any).getMenu = (isBatch?: boolean) => {
  return [
    !isBatch && {
      key: "play",
      label: $t("global-1688-ai-app.studio-canvas.elements.video.bf", "播放"),
      icon: <IconPlay width={14} height={14} />,
    },
  ].filter(Boolean);
};

export default Element;
