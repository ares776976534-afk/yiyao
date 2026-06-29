import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
  forwardRef,
  useContext,
} from "react";
import { Button } from "antd";
import { Image, Group, Rect } from "react-konva";
import Konva from "konva";
import { useImage } from "react-konva-utils";
import { toJS } from "mobx";
import useToast from "@/components/Toast";
import ImageIcon from "@/components/Icons/ImageIcon";
import Base, { getProps } from "./element";
import WorkingMask from "./workingMask";
import StaticLoading from "./StaticLoading";
import PortalContainer from "./portalContainer";
import { CanvasContext } from "../context/canvas";
import { Modify, TranslateOffer } from "@/components/PictureEditor";
import { getElementDefinition } from "./define";
import {
  IconPic,
  IconHighQuality,
  IconRemoveWatermark,
  IconCutout,
  IconAddChat,
  IconTranslate,
  IconSplitLayer,
} from "../icons";
import { useStore } from "@/stores/context";
import { Images } from "../theme";
import { TypeLayer } from "../types.d";
import {
  waterMarkRemove,
  imageEnlargement,
  image2Image,
  imageObjectExtraction,
  splitLayer,
  imageTranslate,
} from "@/services";
import { calcImageSize } from "../utils/calc";
import styles from "./element.module.scss";
import { $t } from '@/i18n';

interface TypeImageData {
  width: number;
  height: number;
}

type TypeImageProps = TypeLayer & {
  onLoad?: (props: TypeImageData) => void;
};

enum EnumEditeState {
  highQuality = "highQuality",
  editImage = "editImage",
  editText = "editText", // AI改字，暂时用不上
  translate = "translate",
  removeWatermark = "removeWatermark",
  addChat = "addChat",
  cutout = "cutout", // 抠图
  splitLayer = "splitLayer", // 分离图层
}

const handleSplitLayerResponse = (content) => {
  const typeMap = {
    bg: 'image',
    img: 'image',
    text: 'text',
  };

  const group = JSON.parse(content)?.templateConf?.[0];

  const elementData = {
    type: 'relativeFragments',
    width: group.width,
    height: group.height,
    children: group.layers?.map((layer) => {
      const item = {
        type: typeMap[layer.layerType] || layer.layerType,
        visible: `${layer.hidden}` !== 'true',
        x: layer.left,
        y: layer.top,
        width: layer.width,
        height: layer.height,
        opacity: layer.opacity || 1,
        rotation: layer.rotate || 0,
      };

      if (item.type === 'image') {
        item.attributes = {
          src: layer.url,
        };
      } else if (item.type === 'text') {
        delete item.width;
        delete item.height;

        Object.assign(item, {
          text: layer.text,
          textDecoration: layer.underline ? 'underline' : layer.lineThrough ? 'line-through' : 'none',
          fontSize: layer.fontSize,
          fontStyle: layer.bold ? 'bold' : layer.italic ? 'italic' : 'normal',
          fontFamily: layer.fontFamily,
          fontUrl: layer.fontUrl,
          lineHeight: (layer.lineSpacing / layer.fontSize) || 1,
          fill: layer.color,
          align: layer.textAlign,
        });
      }

      return item;
    })
  };

  return elementData;
};

const imageCache: Record<string, CanvasImageSource> = {};

const Img = forwardRef((props: TypeImageProps, imgRef: any) => {
  const { attributes, onLoad, ...extProps } = props || {};
  const { src } = attributes || {};

  const imageData = calcImageSize(
    src instanceof window.Image
      ? src
      : ({ width: 0, height: 0 } as HTMLImageElement),
    extProps as TypeImageData
  );

  const _image = useImage(src, "anonymous")[0];

  const image =
    src instanceof window.Image
      ? src
      : typeof src === "string" && imageCache[src]
        ? imageCache[src]
        : _image;

  const [width, setWidth] = useState(imageData.width || 0);
  const [height, setHeight] = useState(imageData.height || 0);

  useEffect(() => {
    if (!image) {
      return;
    }

    if (typeof src === "string") {
      imageCache[src] = image;
    }

    const loadData = calcImageSize(
      image as HTMLImageElement,
      extProps as TypeImageData
    );

    setWidth(loadData.width);
    setHeight(loadData.height);
    onLoad?.(loadData);
  }, [image]);

  return image ? (
    <Image
      ref={imgRef}
      {...extProps}
      image={image}
      width={width}
      height={height}
    />
  ) : (
    <StaticLoading
      ref={imgRef}
      {...extProps}
      width={width || extProps.width || 240}
      height={height || extProps.height || 240}
    />
  );
});

