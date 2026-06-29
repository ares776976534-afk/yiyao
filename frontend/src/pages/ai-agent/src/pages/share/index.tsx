import { definePageConfig } from "ice";
import Studio from '@/pages/studio';

export default function () {
  return (
    <Studio
      canvasState={{
        canHover: false,
        canClickMenu: false,
        canSelect: false,
        canContextMenu: false,
        canDrag: false,
        canShortcut: false,
      }}
      showLayerPanel={false}
      showToolbar={false}
      isShared
    />
  );
}

export const pageConfig = definePageConfig(() => ({
  spm: {
    spmB: "32350769",
  },
}));
