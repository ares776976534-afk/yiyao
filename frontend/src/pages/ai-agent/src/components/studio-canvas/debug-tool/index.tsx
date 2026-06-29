import React, { useState, useCallback, useEffect, useContext } from 'react';
import { Input, Button, message, Select } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { observer } from "mobx-react-lite"
import { CanvasContext } from '../context/canvas';
import { TypeLayer } from '../types.d';
import * as mockOfferData from '@/components/LayerOfferElement/mock';
import { calcOfferInfoSize } from "@/components/LayerOfferElement/calcOffer";
import useToast from "@/components/Toast";
import styles from './index.module.scss';

const { Option } = Select;

function delay(t = 50) {
  return new Promise((res, rej) => {
    setTimeout(() => {
      res?.(null);
    }, t);
  });
}

export interface DebugToolProps {
}

// 边缘吸附状态
type EdgePosition = 'none' | 'left' | 'right' | 'top' | 'bottom';

// 展开方向配置
type ExpandDirection = 'up' | 'down' | 'left' | 'right' | 'up-left' | 'up-right' | 'down-left' | 'down-right';

const DebugTool: React.FC<DebugToolProps> = observer(({
}) => {
  const toast = useToast();
  const canvasContext = useContext(CanvasContext);
  const elements = canvasContext?.canvas?.elements || [];
  const selectedIds = canvasContext.selectedIds || [];

  const [debugPanelVisible, setDebugPanelVisible] = useState(false);

  const [intent, setIntent] = useState<string>(window.aiIntent);

  const elementOptions = [
    { value: 'relativeFragments', label: "虚拟分组" },
    { value: 'AmazonOffer', label: "亚马逊商品" },
    { value: 'offer', label: "商品" },
    { value: 'noSkuImageOffer', label: "无SKU图片商品" },
    { value: 'jaOffer', label: "日文商品" },
    { value: 'image', label: "图片" },
    { value: 'imageLoading', label: "图片加载中" },
    { value: 'largeImage', label: "超大图片" },
    { value: 'video', label: "视频" },
    { value: 'rect', label: "矩形" },
    { value: 'group', label: "分组" },
    { value: 'text', label: "文本" },
    { value: 'empty', label: 'empty' },
  ]
  const [elementType, setElementType] = useState<string>('image');
  const [textInput, setTextInput] = useState('');
  const [isViewportMaskVisible, setIsViewportMaskVisible] = useState(false);
  const [insertMethod, setInsertMethod] = useState<'block' | 'inline'>('block');

  // 拖拽状态管理
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [panelPosition, setPanelPosition] = useState(() => {
    // 默认位置：吸附在右侧屏幕边缘，距离顶部150px
    const { innerWidth } = window;
    const iconSize = 56;
    const visiblePart = 24;
    return { x: innerWidth - visiblePart, y: 150 }; // 吸附在右边缘
  });
  const [dragStarted, setDragStarted] = useState(false);

  // 边缘吸附状态 - 默认吸附在右边
  const [edgeSnapped, setEdgeSnapped] = useState<EdgePosition>('right');

  // 展开方向配置 - 默认从右边缘向左展开
  const [expandDirection, setExpandDirection] = useState<ExpandDirection>('left');

  // 智能检测展开方向
  const detectExpandDirection = useCallback((position: { x: number; y: number }): ExpandDirection => {
    const { innerWidth, innerHeight } = window;
    const panelWidth = 300;
    const panelHeight = 300;
    const threshold = 150;

    const rightSpace = innerWidth - position.x;
    const leftSpace = position.x;
    const bottomSpace = innerHeight - position.y;
    const topSpace = position.y;

    const canExpandDown = bottomSpace > panelHeight + threshold;
    const canExpandUp = topSpace > panelHeight + threshold;
    const canExpandRight = rightSpace > panelWidth + threshold;
    const canExpandLeft = leftSpace > panelWidth + threshold;

    if (canExpandDown && canExpandRight) {
      return position.x < innerWidth / 2 ? 'down-right' : 'down-left';
    } else if (canExpandUp && canExpandRight) {
      return position.x < innerWidth / 2 ? 'up-right' : 'up-left';
    } else if (canExpandDown) {
      return 'down';
    } else if (canExpandUp) {
      return 'up';
    } else if (canExpandRight) {
      return 'right';
    } else if (canExpandLeft) {
      return 'left';
    } else {
      if (bottomSpace >= topSpace && rightSpace >= leftSpace) {
        return 'down-right';
      } else if (topSpace >= bottomSpace && rightSpace >= leftSpace) {
        return 'up-right';
      } else if (bottomSpace >= topSpace && leftSpace >= rightSpace) {
        return 'down-left';
      } else {
        return 'up-left';
      }
    }
  }, []);

  // 调整面板位置确保在可视区域内
  const adjustPositionToViewport = useCallback((position: { x: number; y: number }, isExpanded: boolean = false) => {
    const { innerWidth, innerHeight } = window;
    const panelWidth = isExpanded ? 300 : 120;
    const panelHeight = isExpanded ? 300 : 48;
    const margin = 12;

    let adjustedX = position.x;
    let adjustedY = position.y;

    if (adjustedX + panelWidth + margin > innerWidth) {
      adjustedX = innerWidth - panelWidth - margin;
    }
    if (adjustedX < margin) {
      adjustedX = margin;
    }
    if (adjustedY + panelHeight + margin > innerHeight) {
      adjustedY = innerHeight - panelHeight - margin;
    }
    if (adjustedY < margin) {
      adjustedY = margin;
    }

    return { x: adjustedX, y: adjustedY };
  }, []);

  // 检测是否应该吸附到边缘
  const checkEdgeSnapping = useCallback((position: { x: number; y: number }) => {
    const { innerWidth, innerHeight } = window;
    const snapThreshold = 10;
    const iconSize = 56;
    const visiblePart = 24;

    let snappedPosition = { ...position };
    let edgePosition: EdgePosition = 'none';

    if (position.x <= snapThreshold) {
      snappedPosition.x = -iconSize + visiblePart;
      snappedPosition.y = Math.max(12, Math.min(position.y, innerHeight - iconSize - 12));
      edgePosition = 'left';
    } else if (position.x + iconSize >= innerWidth - snapThreshold) {
      snappedPosition.x = innerWidth - visiblePart;
      snappedPosition.y = Math.max(12, Math.min(position.y, innerHeight - iconSize - 12));
      edgePosition = 'right';
    } else if (position.y <= snapThreshold) {
      snappedPosition.x = Math.max(12, Math.min(position.x, innerWidth - iconSize - 12));
      snappedPosition.y = -iconSize + visiblePart;
      edgePosition = 'top';
    } else if (position.y + iconSize >= innerHeight - snapThreshold) {
      snappedPosition.x = Math.max(12, Math.min(position.x, innerWidth - iconSize - 12));
      snappedPosition.y = innerHeight - visiblePart;
      edgePosition = 'bottom';
    }

    return { position: snappedPosition, edge: edgePosition };
  }, []);

  // 根据边缘位置智能选择展开方向
  const getExpandDirectionFromEdge = useCallback((edge: EdgePosition): ExpandDirection => {
    switch (edge) {
      case 'left':
        return 'right';
      case 'right':
        return 'left';
      case 'top':
        return 'down';
      case 'bottom':
        return 'up';
      default:
        return 'down';
    }
  }, []);

  // 拖拽事件处理
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.debug-panel-header')) {
      setIsDragging(true);
      setDragStarted(false);
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;

      const dragDistance = Math.sqrt(
        Math.pow(newX - panelPosition.x, 2) + Math.pow(newY - panelPosition.y, 2),
      );

      if (dragDistance > 5) {
        setDragStarted(true);
      }

      setPanelPosition({ x: newX, y: newY });
    }
  }, [isDragging, dragOffset, panelPosition]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      const { position: snappedPosition, edge } = checkEdgeSnapping(panelPosition);

      if (edge !== 'none') {
        setPanelPosition(snappedPosition);
        setEdgeSnapped(edge);
        setDebugPanelVisible(false);
        const edgeDirection = getExpandDirectionFromEdge(edge);
        setExpandDirection(edgeDirection);
      } else {
        if (edgeSnapped !== 'none') {
          setEdgeSnapped('none');
          setDebugPanelVisible(false);
        }

        const adjustedPosition = adjustPositionToViewport(panelPosition, debugPanelVisible);
        setPanelPosition(adjustedPosition);

        const newDirection = detectExpandDirection(adjustedPosition);
        setExpandDirection(newDirection);
      }
    }
    setIsDragging(false);
    setTimeout(() => setDragStarted(false), 100);
  }, [isDragging, panelPosition, debugPanelVisible, edgeSnapped, adjustPositionToViewport, detectExpandDirection, checkEdgeSnapping, getExpandDirectionFromEdge]);


  // 使用新的插入方式参数
  const configs = {
    relativeFragments: {
      type: 'relativeFragments',
      width: 1024,
      height: 1024,
      x: 200,
      y: 1000,
      children: [
        {
          type: 'image',
          id: 'v1',
          // loading: true,
          x: 200,
          y: 1000,
          width: 1024,
          height: 1024,
          attributes: {
            src: 'https://img.alicdn.com/imgextra/i3/6000000003382/O1CN01ItUsN41ar0aoh5uVV_!!6000000003382-2-cbu_global_ai_agent.png',
          },
        },
        {
          type: 'image',
          id: 'v2',
          x: 344,
          y: 107,
          width: 336,
          height: 709,
          attributes: {
            src: 'https://img.alicdn.com/imgextra/i3/6000000007383/O1CN01433TMA24PTFggYUWc_!!6000000007383-2-cbu_global_ai_agent.png',
          },
        },
        {
          type: 'image',
          id: 'v3',
          x: 402,
          y: 442,
          width: 215,
          height: 117,
          attributes: {
            src: 'https://img.alicdn.com/imgextra/i1/6000000004072/O1CN013dTUNE1fx1sVRzeWZ_!!6000000004072-2-cbu_global_ai_agent.png',
          },
        },
        {
          type: 'image',
          id: 'v4',
          x: 418,
          y: 469,
          width: 190,
          height: 65,
          attributes: {
            src: 'https://img.alicdn.com/imgextra/i1/6000000005752/O1CN01WBzePO1sMTGivbx6L_!!6000000005752-2-cbu_global_ai_agent.png',
          },
        },
      ]
    },
    AmazonOffer: {
      type: 'offer',
      attributes: { offerData: JSON.parse(JSON.stringify(mockOfferData.AmazonOffer)) },
    },
    offer: {
      type: 'offer',
      attributes: { offerData: JSON.parse(JSON.stringify(mockOfferData.offer)) },
    },
    jaOffer: {
      type: 'offer',
      attributes: { offerData: JSON.parse(JSON.stringify(mockOfferData.jaOffer)) },
    },
    noSkuImageOffer: {
      type: 'offer',
      attributes: { offerData: JSON.parse(JSON.stringify(mockOfferData.noSkuImageOffer)) },
    },
    line: {
      type: 'rect',
      x: (260 + 200) / 2,
      y: 0,
      width: 1,
      height: 360 + 100, // 矩形的高度
      fill: '#00ff00', // 绿色中心线
      stroke: '#00ff00',
      strokeWidth: 1,
    },
    group: {
      id: "group1",
      type: 'group',
      fill: 'yellow',
      width: 460,
      height: 460,
      draggable: true,

      onDragEnter: (e: any) => {
        console.log('group1 dragEnter')
      },
      onDragOver: (e: any) => {
        console.log('group1 dragOver', e);
      },
      onDragLeave: (e: any) => {
        console.log('group1 dragLeave', e);
      },
      onDrop: (e: any) => {
        console.log('group1 drop', e);
      },

      children: [
        {
          id: "group1-image1",
          type: 'image',
          width: 160,
          height: 160,
          attributes: {
            src: 'https://img.alicdn.com/imgextra/i2/O1CN01IdRr3l1EQW59IFVhF_!!6000000000346-2-tps-160-160.png',
            watermark: true,
          },
        },
        {
          id: "group1-rect1",
          type: 'rect',
          x: 260,
          y: 360,
          width: 200,
          height: 100,
          fill: 'rgba(102, 126, 234, 0.8)',
        },
        // 水平中心线
        {
          type: 'rect',
          x: 0,
          y: (360 + 100) / 2,
          width: 260 + 200,
          height: 1,
          fill: '#ff0000', // 红色中心线
          stroke: '#ff0000',
          strokeWidth: 1,
        },
        // 垂直中心线
        {
          type: 'rect',
          x: (260 + 200) / 2,
          y: 0,
          width: 1,
          height: 360 + 100, // 矩形的高度
          fill: '#00ff00', // 绿色中心线
          stroke: '#00ff00',
          strokeWidth: 1,
        },
      ],
    },
    nestGroup: {
      type: 'group',
      fill: 'yellow',
      width: 300,
      height: 250,
      children: [
        {
          id: 'nestGroup1',
          type: 'group',
          fill: 'blue',
          width: 100,
          height: 100,
          children: [
            {
              id: 'nestGroup1-1',
              type: 'rect',
              width: 100,
              height: 100,
              fill: 'rgba(102, 126, 234, 0.8)',
            }
          ],
        },
        {
          id: 'nestGroup2',
          type: 'rect',
          x: 200,
          y: 150,
          width: 100,
          height: 100,
          fill: 'rgba(193, 234, 82, 0.8)',
        }
      ],
    },
    video: {
      type: 'video',
      attributes: {
        src: "https://alpha-material-agent.oss-accelerate.aliyuncs.com/video/17647550755661187296402.mp4",
        // poster: 'https://img.alicdn.com/imgextra/i4/O1CN01gUtWHb1l1DZsXPd8M_!!6000000004758-55-tps-32-32.svg',
      },
      width: 1248,
      height: 704,
    },
    largeImage: {
      type: 'image',
      width: 2048,
      height: 2048,
      attributes: {
        src: 'https://img.alicdn.com/imgextra/i1/O1CN01g12R8C1b2ut9Mhny4_!!6000000003408-0-tps-2048-2048.jpg',
        watermark: true,
      },
    },
    image: {
      id: 'a',
      type: 'image',
      x: 500,
      width: 800,
      height: 800,
      attributes: {
        src: 'https://cbu01.alicdn.com/img/ibank/O1CN01F9eBcm25i4uufbsvj_!!2219798997559-0-cib.jpg',
        watermark: true,
        relateSourceData: {
          "type": "offer",
          "id": "offer1",
          "moduleId": "offer1-mainImage-0",
          "moduleName": "mainImage",
          "index": 0,
          "data": {
            "src": "https://alpha-material-agent.oss-cn-hangzhou.aliyuncs.com/image/1763114725306.jpeg"
          }
        }
      },
    },
    imageLoading: {
      id: 'imageLoading',
      type: 'image',
      width: 800,
      height: 800,
      loading: true,
      attributes: {
        src: 'https://cbu01.alicdn.com/img/ibank/O1CN01F9eBcm25i4uufbsvj_!!2219798997559-0-cib.jpg',
        watermark: true,
        relateSourceData: {
          "type": "offer",
          "id": "offer1",
          "moduleId": "offer1-mainImage-0",
          "moduleName": "mainImage",
          "index": 0,
          "data": {
            "src": "https://alpha-material-agent.oss-cn-hangzhou.aliyuncs.com/image/1763114725306.jpeg"
          }
        }
      },
    },
    text: {
      type: 'text',
      text: textInput || "我是一段文本",
      fontSize: 16,
      fontFamily: 'Arial',
      fill: '#f00',
      align: 'left',
      verticalAlign: 'middle',
      draggable: false,
      width: 100,
      height: 20
    },
    rect: {
      id: "rect1",
      type: 'rect',
      width: 100,
      height: 200,
      maxHeight: 100,
      fill: 'rgba(102, 126, 234, 0.8)',
      // stroke: '#667eea',
      // strokeWidth: 2,
    },
  };

  const handleAddElement = useCallback(() => {
    const newElement: TypeLayer = JSON.parse(JSON.stringify(configs[elementType]));
    const t = textInput ? textInput.trim() : '';

    switch (newElement.type) {
      case 'text':
        newElement.text = t;
        break;
      case 'image':
        if (t) {
          newElement.attributes.src = t;
        }

        break;
      case 'offer':
        if (t) {
          try {
            newElement.attributes.offerData = JSON.parse(t);
          } catch (e) { }
        }

        const offerModuleSize = calcOfferInfoSize(newElement.attributes!.offerData);
        newElement.attributes!.offerData._offerModuleSize = offerModuleSize;
        Object.assign(newElement, {
          width: offerModuleSize.width,
          height: offerModuleSize.height,
        });
        break;
    }

    canvasContext?.canvas.addElement(newElement, { insertMethod });
    setTextInput('');

    toast.success(`已添加${elementType === 'text' ? '文本' : '矩形'}图层 (${insertMethod === 'block' ? '块级' : '行内'}插入)`);
  }, [elementType, textInput, canvasContext, insertMethod]);

  const handleClearCanvas = useCallback(() => {
    canvasContext?.canvas.clear();
  }, [canvasContext]);

  // 设置焦点区域为整个画布
  const setFullViewport = useCallback(() => {
    const canvasRef = canvasContext?.canvas;

    if (canvasRef) {
      // 获取实际画布尺寸
      const stage = canvasRef.stage;
      if (stage) {
        const stageWidth = stage.width();
        const stageHeight = stage.height();

        canvasRef.setViewport({
          top: 0,
          bottom: stageHeight,
          left: 0,
          right: stageWidth,
        });

        toast.success(`焦点区域已设置为整个画布 (${stageWidth}x${stageHeight})`);
      } else {
        toast.error('无法获取画布尺寸');
      }
    } else {
      toast.error('画布引用不可用');
    }
  }, [canvasContext]);

  // 设置焦点区域为自定义区域
  const setCustomViewport = useCallback(() => {
    const canvasRef = canvasContext?.canvas;
    if (canvasRef) {
      // 获取实际画布尺寸
      const stage = canvasRef.stage;
      if (stage) {
        const stageWidth = stage.width();
        const stageHeight = stage.height();

        // 按照比例计算自定义区域
        const leftOffset = 410; // 左边410px
        const topOffset = 20; // 上边20px
        const rightOffset = 260; // 右边260px
        const bottomOffset = 80; // 下边80px

        // 如果画布尺寸不够，按比例缩放
        const minRequiredWidth = leftOffset + rightOffset;
        const minRequiredHeight = topOffset + bottomOffset;

        let actualLeft = leftOffset;
        let actualTop = topOffset;
        let actualRight = stageWidth - rightOffset;
        let actualBottom = stageHeight - bottomOffset;

        // 确保区域有效
        if (stageWidth < minRequiredWidth) {
          // 画布太窄，按比例调整
          const ratio = stageWidth / minRequiredWidth;
          actualLeft = leftOffset * ratio;
          actualRight = stageWidth - rightOffset * ratio;
        }

        if (stageHeight < minRequiredHeight) {
          // 画布太矮，按比例调整
          const ratio = stageHeight / minRequiredHeight;
          actualTop = topOffset * ratio;
          actualBottom = stageHeight - bottomOffset * ratio;
        }

        canvasRef.setViewport({
          top: actualTop,
          bottom: actualBottom,
          left: actualLeft,
          right: actualRight,
        });

        toast.success('焦点区域已设置为自定义区域');
      } else {
        toast.error('无法获取画布尺寸');
      }
    } else {
      toast.error('画布引用不可用');
    }
  }, [canvasContext]);

  // 获取当前焦点区域信息
  const toggleViewportMask = useCallback(() => {
    const newMaskVisible = !isViewportMaskVisible;
    setIsViewportMaskVisible(newMaskVisible);

    // if (onShowViewportMask) {
    //   onShowViewportMask(newMaskVisible);
    // }

    const canvasRef = canvasContext?.canvas;
    if (canvasRef) {
      const viewport = canvasRef?.getViewport();
      if (newMaskVisible) {
        toast.success(`焦点区域蒙版已显示 (${Math.round(viewport.right - viewport.left)}x${Math.round(viewport.bottom - viewport.top)})`);
      } else {
        toast.info("焦点区域蒙版已隐藏");
      }
    } else {
      toast.error('画布引用不可用');
    }
  }, [canvasContext, isViewportMaskVisible]);


  // 添加全局鼠标事件监听
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
    return undefined;
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // 初始化时设置展开方向 - 默认吸附在右边，向左展开
  useEffect(() => {
    const edgeDirection = getExpandDirectionFromEdge('right');
    setExpandDirection(edgeDirection);
  }, [getExpandDirectionFromEdge]);

  useEffect(() => {
    // return;

    setTimeout(async () => {
      return;
      canvasContext?.canvas.addElement(Object.assign(JSON.parse(JSON.stringify(configs.relativeFragments)), {
      }));

      return;
      canvasContext?.canvas.addElement(Object.assign(JSON.parse(JSON.stringify(configs.image)), {
        id: 'image1',
        x: 500, y: 100,
        width: 130, height: 130,
        attributes: {
          src: 'https://img.alicdn.com/imgextra/i3/O1CN01l6JAct1LmEDi5WpAY_!!6000000001341-2-tps-176-176.png',
          watermark: true,
        },
      }), { insertMethod: 'point', autoLocate: false, autoSelect: true });


      return;
      canvasContext?.canvas.addElement(Object.assign(JSON.parse(JSON.stringify(configs.image)), {
        id: 'image2', width: 130, height: 130, attributes: {
          src: 'https://img.alicdn.com/imgextra/i3/O1CN01KBVC3m1VtgpbSlkaK_!!6000000002711-2-tps-1024-1024.png',
        },
      }), { insertMethod: 'block' });
      // canvasContext?.canvas.addElement(Object.assign(JSON.parse(JSON.stringify(configs.text)), { id: 'text' }), { insertMethod });
      // canvasContext?.canvas.addElement(Object.assign(JSON.parse(JSON.stringify(configs.group)), { id: 'group1' }), { insertMethod });
      // canvasContext?.canvas.addElement(Object.assign(JSON.parse(JSON.stringify(configs.nestGroup)), { id: 'nestGroup' }), { insertMethod });

      return;
      const offerData = Object.assign(JSON.parse(JSON.stringify(configs.AmazonOffer)), { id: 'offer1' });
      const offerModuleSize = calcOfferInfoSize(offerData.attributes.offerData);
      offerData.attributes.offerData._offerModuleSize = offerModuleSize;

      canvasContext?.canvas.addElement([
        {
          ...offerData,
          width: offerModuleSize.width,
          height: offerModuleSize.height,
          maxHeight: 600,
        },
        // Object.assign(JSON.parse(JSON.stringify(configs.image)), {
        //   id: 'image1',
        // }),
      ], 'block');

      return;

      // 一次性添加多个矩形
      // canvasContext?.canvas.addElement([], { insertMethod });
      // await delay();

      await delay();

      canvasContext?.canvas.addElement([
        {
          "media_type": "image",
          "media_cover_url": "https://img.alicdn.com/imgextra/i4/6000000003118/O1CN015wIIoQ1Yu62UM0Wdj_!!6000000003118-0-cbu_global_ai_agent.jpg",
          "media_url": "https://img.alicdn.com/imgextra/i4/6000000003118/O1CN015wIIoQ1Yu62UM0Wdj_!!6000000003118-0-cbu_global_ai_agent.jpg",
          "width": 100,
          "height": 100,
          "id": "a1",
          "type": "image",
          "attributes": {
            "src": "https://img.alicdn.com/imgextra/i4/6000000003118/O1CN015wIIoQ1Yu62UM0Wdj_!!6000000003118-0-cbu_global_ai_agent.jpg",
            "watermark": true
          }
        },
        {
          "media_type": "image",
          "media_cover_url": "https://img.alicdn.com/imgextra/i4/6000000004800/O1CN01Vcn4GH1lKSDoApm9f_!!6000000004800-0-cbu_global_ai_agent.jpg",
          "media_url": "https://img.alicdn.com/imgextra/i4/6000000004800/O1CN01Vcn4GH1lKSDoApm9f_!!6000000004800-0-cbu_global_ai_agent.jpg",
          "width": 100,
          "height": 100,
          "id": "a2",
          "type": "image",
          "attributes": {
            "src": "https://img.alicdn.com/imgextra/i4/6000000004800/O1CN01Vcn4GH1lKSDoApm9f_!!6000000004800-0-cbu_global_ai_agent.jpg",
            "watermark": true
          }
        },
      ], { insertMethod: 'block' });
      canvasContext?.canvas.addElement([
        {
          "media_type": "image",
          "media_cover_url": "https://img.alicdn.com/imgextra/i2/6000000001154/O1CN01RAFn6U1KOaAM5lkjN_!!6000000001154-0-cbu_global_ai_agent.jpg",
          "media_url": "https://img.alicdn.com/imgextra/i2/6000000001154/O1CN01RAFn6U1KOaAM5lkjN_!!6000000001154-0-cbu_global_ai_agent.jpg",
          "width": 100,
          "height": 100,
          "id": "a3",
          "type": "image",
          "attributes": {
            "src": "https://img.alicdn.com/imgextra/i2/6000000001154/O1CN01RAFn6U1KOaAM5lkjN_!!6000000001154-0-cbu_global_ai_agent.jpg",
            "watermark": true
          }
        },
      ]);

      await delay();
      // await delay();
      canvasContext?.canvas.addElement([
        {
          "media_type": "image",
          "media_cover_url": "https://img.alicdn.com/imgextra/i3/6000000006097/O1CN01nelgzS1uuTv2e152p_!!6000000006097-0-cbu_global_ai_agent.jpg",
          "media_url": "https://img.alicdn.com/imgextra/i3/6000000006097/O1CN01nelgzS1uuTv2e152p_!!6000000006097-0-cbu_global_ai_agent.jpg",
          "width": 1125,
          "height": 1125,
          "id": "434080c6-75a7-4f5b-b6d7-8e90c00c614d",
          "type": "image",
          "attributes": {
            "src": "https://img.alicdn.com/imgextra/i3/6000000006097/O1CN01nelgzS1uuTv2e152p_!!6000000006097-0-cbu_global_ai_agent.jpg",
            "watermark": true
          }
        },
      ], { insertMethod: 'block' });

      return

      // 一次性添加多张图片
      window.addBatchImages = () => {
        canvasContext?.canvas.addElement([
          Object.assign(JSON.parse(JSON.stringify(configs.rect)), { id1: 'batch1', fill: 'rgba(255, 255, 255, 0.5)' }),
          Object.assign(JSON.parse(JSON.stringify(configs.rect)), { id1: 'batch2', }),
          // Object.assign(JSON.parse(JSON.stringify(configs.rect)), { id: 'batch3', }),
        ], 'block');
      };

      window.addBatchImages2 = () => {
        canvasContext?.canvas.addElement([
          // {
          //   "media_url": "https://cbu01.alicdn.com/imgextra/i1/6000000006962/O1CN01KgbeLu21IeVU8aMtB_!!6000000006962-0-cbu_global_ai_agent.jpg",
          //   "media_cover_url": "https://cbu01.alicdn.com/imgextra/i1/6000000006962/O1CN01KgbeLu21IeVU8aMtB_!!6000000006962-0-cbu_global_ai_agent.jpg",
          //   "media_type": "image",
          //   "url": "https://cbu01.alicdn.com/imgextra/i1/6000000006962/O1CN01KgbeLu21IeVU8aMtB_!!6000000006962-0-cbu_global_ai_agent.jpg",
          //   "width": 1920,
          //   "height": 1920,
          //   "type": "image",
          //   "attributes": {
          //     "src": "https://cbu01.alicdn.com/imgextra/i1/6000000006962/O1CN01KgbeLu21IeVU8aMtB_!!6000000006962-0-cbu_global_ai_agent.jpg",
          //     "watermark": false
          //   }
          // },
          {
            "media_url": "https://cbu01.alicdn.com/imgextra/i1/6000000007357/O1CN01tcAx5124DYx7eZg5Y_!!6000000007357-0-cbu_global_ai_agent.jpg",
            "media_cover_url": "https://cbu01.alicdn.com/imgextra/i1/6000000007357/O1CN01tcAx5124DYx7eZg5Y_!!6000000007357-0-cbu_global_ai_agent.jpg",
            "media_type": "image",
            "url": "https://cbu01.alicdn.com/imgextra/i1/6000000007357/O1CN01tcAx5124DYx7eZg5Y_!!6000000007357-0-cbu_global_ai_agent.jpg",
            "width": 800,
            "height": 800,
            "type": "image",
            "attributes": {
              "src": "https://cbu01.alicdn.com/imgextra/i1/6000000007357/O1CN01tcAx5124DYx7eZg5Y_!!6000000007357-0-cbu_global_ai_agent.jpg",
              "watermark": false
            }
          },
        ], { insertMethod: 'block' });
      };

      window.addGroup = () => {
        canvasContext?.canvas.addElement([
          {
            id: "group1",
            type: 'group',
            fill: 'yellow',
            width: 460,
            height: 460,
            draggable: true,

            onDragEnter: (e: any) => {
              console.log('group1 dragEnter')
            },
            onDragOver: (e: any) => {
              console.log('group1 dragOver', e);
            },
            onDragLeave: (e: any) => {
              console.log('group1 dragLeave', e);
            },
            onDrop: (e: any) => {
              console.log('group1 drop', e);
            },

            children: [
              {
                id: "group1-image1",
                type: 'image',
                width: 160,
                height: 160,
                attributes: {
                  src: 'https://img.alicdn.com/imgextra/i2/O1CN01IdRr3l1EQW59IFVhF_!!6000000000346-2-tps-160-160.png',
                  watermark: true,
                },

                onDragEnter: (e: any) => {
                  console.log('group1-image1 dragEnter')
                },
                onDragOver: (e: any) => {
                  console.log('group1-image1 dragOver', e);
                },
                onDragLeave: (e: any) => {
                  console.log('group1-image1 dragLeave', e);
                },
                onDrop: (e: any) => {
                  console.log('group1-image1 drop', e);
                },
              },
              {
                id: "group1-rect1",
                type: 'rect',
                x: 260,
                y: 360,
                width: 200,
                height: 100,
                fill: 'rgba(102, 126, 234, 0.8)',

                onDragEnter: (e: any) => {
                  console.log('group1-rect1 dragEnter')
                },
                onDragOver: (e: any) => {
                  console.log('group1-rect1 dragOver', e);
                },
                onDragLeave: (e: any) => {
                  console.log('group1-rect1 dragLeave', e);
                },
                onDrop: (e: any) => {
                  console.log('group1-rect1 drop', e);
                },
              },
              // 水平中心线
              {
                type: 'rect',
                x: 0,
                y: (360 + 100) / 2,
                width: 260 + 200,
                height: 1,
                fill: '#ff0000', // 红色中心线
                stroke: '#ff0000',
                strokeWidth: 1,
              },
              // 垂直中心线
              {
                type: 'rect',
                x: (260 + 200) / 2,
                y: 0,
                width: 1,
                height: 360 + 100, // 矩形的高度
                fill: '#00ff00', // 绿色中心线
                stroke: '#00ff00',
                strokeWidth: 1,
              },
            ],
          },
          {
            type: 'image',
            width: 160,
            height: 160,
            attributes: {
              src: 'https://img.alicdn.com/imgextra/i2/O1CN01IdRr3l1EQW59IFVhF_!!6000000000346-2-tps-160-160.png',
            }
          }
        ], 'block', 'inline');
      }

      // window.addGroup();

      // addBatchImages();

      // 横向排列
      // canvasContext?.canvas.addElement(Object.assign(JSON.parse(JSON.stringify(configs.rect)), { id: 'rect0' }), { insertMethod });
      // canvasContext?.canvas.addElement(Object.assign(JSON.parse(JSON.stringify(configs.rect)), { id: 'rect1', width: 300, height: 200 }), { insertMethod: 'point' });
      // canvasContext?.canvas.addElement(Object.assign(JSON.parse(JSON.stringify(configs.rect)), { id: 'rect-row2', x: 630, y: 200 }), { insertMethod: 'point' });
      // canvasContext?.canvas.addElement(Object.assign(JSON.parse(JSON.stringify(configs.rect)), { id: 'rect-row3', x: 860, y: 200 }), { insertMethod: 'point' });
      // canvasContext?.canvas.addElement(Object.assign(JSON.parse(JSON.stringify(configs.rect)), { id: 'rect-row4', x: 1090, y: 200 }), { insertMethod: 'point' });

      // 纵向排列
      // canvasContext?.canvas.addElement(Object.assign(JSON.parse(JSON.stringify(configs.rect)), { id: 'rect-column2', x: 420, y: 330 }), { insertMethod: 'point' });
      // canvasContext?.canvas.addElement(Object.assign(JSON.parse(JSON.stringify(configs.rect)), { id: 'rect-column3', x: 400, y: 460 }), { insertMethod: 'point' });
      // canvasContext?.canvas.addElement(Object.assign(JSON.parse(JSON.stringify(configs.rect)), { id: 'rect-column4', x: 400, y: 590 }), { insertMethod: 'point' });
    }, 500);
  }, [])

  return (
    <div
      className={`${styles.debugPanel} ${styles[`expand-${expandDirection}`]} ${debugPanelVisible ? styles.visible : styles.collapsed} ${isDragging ? styles.dragging : ''} ${edgeSnapped !== 'none' ? styles.edgeSnapped : ''} ${edgeSnapped !== 'none' ? styles[`snapped-${edgeSnapped}`] : ''}`}
      style={{
        left: panelPosition.x,
        top: panelPosition.y,
        cursor: isDragging ? 'grabbing' : 'default',
      }}
      onMouseDown={handleMouseDown}
    >
      {/* 折叠状态：只显示调试工具按钮 */}
      {!debugPanelVisible && (
        <div
          className={`${styles.debugToolButton} debug-panel-header`}
          onClick={(e) => {
            if (!dragStarted) {
              if (edgeSnapped !== 'none') {
                const { innerWidth, innerHeight } = window;
                const margin = 12;
                let newPosition = { ...panelPosition };

                switch (edgeSnapped) {
                  case 'left':
                    newPosition.x = margin;
                    break;
                  case 'right':
                    newPosition.x = innerWidth - 300 - margin;
                    break;
                  case 'top':
                    newPosition.y = margin;
                    break;
                  case 'bottom':
                    newPosition.y = innerHeight - 300 - margin;
                    break;
                }

                setPanelPosition(newPosition);
                setEdgeSnapped('none');
              } else {
                const adjustedPosition = adjustPositionToViewport(panelPosition, true);
                if (adjustedPosition.x !== panelPosition.x || adjustedPosition.y !== panelPosition.y) {
                  setPanelPosition(adjustedPosition);
                }
              }
              setDebugPanelVisible(true);
            }
            e.stopPropagation();
          }}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          <SettingOutlined />
          <span>调试工具</span>
        </div>
      )}

      {/* 展开状态：显示完整面板 */}
      {debugPanelVisible && (
        <>
          <div className={`${styles.debugPanelHeader} debug-panel-header`} style={{ cursor: 'grab' }}>
            <span>调试工具</span>
            <Button
              type="text"
              size="small"
              onClick={() => {
                // 如果当前是贴边状态，收起时需要调整到对应边缘的收起位置
                if (edgeSnapped !== 'none') {
                  const { innerWidth, innerHeight } = window;
                  const iconSize = 56;
                  const visiblePart = 24;
                  let collapsedPosition = { ...panelPosition };

                  switch (edgeSnapped) {
                    case 'left':
                      collapsedPosition.x = -iconSize + visiblePart;
                      break;
                    case 'right':
                      collapsedPosition.x = innerWidth - visiblePart;
                      break;
                    case 'top':
                      collapsedPosition.y = -iconSize + visiblePart;
                      break;
                    case 'bottom':
                      collapsedPosition.y = innerHeight - visiblePart;
                      break;
                  }

                  setPanelPosition(collapsedPosition);
                }
                setDebugPanelVisible(false);
              }}
              style={{ padding: 0, minWidth: 'auto' }}
            >
              ×
            </Button>
          </div>

          <div className={styles.debugPanelContent}>
            {/* 添加图层 */}
            <div className={styles.debugSection}>
              <h4>添加图层</h4>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>图层类型：</label>
                <Select
                  value={elementType}
                  onChange={setElementType}
                  style={{ width: '100%' }}
                  size="small"
                  options={elementOptions}
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>插入方式：</label>
                <Select
                  value={insertMethod}
                  onChange={setInsertMethod}
                  style={{ width: '100%' }}
                  size="small"
                >
                  <Option value="block">块级插入</Option>
                  <Option value="inline">行内插入</Option>
                </Select>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>自定义内容：</label>
                <Input.TextArea
                  value={textInput}
                  rows={2}
                  allowClear
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="按照类型使用自定义的图片url、文本、商品模型"
                  size="small"
                  onPressEnter={handleAddElement}
                />
              </div>

              <div className={styles.buttonGroup}>
                <Button
                  type="primary"
                  onClick={handleAddElement}
                  size="small"
                >
                  添加图层
                </Button>

                <Button onClick={handleClearCanvas} size="small">清空画布</Button>
              </div>
            </div>

            {/* 画布信息 */}
            <div className={styles.debugSection}>
              <h4>画布信息</h4>
              <div className={styles.infoPanel}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>图层数量：</span>
                  <span className={styles.infoValue}>{elements.length}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>选中图层：</span>
                  <span className={styles.infoValue}>{selectedIds.join(',') || '无'}</span>
                </div>
              </div>
            </div>

            {/* 焦点区域控制 */}
            <div className={styles.debugSection}>
              <h4>焦点区域控制</h4>
              <div className={styles.buttonGroup}>
                <Button
                  type="primary"
                  onClick={setFullViewport}
                  size="small"
                  style={{ marginBottom: 8 }}
                >整个画布</Button>

                <Button
                  onClick={setCustomViewport}
                  size="small"
                  style={{ marginBottom: 8 }}
                >自定义区域</Button>

                <Button
                  onClick={toggleViewportMask}
                  size="small"
                  type={isViewportMaskVisible ? 'primary' : 'dashed'}
                >
                  {isViewportMaskVisible ? "隐藏蒙版" : "查看当前区域"}
                </Button>
              </div>

              <div className={styles.infoPanel} style={{ marginTop: 8, fontSize: 11 }}>
                <div>• 整个画布: 使用实际画布尺寸</div>
                <div>• 自定义区域: 左410px, 上20px, 下80px, 右260px</div>
                <div>• 小画布时会按比例自适应调整</div>
              </div>
            </div>

            {/* 切换意图 */}
            <div className={styles.debugSection}>
              <h4>切换意图</h4>

              <div className={styles.inputGroup}>
                <Select
                  value={intent}
                  onChange={(v) => {
                    window.aiIntent = v;
                    setIntent(v);
                  }}
                  style={{ width: '100%' }}
                  size="small"
                  allowClear
                >
                  <Option value="SMALL_TALK">SMALL_TALK</Option>
                  <Option value="SINGLE_CALL">SINGLE_CALL</Option>
                  <Option value="PLAN">PLAN</Option>
                </Select>
              </div>

            </div>
          </div>
        </>
      )}
    </div>
  );
});

export default DebugTool;