const Element = forwardRef((props: TypeLayer, outerRef: any) => {
  const store = useStore();
  const { id, loading } = props;
  const { baseProps, childrenProps } = getProps(props);
  const { src, watermark, relateData, relateSourceData } =
    childrenProps?.attributes || {};
  const baseRef = useRef<any>(null);
  const imgRef = useRef<Konva.Node>();

  const toastHandleKey = `${id}_handleMenuAction`;

  const canvasContext = useContext(CanvasContext);
  const {
    selectedIds,
    isGrabbing,
    isDragging,
    isDrawingRect,
    isTransforming,
    isScaling,
    isMoving,
  } = canvasContext;

  // 频繁操作
  const quikChange =
    isGrabbing ||
    isDragging ||
    isDrawingRect ||
    isTransforming ||
    isScaling ||
    isMoving;

  const [editState, setEditState] = useState<EnumEditeState>();
  const [editBatchIds, setEditBatchIds] = useState<string[]>();
  const [imgWidth, setImgWidth] = useState(baseProps.width || 0);
  const [imgHeight, setImgHeight] = useState(baseProps.height || 0);
  const toast = useToast();
  const [watermarkImage] = useImage(Images.watermark, "anonymous");

  // 唯一选中的元素
  const isOnlySelected =
    selectedIds?.length === 1 && id && selectedIds.includes(id);

  const handleMenuAction = async (key: EnumEditeState, params: string | Record<string, any>, batchIds?: string[]) => {
    // 批量操作
    if (batchIds?.length) {
      batchIds.forEach((batchId) => {
        const _ref = canvasContext.getRef(batchId);

        if (_ref) {
          const data = _ref.getData?.();
          _ref?.handleMenuAction?.(key, typeof params === 'string' ? data.src : { ...params, imageUrl: data?.src });
        }
      });
      return;
    }

    const fns = {
      // 高清
      [EnumEditeState.highQuality]: {
        handle: imageEnlargement,
        handlingMessage: $t("global-1688-ai-app.studio-canvas.elements.image.iMy", "图片修改中"),
        errorMessage: $t("global-1688-ai-app.studio-canvas.elements.image.clfailed", "处理失败"),
      },
      // 改图
      [EnumEditeState.editImage]: {
        handle: image2Image,
        handlingMessage: $t("global-1688-ai-app.studio-canvas.elements.image.iMy", "图片修改中"),
        errorMessage: $t("global-1688-ai-app.studio-canvas.elements.image.clfailed", "处理失败"),
      },
      // 抠图
      [EnumEditeState.cutout]: {
        handle: imageObjectExtraction,
        handlingMessage: $t("global-1688-ai-app.studio-canvas.elements.image.iMy", "图片修改中"),
        errorMessage: $t("global-1688-ai-app.studio-canvas.elements.image.clfailed", "处理失败"),
      },
      // 分离图层
      [EnumEditeState.splitLayer]: {
        handle: splitLayer,
        handlingMessage: $t("global-1688-ai-app.studio-canvas.elements.image.iMy", "图片修改中"),
        errorMessage: $t("global-1688-ai-app.studio-canvas.elements.image.clfailed", "处理失败"),
      },
      // 去水印
      [EnumEditeState.removeWatermark]: {
        handle: waterMarkRemove,
        handlingMessage: $t("global-1688-ai-app.studio-canvas.elements.image.iMy", "图片修改中"),
        errorMessage: $t("global-1688-ai-app.studio-canvas.elements.image.clfailed", "处理失败"),
      },
      // 翻译
      [EnumEditeState.translate]: {
        handle: imageTranslate,
        handlingMessage: $t("global-1688-ai-app.studio-canvas.elements.image.iMy", "图片修改中"),
        errorMessage: $t("global-1688-ai-app.studio-canvas.elements.image.clfailed", "处理失败"),
      },
    };
    const imageHandler = fns[key];

    // 菜单点击处理中
    const onHandleStart = () => {
      toast.loading(imageHandler.handlingMessage, {
        duration: 0,
        key: toastHandleKey,
      });
      canvasContext.updateElement(id as string, {
        attributes: {
          ...childrenProps?.attributes,
        },
        loading: true,
      });
    };

    // 菜单点击处理结束
    const onHandleEnd = () => {
      canvasContext.updateElement(id as string, {
        attributes: {
          ...childrenProps?.attributes,
        },
        loading: false,
      });
      toast.destroy(toastHandleKey);
    };

    onHandleStart();

    try {
      const taskId = await imageHandler.handle(params);

      // 异步任务结束后处理的回调函数
      const handleResult = (res: any) => {
        try {
          if (key === EnumEditeState.splitLayer) {
            const splitLayerResult = handleSplitLayerResponse(res?.content);
            canvasContext?.addElement(splitLayerResult, "inline");
          } else {
            const { mediaModel: { mediaCoverUrl, width, height } = {} } = res || {};
            if (mediaCoverUrl) {
              const relateSourceData = relateData
                ? {
                  ...relateData,
                  data: {
                    ...relateData.data,
                    src: mediaCoverUrl,
                  },
                }
                : null;

              canvasContext?.addElement(
                {
                  type: "image",
                  width,
                  height,
                  attributes: {
                    src: mediaCoverUrl,
                    watermark: true,
                    relateSourceData,
                  },
                },
                "inline"
              );
            } else {
              toast.error(imageHandler.errorMessage);
            }
          }

        } catch (e) {
          toast.error(e.message || imageHandler.errorMessage);
        }
        onHandleEnd();
      };

      if (taskId) {
        canvasContext?.addProcessingTask({
          id: taskId,
          type: key,
          callback: handleResult,
        });
      }
    } catch (e) {
      onHandleEnd();
      toast.error(e.message || imageHandler.errorMessage);
    }
  };

  const handleMenuClick = useCallback(
    ({ key }: { key: EnumEditeState }, batchIds?: string[]) => {
      setEditState(key);
      setEditBatchIds(batchIds);

      switch (key) {
        case EnumEditeState.highQuality:
          handleMenuAction(EnumEditeState.highQuality, src, batchIds);
          break;
        case EnumEditeState.editImage:
          break;
        case EnumEditeState.cutout:
          handleMenuAction(EnumEditeState.cutout, src, batchIds);
          break;
        case EnumEditeState.splitLayer:
          handleMenuAction(EnumEditeState.splitLayer, src, batchIds);
          break;
        case EnumEditeState.translate:
          return;
        case EnumEditeState.removeWatermark:
          handleMenuAction(EnumEditeState.removeWatermark, src, batchIds);
          break;
        case EnumEditeState.addChat:
          let chatContent = [{
            url: src,
            width: imgWidth,
            height: imgHeight,
          }];

          // 批量操作
          if (batchIds?.length) {
            chatContent = batchIds.map((batchId) => {
              const _ref = canvasContext.getRef(batchId);

              if (_ref) {
                const data = _ref.getData?.();

                return data && {
                  url: data.src,
                  width: data.width,
                  height: data.height
                };
              }
            }).filter(Boolean);
          }
          store.addImagesToChat(chatContent);
          break;
      }
    },
    [selectedIds, handleMenuAction, store, canvasContext]
  );

  const widthForHeightRatio = 34 / 25; // 水印宽高比

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
        type: "image",
        watermark,
        src,
        width: imgWidth,
        height: imgHeight,
        downloadData: src,
      };
    };
  }

  return (
    <Base
      {...baseProps}
      type="image"
      attributes={toJS(childrenProps.attributes)}
      ref={baseRef}
    >
      <Img
        {...childrenProps}
        ref={imgRef}
        width={imgWidth}
        height={imgHeight}
        onLoad={({ width, height }) => {
          setImgWidth(width);
          setImgHeight(height);
        }}
      />

      {/* AI水印 */}
      {!!watermark && (
        <Image
          x={0.01 * imgWidth}
          y={0.01 * imgHeight}
          width={0.1 * imgWidth}
          height={(0.1 * imgWidth) / widthForHeightRatio}
          image={watermarkImage}
        />
      )}

      {!!loading && <WorkingMask parentRef={baseRef.current?.ref} />}

      {/* AI改图编辑框 */}
      {!quikChange && !loading && editState === EnumEditeState.editImage && (
        <PortalContainer
          parentRef={baseRef.current?.ref}
          transformFunc={(points) => {
            return {
              left: points.lb.x + (points.rt.x - points.lt.x) / 2 + "px",
              top: points.lb.y + "px",
            };
          }}
        >
          <Modify
            type="modify"
            onClose={() => {
              setEditState(undefined);
            }}
            onOk={({ text }) => {
              handleMenuAction(EnumEditeState.editImage, {
                imageUrl: src,
                prompt: text,
              }, editBatchIds);
              setEditState(undefined);
              setEditBatchIds(undefined);
            }}
            disableCanvas={true}
          />
        </PortalContainer>
      )}

      {/* AI翻译编辑框 */}
      {!quikChange && editState === EnumEditeState.translate && (
        <PortalContainer
          parentRef={baseRef.current?.ref}
          transformFunc={(points) => {
            return {
              left: points.lb.x + (points.rt.x - points.lt.x) / 2 + "px",
              top: points.lb.y + "px",
            };
          }}
        >
          <TranslateOffer
            open
            type="translate"
            onOk={(params) => {
              handleMenuAction(EnumEditeState.translate, {
                imageUrl: src,
                sourceLanguage: "zh",
                targetLanguage: params.language,
              }, editBatchIds);
              setEditState(undefined);
              setEditBatchIds(undefined);
            }}
            onClose={() => {
              setEditState(undefined);
              setEditBatchIds(undefined);
            }}
          />
        </PortalContainer>
      )}

      {/* 商品图替换原素材按钮 */}
      {
        isOnlySelected && (
          <PortalContainer
            open={!!relateSourceData}
            parentRef={baseRef.current?.ref}
            style={{
              transform: `translateX(-50%)`,
              transformOrigin: "center center",
            }}
            transformFunc={(points) => {
              return {
                left: points.lb.x + (points.rt.x - points.lt.x) / 2 + "px",
                top: points.lb.y + 12 + "px",
              };
            }}
          >
            {!!relateSourceData?.used ? (
              <Button
                type="primary"
                className={`${isOnlySelected
                  ? styles.imageReplaceActionSelected
                  : styles.imageReplaceAction
                  }`}
                onClick={() => {
                  getElementDefinition("offer")?.replaceModule(
                    relateSourceData,
                    canvasContext
                  );

                  setTimeout(() => {
                    delete relateSourceData.used;
                    delete relateSourceData.beforeSrc;
                    canvasContext.updateElement(id, {
                      attributes: {
                        ...childrenProps?.attributes,
                        relateSourceData,
                      },
                    });
                    toast.success($t("global-1688-ai-app.studio-canvas.elements.image.clce", "取消替换原素材成功"));
                  }, 200);
                }}
              >
                <svg version="1.1" width="14" height="14" viewBox="0 0 14 14">
                  <defs>
                    <clipPath id="master_svg0_374_41746">
                      <rect x="0" y="0" width="14" height="14" rx="0" />
                    </clipPath>
                  </defs>
                  <g clipPath="url(#master_svg0_374_41746)">
                    <g>
                      <path
                        d="M7.960427938232422,1.9208244734970092L7.857307938232422,2.0239458734970093L3.1906379382324217,6.69061287349701C3.108597938232422,6.772662873497009,3.062497938232422,6.883942873497009,3.062497938232422,6.9999728734970095C3.062497938232422,7.116002873497009,3.108597938232422,7.22728287349701,3.1906379382324217,7.309332873497009L7.857307938232422,11.976022873497008L7.960427938232422,12.07912287349701C8.074327938232422,12.193022873497009,8.259007938232422,12.193022873497009,8.372907938232423,12.07912287349701L8.579147938232422,11.872922873497009C8.693047938232422,11.75897287349701,8.693047938232422,11.57430287349701,8.579147938232422,11.46040287349701L8.476027938232422,11.35728287349701L4.553797938232422,7.43505287349701L12.979167938232422,7.43505287349701L13.124967938232421,7.43505287349701C13.286067938232422,7.43505287349701,13.416667938232422,7.3044728734970095,13.416667938232422,7.143392873497009L13.416667938232422,6.8517228734970095C13.416667938232422,6.690632873497009,13.286067938232422,6.56005287349701,13.124967938232421,6.56005287349701L12.979167938232422,6.56005287349701L4.5586379382324225,6.56005287349701L8.476027938232422,2.642663873497009L8.579147938232422,2.539543873497009C8.693047938232422,2.4256408734970094,8.693047938232422,2.2409678734970093,8.579147938232422,2.127063873497009L8.372907938232423,1.9208236734970092C8.259007938232422,1.8069204734970092,8.074327938232422,1.8069208734970093,7.960427938232422,1.9208244734970092ZM0.7291692594724218,2.1874748734970093L0.7291699200824219,2.333308873497009L0.7291699200824219,11.66664287349701L0.7291692594724218,11.81247287349701C0.7291679382324219,11.973522873497009,0.8597519382324219,12.10412287349701,1.020835938232422,12.10412287349701L1.312503938232422,12.10412287349701C1.4735879382324217,12.10412287349701,1.6041709382324219,11.973522873497009,1.6041709382324219,11.81247287349701L1.6041699382324217,11.66664287349701L1.6041699382324217,2.333308873497009L1.6041709382324219,2.1874748734970093C1.6041709382324219,2.026391873497009,1.4735879382324217,1.8958069734970093,1.312503938232422,1.8958069734970093L1.020835938232422,1.8958069734970093C0.8597519382324219,1.8958069734970093,0.7291679382324219,2.026391873497009,0.7291692594724218,2.1874748734970093Z"
                        fill="currentColor"
                      />
                    </g>
                  </g>
                </svg>{$t("global-1688-ai-app.studio-canvas.elements.image.cancelthsc", "取消替换素材")}</Button>
            ) : (
              <Button
                type="primary"
                ghost={!isOnlySelected}
                className={`${isOnlySelected
                  ? styles.imageReplaceActionSelected
                  : styles.imageReplaceAction
                  }`}
                onClick={() => {
                  const beforeSrc = getElementDefinition("offer")?.replaceModule(
                    relateSourceData,
                    canvasContext
                  );

                  setTimeout(() => {
                    relateSourceData.used = true;
                    relateSourceData.beforeSrc = beforeSrc;
                    canvasContext.updateElement(id, {
                      attributes: {
                        ...childrenProps?.attributes,
                        relateSourceData,
                      },
                    });
                    toast.success($t("global-1688-ai-app.studio-canvas.elements.image.tss", "替换原素材成功"));
                  }, 200);
                }}
              >
                <ImageIcon />{$t("global-1688-ai-app.studio-canvas.elements.image.ygs", "用该图片替换原素材")}</Button>
            )}
          </PortalContainer>
        )
      }
    </Base>
  );
});

