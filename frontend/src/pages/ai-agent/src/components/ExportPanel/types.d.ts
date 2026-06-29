export interface ProductModel {
  offerId: number;
  firstCateName: string;
  secondCateName: string;
  thirdCateName: string | null;
  title: string;
  description: string | null;
  sellingPoints: string | null;
  keywords: string | null;
  images: string[];
  productAttribute: Array<{
    attributeName: string;
    value: string;
  }>;
  skuProps: Array<{
    fid: string;
    prop: string;
    value: Array<{
      name: string;
      imageUrl: string | null;
    }>;
  }>;
  productSkuInfos: Array<{
    skuId: number;
    skuAttributes: Array<{
      attributeName: string;
      value: string;
      skuImageUrl: string | null;
    }>;
  }>;
  detailImages: any;
  width: number;
  height: number;
  _offerModuleSize: any;
}

export interface ExtractedData {
  aiImgageUrlList: string[];
  userImageUrlList: string[];
  videoUrlList: string[];
  productModelList: ProductModel[];
}

export interface ExportPanelProps {
  captureMode?: boolean;
  imageFormat?: string;
  videoFormat?: string;
  watermarkFormat?: boolean;
  imageFormatOptions?: { value: string; label: string }[];
  videoFormatOptions?: { value: string; label: string }[];
  onExport?: ({
    resource,
    needWatermark,
  }: {
    resource: ExtractedData;
    needWatermark?: boolean;
  }) => void;
  onCaptureModeChange?: (captureMode: boolean) => void;
}
