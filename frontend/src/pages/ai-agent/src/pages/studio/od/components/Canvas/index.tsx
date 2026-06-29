import { useRef, useEffect, useContext } from "react";
import { observer } from "mobx-react-lite";
import { v4 as uuidv4 } from "uuid";
import Canvas, { CanvasRef, CanvasContext } from "@/components/studio-canvas";
import { calcOfferInfoSize } from "@/components/LayerOfferElement/calcOffer";
import { saveOdCanvasData } from "@/services/canvas/odStudio";
import styles from "./index.module.scss";

interface StudioProps {
  memoryId: string;
  offerData: any;
  isShared?: boolean;
  onAutoSave?: (canvasMemoryId: string, canvasData: string) => void;
  onLoadMemoryData?: (memoryId: string) => Promise<any>;
}

export { CanvasContext };

export default observer((props: StudioProps) => {
  const { memoryId, offerData } = props;
  const canvasContext = useContext(CanvasContext);
  const canvasRef = useRef<CanvasRef>(null);

  const handleAutoSave = (canvasMemoryId: string, canvasData: string) => {
    saveOdCanvasData({
      data: {
        sessionId: canvasMemoryId,
        content: canvasData,
      },
    });
  };

  useEffect(() => {
    canvasContext.resetCanvas();

    const offerElement = {
      id: uuidv4(),
      type: "offer",
      attributes: { offerData },
    };
    const offerModuleSize = calcOfferInfoSize(offerData);
    offerElement.attributes.offerData._offerModuleSize = offerModuleSize;

    canvasContext?.canvas.addElement({
      ...offerElement,
      width: offerModuleSize.width,
      height: offerModuleSize.height,
    });
  }, [memoryId, offerData, canvasContext]);

  return (
    <div className={styles.studioContainer}>
      <Canvas
        ref={canvasRef}
        state={{
          canHover: false,
          canClickMenu: false,
          canSelect: false,
          canContextMenu: false,
          canDrag: false,
          canShortcut: false,
        }}
        memoryId={memoryId}
        showDebugTool={false}
        showLayerPanel={false}
        showToolbar={false}
        onAutoSave={handleAutoSave}
      />
    </div>
  );
});