(Element as any).icon = "🖼";
(Element as any).displayName = $t("global-1688-ai-app.studio-canvas.elements.image.image", "图片");
(Element as any).getMenu = () => {
  return [
    {
      key: EnumEditeState.highQuality,
      label: $t("global-1688-ai-app.studio-canvas.elements.image.AIhighq", "AI高清"),
      icon: <IconHighQuality />,
    },
    {
      key: EnumEditeState.editImage,
      label: $t("global-1688-ai-app.studio-canvas.elements.image.AIgt", "AI改图"),
      icon: <IconPic />,
    },
    {
      key: EnumEditeState.cutout,
      label: $t("global-1688-ai-app.studio-canvas.elements.image.kt", "抠图"),
      icon: <IconCutout />,
    },
    {
      key: EnumEditeState.splitLayer,
      label: $t("global-1688-ai-app.studio-canvas.elements.image.tcfl", "图层分离"),
      icon: <IconSplitLayer />,
    },
    {
      key: EnumEditeState.translate,
      label: $t("global-1688-ai-app.studio-canvas.elements.image.AIfy", "AI翻译"),
      icon: <IconTranslate />,
    },
    {
      key: EnumEditeState.removeWatermark,
      label: $t("global-1688-ai-app.studio-canvas.elements.image.AIqsy", "AI去水印"),
      icon: <IconRemoveWatermark />,
    },
    {
      key: EnumEditeState.addChat,
      label: $t("global-1688-ai-app.studio-canvas.elements.image.adddlDay", "添加到聊天"),
      icon: <IconAddChat />,
    },
  ];
};

export default Element;
