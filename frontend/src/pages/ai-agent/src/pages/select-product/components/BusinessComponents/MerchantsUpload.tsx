import React, { useState, useEffect } from "react";
import { Input, Button, Upload, message } from "antd";
import IndexBlock from "@/pages/inquiry/components/IndexBlock";
import { inquiryApiBaseUrl } from "@/utils/env";
import { uploadImageForSelectProduct } from "./services";
import { UploadLoadingIcon, ImgDeleteIcon } from "@/components/Icon";
import CropRegion from "@/components/crop-region";
import { fileToBase64 } from "@/utils/imageUtils";
import { UploadOutlinedIcon, LinkOutlinedIcon } from "@/components/Icon";
import { RiskControlTips } from "@/components/ChatFlow/RiskControlTips";

import styles from "./merchantsUpload.module.css";
import { $t } from "@/i18n";

// 工具函数：将坐标数组转换为字符串
const coordinatesToString = (coordinates: number[]): string => {
  return coordinates.join(",");
};

// 工具函数：合并区域字符串
const joinRegions = (
  currentRegion: string,
  originYoloCropRegion: string,
): string => {
  if (!originYoloCropRegion) return currentRegion;
  if (!currentRegion) return originYoloCropRegion;
  return `${currentRegion};${originYoloCropRegion}`;
};

enum UPLOAD_TYPE {
  IMAGE = "ITEM_IMG",
  LINK_1688 = "ITEM_LINK",
}

enum UPLOAD_STATUS {
  UPLOADING = "UPLOADING",
  UPLOADED = "UPLOADED",
  ERROR = "ERROR",
  NO_UPLOAD = "NO_UPLOAD",
}

interface ProductUploadProps {
  onChange?: (product: ChangeValue) => void;
  value?: ChangeValue;
  title?: React.ReactNode | string;
  disabled?: boolean;
  imageUrl?: string;
  isMethod?: boolean;
}

interface ChangeValue {
  imgFileKey?: string;
  offerId?: string;
  type?: UPLOAD_TYPE;
  previewUrl?: string;
  currentRegion?: string;
  yoloCropRegion?: string;
}

const UploadLoading = ({ type }) => {
  const loaddingText = {
    [UPLOAD_TYPE.IMAGE]: $t(
      "global-1688-ai-app.select-product.BusinessComponents.MerchantsUpload.zoa",
      "正在上传图片",
    ),
    [UPLOAD_TYPE.LINK_1688]: $t(
      "global-1688-ai-app.select-product.BusinessComponents.MerchantsUpload.zrt",
      "正在解析商品链接",
    ),
  };
  return (
    <div className={styles.uploadLoading}>
      <div className={styles.uploadLoadingIcon}>
        <UploadLoadingIcon />
      </div>
      <div className={styles.uploadLoadingText}>{loaddingText[type]}</div>
    </div>
  );
};

