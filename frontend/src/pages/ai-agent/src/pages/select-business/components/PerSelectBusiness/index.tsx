import React, { useEffect, useRef, useState, type FC } from "react";
import MerchantsUpload from "./MerchantsUpload";
import { Button } from "antd";
import styles from "./index.module.scss";
// import { mockPreSelectBusiness } from './mock';
import { SELECT_PROVIDER_FETCH_URL } from "../../constants";
import { useSelectProductStore } from "@/stores/select-product";
import SelectedMercgants from "./SelectedMercgants";
import { $t } from "@/i18n";

export enum EnumUploadType {
  IMAGE = "ITEM_IMG",
  LINK_1688 = "ITEM_LINK",
}

export interface TypeChangeValue {
  imageUrl?: string;
  currentRegion?: string;
  yoloCropRegion?: string;
}

interface TypePreSelectBusinessProps {
  imageUrl?: string;
  currentRegion?: string;
  yoloCropRegion?: string;
  getStream?: (data: any) => void;
  isReplay?: boolean;
  isDisable?: boolean;
}

const PreSelectBusiness: FC<TypePreSelectBusinessProps> = (props) => {
  const {
    imageUrl,
    currentRegion,
    yoloCropRegion,
    getStream,
    isReplay,
    isDisable,
  } = props;

  const isSubmitRef = useRef(false);

  const [disabled, setDisabled] = useState(false);
  const selectProductStore = useSelectProductStore();

  // 使用 mock 数据作为默认值（开发调试用）
  const finalImageUrl = imageUrl;
  //  || mockPreSelectBusiness.imageUrl;
  const finalCurrentRegion = currentRegion;
  //  || mockPreSelectBusiness.currentRegion;
  const finalYoloCropRegion = yoloCropRegion;
  //  || mockPreSelectBusiness.yoloCropRegion;

  const dataRef = useRef<TypeChangeValue>({
    imageUrl: finalImageUrl,
    currentRegion: finalCurrentRegion,
    yoloCropRegion: finalYoloCropRegion,
  });

  // 当 props 变化时同步更新 dataRef
  useEffect(() => {
    dataRef.current = {
      imageUrl: finalImageUrl,
      currentRegion: finalCurrentRegion,
      yoloCropRegion: finalYoloCropRegion,
    };
  }, [finalImageUrl, finalCurrentRegion, finalYoloCropRegion]);

  const handleConfirm = () => {
    if (
      dataRef.current &&
      dataRef.current.currentRegion &&
      dataRef.current.imageUrl
    ) {
      if (isSubmitRef.current) return;
      isSubmitRef.current = true;
      const userRequest = selectProductStore.getUserRequest();
      setDisabled(true);
      const formattedPayload = selectProductStore.getFormattedPayload();
      const params = {
        ...formattedPayload,
        searchImageUrl: dataRef.current.imageUrl,
        currentRegion: dataRef.current.currentRegion,
        intention: userRequest?.intention,
      };
      selectProductStore.setFormattedPayload(params);
      getStream?.({
        fetchUrl: SELECT_PROVIDER_FETCH_URL,
        params: params,
      });
    }
  };

  if (!finalImageUrl || !finalCurrentRegion || !finalYoloCropRegion) {
    return null;
  }

  if (isDisable) {
    return <SelectedMercgants url={finalImageUrl} />;
  }

  return (
    <div className={styles.preSelectBusiness}>
      {/* <div className={styles.preSelectBusinessTitle}>
        {$t(
          "global-1688-ai-app.select-business.PerSelectBusiness.ztzwxy",
          "在开始找供应商之前，首先让我了解您的需求和关键要素。"
        )}
      </div> */}
      <div className={styles.preSelectBusinessContent}>
        <div className={styles.preSelectBusinessUpload}>
          <MerchantsUpload
            isDisabled={isDisable || isReplay || disabled}
            imageUrl={finalImageUrl}
            currentRegion={finalCurrentRegion}
            yoloCropRegion={finalYoloCropRegion}
            onChange={(value) => {
              dataRef.current = {
                ...dataRef.current,
                ...value,
              };
            }}
            title={$t(
              "global-1688-ai-app.select-business.PerSelectBusiness.qclIz",
              "请选择您上传的图片主体",
            )}
          />
        </div>
        <div className={styles.preSelectBusinessButton}>
          <Button
            className={styles.preSelectBusinessBtn}
            type="primary"
            onClick={handleConfirm}
            disabled={isDisable || isReplay || disabled}
          >
            {$t(
              "global-1688-ai-app.select-business.PerSelectBusiness.confirmxq",
              "确认需求",
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PreSelectBusiness;
