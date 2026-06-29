import { useState, useContext, useEffect } from "react";
import { definePageConfig } from "ice";
import { observer } from "mobx-react-lite";
import StudioRoot from "@/components/studio/root";
import Canvas, { CanvasContext } from "./components/Canvas";
import { getOdCanvasInfo, getOdCanvasData } from "@/services/canvas/odStudio";
import { calcOfferInfoSize } from "@/components/LayerOfferElement/calcOffer";
import { AmazonOffer } from "@/services/mocks/mockOdCanvas";
import "./index.module.scss";

export const Page = observer(() => {
  const canvasContext = useContext(CanvasContext);
  const [canvasInfo, setCanvasInfo] = useState<any>(null);

  useEffect(() => {
    getOdCanvasInfo().then((res) => {
      setCanvasInfo(res);
    });
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100vw",
        height: "100vh",
      }}
    >
      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={() => {
            canvasContext.resetCanvas();

            const offerData = {
              id: "offer1",
              type: "offer",
              attributes: { offerData: AmazonOffer },
            };
            const offerModuleSize = calcOfferInfoSize(
              offerData.attributes.offerData,
            );
            offerData.attributes.offerData._offerModuleSize = offerModuleSize;

            canvasContext?.canvas.addElement({
              ...offerData,
              width: offerModuleSize.width,
              height: offerModuleSize.height,
            });
          }}
        >
          添加商品
        </button>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <Canvas memoryId={canvasInfo?.sessionId} />
      </div>
    </div>
  );
});

export default (props: any) => {
  return (
    <StudioRoot root>
      <Page {...props} />
    </StudioRoot>
  );
};

export const pageConfig = definePageConfig(() => ({
  spm: {
    spmB: "32265064",
  },
}));