const MerchantsUpload: React.FC<ProductUploadProps> = ({
  onChange,
  value,
  title,
  disabled,
  imageUrl,
  isMethod,
}) => {
  const [uploadData, setUploadData] = useState<any>(
    value
      ? {
        imgFileKey: value?.imgFileKey,
        offerId: value?.offerId,
        previewUrl: null, // 这个需要从服务器获取或者从value中传递
      }
      : null,
  );
  const [uploadStatus, setUploadStatus] = useState(
    value?.previewUrl ? UPLOAD_STATUS.UPLOADED : UPLOAD_STATUS.NO_UPLOAD,
  );
  const [uploadType, setUploadType] = useState(
    value?.type || UPLOAD_TYPE.IMAGE,
  );
  const [link, setLink] = useState("");
  const [currentRegion, setCurrentRegion] = useState("");
  const [yoloCropRegion, setYoloCropRegion] = useState("");
  const [showRiskTips, setShowRiskTips] = useState(false);
  const [isRiskContent, setIsRiskContent] = useState(false);
  const [riskMessage, setRiskMessage] = useState<string>('');
  const handleUploadBeforeCheck = (file: any) => {
    if (
      file.type !== "image/jpeg" &&
      file.type !== "image/png" &&
      file.type !== "image/jpg"
    ) {
      message.error("请上传JPG/PNG格式图片");
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      message.error("请上传不超过5MB的图片");
      return false;
    }
    return true;
  };
  const handleCustomRequest = async (options: any, urlImage?: string) => {
    try {
      setUploadStatus(UPLOAD_STATUS.UPLOADING);
      setUploadType(UPLOAD_TYPE.IMAGE);
      // 异步获取base64，使用统一的工具函数
      const base64 = urlImage || (await fileToBase64(options.file, 1000, 0.8));
      const formData = new FormData();
      // formData.append('file', options.file);
      const uploadResult = await uploadImageForSelectProduct(
        JSON.stringify({
          uploadType: urlImage ? "IMAGE_LINK" : "IMAGE",
          imageBase64: base64,
          imageUrl: urlImage,
          ...formData,
        }),
      );
      // 检测风控状态
      if (uploadResult?.data?.riskStatus === "risk" || uploadResult?.data?.riskStatus === "limiting") {
        setUploadStatus(UPLOAD_STATUS.NO_UPLOAD);
        setIsRiskContent(true);
        setShowRiskTips(true);
        setRiskMessage(uploadResult?.mesg);
        return;
      }

      if (uploadResult?.data) {
        const newData = {
          previewUrl: uploadResult.data.imageUrl,
        };
        setCurrentRegion(uploadResult?.data?.currentRegion);
        setYoloCropRegion(
          uploadResult?.data?.yoloCropRegion?.split(";").slice(0, 5).join(";"),
        );
        setUploadData(newData);
        setUploadStatus(UPLOAD_STATUS.UPLOADED);
        setIsRiskContent(false); // 重置风控状态
        // 直接触发onChange，避免useEffect死循环
        onChange &&
          onChange({
            offerId: undefined,
            type: UPLOAD_TYPE.IMAGE,
            previewUrl: newData.previewUrl,
            currentRegion: uploadResult?.data?.currentRegion,
            yoloCropRegion: uploadResult?.data?.yoloCropRegion,
          });
      } else {
        message.error(
          uploadResult?.data?.mesg ||
          $t(
            "global-1688-ai-app.select-product.BusinessComponents.MerchantsUpload.uploadFailed",
            "上传失败",
          ),
        );
        setUploadStatus(UPLOAD_STATUS.ERROR);
        setIsRiskContent(false);
      }
    } catch (err: any) {
      console.error("上传过程出错：", err);
      setUploadStatus(UPLOAD_STATUS.ERROR);
    }
  };

  const handleParseLink = () => {
    if (!link) return;
    setUploadStatus(UPLOAD_STATUS.UPLOADING);
    setUploadType(UPLOAD_TYPE.LINK_1688);
    uploadImageForSelectProduct(
      JSON.stringify({
        uploadType: "IMAGE_LINK",
        imageUrl: link,
      }),
    )
      .then((res: any) => {
        // 检测风控状态
        if (res?.data?.riskStatus === "risk" || res?.data?.riskStatus === "limiting") {
          setUploadStatus(UPLOAD_STATUS.NO_UPLOAD);
          setIsRiskContent(true);
          setShowRiskTips(true);
          setLink("");
          setRiskMessage(res?.mesg);
          return;
        }

        if (res?.data) {
          const newData = {
            previewUrl: res.data.imageUrl,
          };
          setCurrentRegion(res?.data?.currentRegion);
          setYoloCropRegion(
            res?.data?.yoloCropRegion?.split(";").slice(0, 5).join(";"),
          );
          setUploadData(newData);
          setUploadStatus(UPLOAD_STATUS.UPLOADED);
          setIsRiskContent(false); // 重置风控状态
          // 直接触发onChange，避免useEffect死循环
          onChange &&
            onChange({
              imgFileKey: undefined,
              type: UPLOAD_TYPE.LINK_1688,
              previewUrl: newData.previewUrl,
              currentRegion: res?.data?.currentRegion,
              yoloCropRegion: res?.data?.yoloCropRegion,
            });
        } else {
          message.error(
            res?.data?.mesg ||
            $t(
              "global-1688-ai-app.select-product.BusinessComponents.MerchantsUpload.jxfailed",
              "解析失败",
            ),
          );
          setUploadStatus(UPLOAD_STATUS.ERROR);
          setIsRiskContent(false);
        }
      })
      .catch((err: any) => {
        console.error("上传过程出错：", err);
        setUploadStatus(UPLOAD_STATUS.ERROR);
      });
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const files = e.clipboardData?.files;
    // 如果没有文件,使用浏览器默认行为
    if (!files || files.length === 0) return;

    const file = files[0];
    // 只有当粘贴的是图片时才执行图片上传
    if (file.type.indexOf('image') !== -1) {
      e.preventDefault(); // 阻止默认粘贴行为
      // 检查文件是否符合要求
      if (handleUploadBeforeCheck(file)) {
        // 触发图片上传
        handleCustomRequest({ file });
      }
    }
  };

  const handleDelete = () => {
    setUploadData(null);
    setUploadStatus(UPLOAD_STATUS.NO_UPLOAD);
    setLink("");
    setIsRiskContent(false); // 重置风控状态
    // 直接触发onChange，避免useEffect死循环
    onChange &&
      onChange({
        imgFileKey: undefined,
        offerId: undefined,
        type: UPLOAD_TYPE.IMAGE, // 重置为默认类型
        previewUrl: undefined,
        currentRegion,
        yoloCropRegion,
      });
  };

  // 监听外部value变化 - 不触发onChange避免循环
  useEffect(() => {
    if (value?.previewUrl) {
      console.log("value", value);
      // 如果 value 中有 previewUrl，直接使用
      setUploadData({
        imgFileKey: value?.imgFileKey || "",
        offerId: value?.offerId || "",
        previewUrl: value?.previewUrl,
      });
      setUploadStatus(UPLOAD_STATUS.UPLOADED);
      setUploadType(value.type || UPLOAD_TYPE.IMAGE);
      setCurrentRegion(value.currentRegion || "");
      setYoloCropRegion(value.yoloCropRegion || "");
    } else if (value?.imgFileKey || value?.offerId) {
      setUploadData({
        imgFileKey: value.imgFileKey,
        offerId: value.offerId,
        previewUrl: value.previewUrl || null, // 保持原有的previewUrl
      });
      setUploadStatus(UPLOAD_STATUS.UPLOADED);
      setUploadType(value.type || UPLOAD_TYPE.IMAGE);
    } else if (!value) {
      setUploadData(null);
      setUploadStatus(UPLOAD_STATUS.NO_UPLOAD);
      setLink("");
    }
  }, [value]);

  useEffect(() => {
    if (imageUrl && uploadStatus === UPLOAD_STATUS.NO_UPLOAD) {
      handleCustomRequest(null, imageUrl);
    }
  }, [imageUrl]);

  // 组件挂载后初始化报告当前值 - 延迟执行避免循环
  useEffect(() => {
    const timer = setTimeout(() => {
      onChange &&
        onChange({
          imgFileKey: uploadData?.imgFileKey,
          offerId: uploadData?.offerId,
          type: uploadType,
          previewUrl: uploadData?.previewUrl,
          currentRegion,
          yoloCropRegion,
        });
    }, 0);
    return () => clearTimeout(timer);
  }, []); // 只在组件挂载时执行一次
  const handleCropChange = (
    cropRegion: number[],
    originYoloCropRegion: string,
  ) => {
    const currentRegion = coordinatesToString(cropRegion);
    const yoloCropRegion = joinRegions(currentRegion, originYoloCropRegion);

    return {
      currentRegion,
      yoloCropRegion,
    };
  };
  const handleCropClick = (cropRegion: string) => {
    onChange &&
      onChange({
        ...value,
        currentRegion: cropRegion,
      });
    setCurrentRegion(cropRegion);
  };

  return (
    <div
      style={{
        display: "block !important",
        width: "100%",
        flex: "none !important",
        alignItems: "unset !important",
      }}
    >
      <IndexBlock title={title}>
        <div
          className={`${styles.productSection} ${isRiskContent ? styles.riskBorder : ""
            }`}
        >
          {isMethod && (
            <div className={styles.uploadTip}>
              <div className={styles.uploadTipTitle}>
                {$t(
                  "global-1688-ai-app.select-product.BusinessComponents.MerchantsUpload.fuduabed",
                  "方式2：直接上传商品图片，AI帮您解析关键词",
                )}
              </div>
              {isRiskContent && (
                <div className={styles.uploadTipTitleText}>
                  {$t(
                    "global-1688-ai-app.select-product.BusinessComponents.MerchantsUpload.qyam",
                    "请重试上传其它图片",
                  )}
                </div>
              )}
            </div>
          )}
          <div className={styles.productSectionContent}>
            {uploadStatus === UPLOAD_STATUS.UPLOADING && (
              <UploadLoading type={uploadType} />
            )}
            {(uploadStatus === UPLOAD_STATUS.UPLOADED || value?.previewUrl) && (
              <div className={styles.uploadData}>
                {uploadType === UPLOAD_TYPE.IMAGE && (
                  <CropRegion
                    disabled={disabled}
                    cropImage={uploadData?.previewUrl || value?.previewUrl}
                    currentRegion={currentRegion}
                    yoloCropRegion={yoloCropRegion
                      ?.split(";")
                      .slice(0, 5)
                      .join(";")}
                    onCropChange={(
                      cropRegion: number[],
                      originYoloCropRegion: string,
                    ) => {
                      const { currentRegion, yoloCropRegion } =
                        handleCropChange(cropRegion, originYoloCropRegion);
                      // 设置当前区域和yolo区域
                      setCurrentRegion(currentRegion);
                      setYoloCropRegion(yoloCropRegion);
                    }}
                    onCropClick={handleCropClick}
                  />
                )}
                {uploadType === UPLOAD_TYPE.LINK_1688 && (
                  <div className={styles.linkImageWrapper}>
                    <CropRegion
                      disabled={disabled}
                      cropImage={uploadData.previewUrl || value?.previewUrl}
                      currentRegion={currentRegion}
                      yoloCropRegion={yoloCropRegion
                        ?.split(";")
                        .slice(0, 5)
                        .join(";")}
                      onCropChange={(
                        cropRegion: number[],
                        originYoloCropRegion: string,
                      ) => {
                        const { currentRegion, yoloCropRegion } =
                          handleCropChange(cropRegion, originYoloCropRegion);
                        // 设置当前区域和yolo区域
                        setCurrentRegion(currentRegion);
                        setYoloCropRegion(yoloCropRegion);
                      }}
                      onCropClick={handleCropClick}
                    />
                    {/* <div
                      className={styles.linkImageHoverMask}
                      onClick={() => {
                        const imageUrl =
                          uploadData.previewUrl || value?.previewUrl;
                        if (imageUrl) {
                          window.open(imageUrl, "_blank");
                        }
                      }}
                    >
                      <div className={styles.linkImageHoverText}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          xmlnsXlink="http://www.w3.org/1999/xlink"
                          fill="none"
                          version="1.1"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                        >
                          <defs>
                            <clipPath id="master_svg0_2_006867">
                              <rect x="0" y="0" width="24" height="24" rx="0" />
                            </clipPath>
                          </defs>
                          <g clipPath="url(#master_svg0_2_006867)">
                            <g transform="matrix(-1,0,0,-1,45.599998474121094,43.9931640625)">
                              <path
                                d="M31.186029237060545,33.78918203125Q30.248749237060547,32.50938203125,30.295779237060547,30.87053203125Q30.350159237060545,28.97596203125,31.690379237060547,27.63576203125L35.882799237060546,23.438352031249998Q37.322199237060545,21.99718886625,39.35909923706055,21.99658203125Q41.39599923706055,21.99597638825,42.836299237060544,23.43628203125Q44.27479923706055,24.874822031249998,44.275999237060546,26.90921203125Q44.27709923706055,28.943602031250002,42.840199237060546,30.38376203125L41.60159923706055,31.70294203125C41.408499237060546,31.90856203125,41.08369923706054,31.91389203125,40.88399923706055,31.714712031250002L40.53029923706055,31.36199203125C40.33899923706055,31.17114203125,40.33389923706055,30.86276203125,40.51889923706055,30.665732031250002L41.77829923706055,29.32430203125Q42.776799237060544,28.32363203125,42.775999237060546,26.91006203125Q42.77519923706055,25.49649203125,41.77559923706055,24.49694203125Q40.77489923706055,23.49616203125,39.35949923706055,23.49658203125Q37.944199237060545,23.49700203125,36.94409923706055,24.49837203125L32.75102923706055,28.696432031249998Q31.832429237060545,29.61501203125,31.79516923706055,30.913562031250002Q31.76530923706055,31.95403203125,32.314319237060545,32.78338203125C32.46674923706055,33.01368203125,32.45519923706055,33.330782031249996,32.24905923706055,33.51458203125L31.875809237060547,33.84728203125C31.669669237060546,34.03098203125,31.349179237060547,34.01198203125,31.186029237060545,33.78918203125ZM35.88989923706055,30.249732031249998Q36.82719923706055,31.52960203125,36.78019923706054,33.16838203125Q36.72579923706055,35.06298203125,35.385599237060546,36.40318203125L31.193189237060547,40.60058203125Q29.753759237060546,42.04178203125,27.716859237060547,42.04238203125Q25.679969237060547,42.04298203125,24.239679237060546,40.60268203125Q22.801147457060548,39.164082031250004,22.799999237060547,37.12968203125Q22.79885482706055,35.09538203125,24.235759237060545,33.65518203125L25.687589237060546,31.93481203125C25.876239237060545,31.71126203125,26.215669237060546,31.696692031250002,26.42278923706055,31.90326203125L26.774309237060546,32.25388203125C26.958429237060546,32.43748203125,26.971059237060548,32.73158203125,26.803349237060548,32.93038203125L25.297619237060548,34.71468203125Q24.29919923706055,35.71528203125,24.299999237060547,37.12888203125Q24.300799237060545,38.54248203125,25.300339237060548,39.54198203125Q26.301109237060547,40.54278203125,27.716419237060546,40.54238203125Q29.131719237060548,40.54198203125,30.131899237060548,39.54058203125L34.32489923706055,35.34248203125Q35.24349923706055,34.42388203125,35.28079923706055,33.12538203125Q35.31069923706055,32.084882031250004,34.76159923706055,31.25553203125C34.60919923706055,31.025272031249997,34.620799237060545,30.70811203125,34.826899237060545,30.52437203125L35.200199237060545,30.19167203125C35.406299237060544,30.00793203125,35.72679923706055,30.02694203125,35.88989923706055,30.249732031249998Z"
                                fillRule="evenodd"
                                fill="#FFFFFF"
                                fillOpacity="1"
                              />
                            </g>
                          </g>
                        </svg>
                      </div>
                    </div> */}
                  </div>
                )}
                {!disabled && (
                  <div
                    className={styles.uploadDataDelete}
                    onClick={handleDelete}
                  >
                    <ImgDeleteIcon style={{ width: 15, height: 15 }} />
                  </div>
                )}
              </div>
            )}
            {uploadStatus === UPLOAD_STATUS.NO_UPLOAD && (
              <>
                <Upload.Dragger
                  className={styles.antdUpload}
                  showUploadList={false}
                  action={`${inquiryApiBaseUrl}/api/inquiry/item/upload`}
                  customRequest={(options) =>
                    handleCustomRequest(options, imageUrl)
                  }
                  beforeUpload={handleUploadBeforeCheck}
                  accept="image/jpeg,image/png,image/jpg"
                >
                  <div className={styles.uploadCard}>
                    <UploadOutlinedIcon />
                    <div className={styles.uploadText}>
                      <span className={styles.uploadTitle}>
                        {$t(
                          "global-1688-ai-app.select-product.BusinessComponents.MerchantsUpload.doot",
                          "将图片放到此处或点击上传文件",
                        )}
                      </span>
                      <span className={styles.uploadSubtitle}>
                        {$t(
                          "global-1688-ai-app.select-product.BusinessComponents.MerchantsUpload.srPFamc",
                          "支持JPG/PNG格式，文件大小不超过5MB",
                        )}
                      </span>
                    </div>
                  </div>
                </Upload.Dragger>
                <span className={styles.orText}>
                  {$t(
                    "global-1688-ai-app.select-product.BusinessComponents.MerchantsUpload.h",
                    "或",
                  )}
                </span>
                <div className={styles.linkCard}>
                  <LinkOutlinedIcon />
                  <div className={styles.linkContent}>
                    <span className={styles.linkTitle}>
                      {$t(
                        "global-1688-ai-app.select-product.BusinessComponents.MerchantsUpload.jgk",
                        "解析图片链接或复制粘贴图片",
                      )}
                    </span>
                    <div className={styles.linkInputContainer}>
                      <Input
                        placeholder={$t(
                        "global-1688-ai-app.select-product.BusinessComponents.MerchantsUpload.qztlinkdcc",
                        "请粘贴链接到此处",
                      )}
                        className={styles.antdLinkInput}
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        onPaste={handlePaste}
                        style={{
                        height: "36px",
                        lineHeight: "20px",
                        padding: "8px 12px",
                        display: "flex",
                        alignItems: "center",
                      }}
                        suffix={
                          <Button
                            type="link"
                            className={styles.parseButton}
                            onClick={handleParseLink}
                            style={{
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            lineHeight: 1,
                            padding: "0 8px",
                          }}
                          >
                            {$t(
                            "global-1688-ai-app.select-product.BusinessComponents.MerchantsUpload.jx",
                            "解析",
                          )}
                          </Button>
                      }
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
            {uploadStatus === UPLOAD_STATUS.ERROR && (
              <div className={styles.uploadData}>
                <div className={styles.uploadDataDelete} onClick={handleDelete}>
                  <ImgDeleteIcon style={{ width: 15, height: 15 }} />
                </div>
                <div className={styles.uploadErrorText}>
                  {$t(
                    "global-1688-ai-app.select-product.BusinessComponents.MerchantsUpload.uploadFailed",
                    "上传失败",
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </IndexBlock>

      <RiskControlTips
        visible={showRiskTips}
        onClose={() => setShowRiskTips(false)}
        riskMessage={riskMessage}
      />
    </div>
  );
};

export default MerchantsUpload;
