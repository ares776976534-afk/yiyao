import React, { useState, useRef, useEffect, useContext } from "react";
import { App, Tooltip, Dropdown, Button, Checkbox, message } from "antd";
import { observer } from "mobx-react-lite";
import View from "@alife/channel-fe-materials-react-appear";
import classnames from "classnames";
import Konva from "konva";
import {
  IconSelect,
  IconDrag,
  IconAdd,
  IconUndo,
  IconRedo,
  IconText,
} from "./icons";
import { ImageIcon } from "@/components/InputChat/components/Icons";
import CheckTransIcon from "@/components/Icons/CheckTrans";
import styles from "./index.module.scss";
import { useStore } from "@/stores/context";
import { CanvasContext } from "./context/canvas";
import useToast from "@/components/Toast";
import {
  selectMultipleImages,
  createTypeFileItems,
  simulateProgressForFiles,
  createFileSelector,
  validateImage,
  formatInvalidImagesMessage,
  getImageDimensions,
  validateImageDimensions,
  getImageDimensionErrorMessage,
} from "@/components/InputChat/utils/fileSelector";
import { $t } from "@/i18n";
import distributeOffer from "@/services/studio/distributeOffer";
import request from '@/services/httpRequest';
import { adeptKeyMap } from "./utils/shortcuts";
import aplus from "@/utils/log";
import { getUserInfo } from "@/utils/login";
import { globalMemberAuthPageUrl, globalMemberAPIUrl } from "@/utils/env";
import { TypeLayer } from "./types.d";

export type ToolType = "select" | "hand" | "add" | "zoom" | "layers" | "text";

export interface CanvasToolbarRef { }

export interface CanvasToolbarProps {
  disabled?: boolean;
  activeTool?: ToolType;
  onToolChange: (tool: ToolType) => void;
  onAddElement?: (
    element: TypeLayer,
    insertMethod?: "block" | "inline"
  ) => void;
}

const AUTH_MSG_KEY = 'alphashop.ai.1688auth';

const postBindUser = async (oauthCode) => {
  try {
    const result = await request(`${globalMemberAPIUrl}/alphashop.user.auth.bind/1.0/HSF`, {
      method: 'POST',
      headers: {
        'language': window.pageData?.language || 'zh_CN',
        'region': 'alphashop',
        'currency': 'usd',
      },
      body: JSON.stringify({
        data: {
          oauthCode,
        },
      }),
    });
    return result?.data?.data;
  } catch {
    return {
      bindSuccess: false,
    };
  }
};

const listenAuthMsg = (authWindow: Window | null, onSuccess = () => { }) => {
  window.addEventListener('message', (event) => {
    console.log('收到授权消息:', event);
    if (event.data.type === AUTH_MSG_KEY) {
      const data = event.data.data;
      if (data.close === 'true') {
        authWindow?.close();
      }
      if (data.bindCode) {
        postBindUser(data.bindCode).then((result) => {
          if (result.bindSuccess) {
            onSuccess();
          } else {
            message.error('绑定失败，请稍后再试');
          }
          authWindow?.close();
        });
      }
    }
  });
};

const newWinPos = (width, height) => {
  const left = (screen.width - width) / 2;
  const top = (screen.height - height) / 2;
  return `left=${left},top=${top},width=${width},height=${height}`;
};

const toAuth = (onSuccess = () => { }) => {
  getUserInfo({}).then((user) => {
    if (user) {
      const windowFeatures = newWinPos(800, 800);
      const authWindow = window.open(`${globalMemberAuthPageUrl}?lang=${window.pageData.language || 'zh_CN'}`, 'mozillaWindow', windowFeatures);
      setTimeout(() => {
        authWindow?.postMessage({
          type: AUTH_MSG_KEY,
          data: {
            init: 'true', // 初始化授权窗口
          },
        }, '*');
      }, 1000);

      listenAuthMsg(authWindow, onSuccess);
    }
  });
};

const CanvasToolbar = observer((props: CanvasToolbarProps) => {
  const {
    activeTool = "select",
    onToolChange,
    onAddElement,
    disabled = false,
  } = props;
  const store = useStore();
  const { distributeMode, userPrefer } = store;
  const [initAnimation, setInitAnimation] = useState<boolean | undefined>(
    undefined
  );

  const canvasContext = useContext(CanvasContext);
  const selectedIds = canvasContext.selectedIds || [];

  const rootRef = useRef<HTMLDivElement>(null);
  const menuGroupRef = useRef<HTMLDivElement>(null);
  const distributeGroupRef = useRef<HTMLDivElement>(null);

  const toast = useToast();
  const { modal } = App.useApp();

  const canUndo = canvasContext?.canUndo || false;
  const canRedo = canvasContext?.canRedo || false;
  const MAX_IMAGE_COUNT = 10;

  const tools = [
    {
      type: "select" as ToolType,
      icon: <IconSelect />,
      label: $t("global-1688-ai-app.studio-canvas.toolbar.select", "选择"),
      tooltip: $t("global-1688-ai-app.studio-canvas.toolbar.selectgjV", "V"),
    },
    {
      type: "hand" as ToolType,
      icon: <IconDrag />,
      label: $t("global-1688-ai-app.studio-canvas.toolbar.zs", "抓手"),
      tooltip: $t("global-1688-ai-app.studio-canvas.toolbar.zsgjkgj", "空格"),
    },
  ];

  const handleAddImages = async () => {
    try {
      // 创建独立的文件选择器实例，避免共享状态
      const toolbarFileSelector = createFileSelector();

      const files = await selectMultipleImages({
        beforeUpload: async (files) => {
          if (!files || files.length === 0) return null;

          // 1. 校验格式，过滤出合格的图片文件
          const validFiles: File[] = [];
          let invalidFormatCount = 0;

          for (const file of files) {
            const result = validateImage(file);
            if (result === true) {
              validFiles.push(file);
            } else {
              invalidFormatCount += 1;
            }
          }

          // 提示格式不合规的文件
          if (invalidFormatCount > 0) {
            toast.warning(formatInvalidImagesMessage(invalidFormatCount));
          }

          if (validFiles.length === 0) return null;

          // 2. 先按数量裁剪,只对真正会被上传的图片进行尺寸校验
          const finalFiles = validFiles.slice(0, MAX_IMAGE_COUNT);
          const shouldBlockInvalidSize = false; // 开关 决定是否拦截不符合尺寸要求的图片上传

          // 3. 校验尺寸
          const validFilesWithDimensions: File[] = [];
          let invalidDimensionCount = 0;

          await Promise.all(
            finalFiles.map(async (file) => {
              try {
                const dimensions = await getImageDimensions(file);
                const imageDimensionsValid = validateImageDimensions(
                  dimensions.width,
                  dimensions.height,
                  file.size
                );

                if (imageDimensionsValid) {
                  validFilesWithDimensions.push(file);
                } else {
                  invalidDimensionCount++;
                }
              } catch (error) {
                invalidDimensionCount++;
              }
            })
          );

          // 根据开关决定是拦截还是只提示
          if (shouldBlockInvalidSize) {
            // 拦截模式:尺寸不合格的图片不允许上传
            if (validFilesWithDimensions.length === 0) {
              if (invalidDimensionCount > 0) {
                toast.error(getImageDimensionErrorMessage());
              }
              return null;
            }

            if (invalidDimensionCount > 0) {
              toast.error(getImageDimensionErrorMessage());
            }

            return validFilesWithDimensions;
          } else {
            // 提示模式:只提示但允许上传
            if (invalidDimensionCount > 0) {
              toast.error(getImageDimensionErrorMessage());
            }

            // 如果图片数量超过限制,提示超限
            if (validFiles.length > MAX_IMAGE_COUNT) {
              toast.info(
                $t(
                  "global-1688-ai-app.studio-canvas.toolbar.bpcnxxam",
                  `批量上传超过数量限制（${MAX_IMAGE_COUNT}张），已优先上传前${MAX_IMAGE_COUNT}张图片`,
                  [MAX_IMAGE_COUNT, MAX_IMAGE_COUNT]
                )
              );
            }

            return finalFiles;
          }
        },
        instance: toolbarFileSelector,
      });
      if (!files || files.length === 0) return;

      await simulateProgressForFiles(files, toolbarFileSelector);
      const items = await createTypeFileItems(files);
      const toastUploadKey = "toolbar_upload";

      toast.loading(
        $t(
          "global-1688-ai-app.studio-canvas.core.imageUploading",
          "图片上传中"
        ),
        {
          duration: 0,
          key: toastUploadKey,
        }
      );

      for (const item of items) {
        try {
          const url = await store.uploadImageFile(item.file);
          onAddElement?.({
            type: "image",
            width: item.width || 0,
            height: item.height || 0,
            attributes: { src: url },
          });
        } catch (e) {
          toast.error(e.message || $t("global-1688-ai-app.studio-canvas.toolbar.imageUploadFailed", "图片上传失败"));
        }
      }
      toast.destroy(toastUploadKey);
    } catch (e) {
      // 静默失败但记录日志
      console.error("选择或添加图片失败", e);
    }
  };

  /**
   * 文本插入逻辑
   * 1. 将文本模板传递给外层
   * 2. 外层暂存模板，当模板是 text，不立刻插入，而是切到 text 工具，等待画布点击
   * 3. core内若当前工具为 text 且点击空白处，将文本模板插入进去，并把坐标设置为点击处的画布坐标
   * 4. 插入完成后选中新建元素，清空模板，并请求将工具切回 select
   */
  const handleAddText = () => {
    onToolChange?.("text");
    onAddElement?.({
      type: "text",
      attributes: {
        text: $t(
          "global-1688-ai-app.studio-canvas.toolbar.zsydwb",
          "这是一段文本"
        ),
        fontSize: 16,
        fontFamily: "Arial",
        fill: "#ffffff",
        align: "left",
        verticalAlign: "middle",
        wrap: "none",
      },
    });
  };

  // 添加菜单项
  const addMenuItems = [
    {
      key: "image",
      icon: <ImageIcon />,
      label: (
        <span className={styles.toolAddMenuItemLabel}>
          {$t('global-1688-ai-app.InputChat.addImage', '图片')}
        </span>
      ),
    },
    // {
    //   key: "text",
    //   icon: <IconText />,
    //   label: (
    //     <span className={styles.toolAddMenuItemLabel} onClick={handleAddText}>
    //       文字
    //     </span>
    //   ),
    // },
  ];

  const handleMenuClick = (e) => {
    if (e.key === "image") {
      handleAddImages();
    }
  };

  const handleDistribute = async (
    distributeData: any,
    fullSolution = false, // true，全流程铺货，没有登录提示登录，没有授权提示授权，然后重新发起铺货流程；false，失败后只提示失败，不再重试流程
  ) => {
    try {
      const res = await distributeOffer(distributeData);
      const { success, retCode, result } = res || {};

      if (success) {
        const distrubiteSuccessConfirmed = modal.confirm({
          classNames: { content: styles.downloadModal },
          title: $t(
            "global-1688-ai-app.studio-canvas.toolbar.cjsuccess",
            "采集成功"
          ),
          width: 400,
          centered: true,
          closable: { "aria-label": "Custom Close Button" },
          icon: <CheckTransIcon className="studio-modal-confirm-title-icon" />,
          closeIcon: null,
          content: (
            <div>
              {$t(
                "global-1688-ai-app.studio-canvas.toolbar.pctEwPizt",
                "商品素材已同步至【通途ERP】，可前往【通途ERP】继续操作上架至店铺"
              )}
            </div>
          ),
          footer: (
            <div className="footer-center">
              <View
                onFirstAppear={() => {
                  aplus.record("/alphashop.32265064.stay", "EXP");
                }}
              >
                <Button
                  onClick={() => {
                    aplus.record("/alphashop.32265064.stay", "CLK", {
                      action: "continue",
                    });
                    distrubiteSuccessConfirmed.destroy();
                  }}
                >
                  {$t(
                    "global-1688-ai-app.studio-canvas.toolbar.lzhb",
                    "留在画布"
                  )}
                </Button>
              </View>

              <View
                onFirstAppear={() => {
                  aplus.record("/alphashop.32265064.goerp", "EXP");
                }}
              >
                <Button
                  type="primary"
                  onClick={async () => {
                    aplus.record("/alphashop.32265064.goerp", "EXP");
                    distrubiteSuccessConfirmed.destroy();

                    window.open("https://passport.tongtool.com?_to=/l/product/index.htm");
                  }}
                >
                  {$t(
                    "global-1688-ai-app.studio-canvas.toolbar.tzview",
                    "跳转查看"
                  )}
                </Button>
              </View>
            </div>
          ),
          onCancel: () => {
            distrubiteSuccessConfirmed.destroy();
          },
        });
        return;
      }

      if (fullSolution) {
        if (retCode === "H0001") {
          const authDialog = modal.confirm({
            title: $t('global-1688-ai-app.AgentLayout.Account.linkCardModalTitle', '本次操作需进行1688账号授权'),
            content: <span style={{ color: '#7C7F9A', fontSize: '14px' }}>{$t('global-1688-ai-app.AgentLayout.Account.linkCardModalContent', '账号授权后，即可使用该功能')}</span>,
            icon: null,
            footer: (_) => (
              <>
                <Button onClick={() => authDialog?.destroy()}>{$t('global-1688-ai-app.AgentLayout.Account.linkCardModalCancel', '暂不授权')}</Button>
                <Button
                  type="primary"
                  onClick={() => {
                    toAuth();
                    authDialog?.destroy();
                  }}
                  style={{ backgroundColor: '#6E50FF', borderColor: '#6E50FF' }}
                >
                  {$t('global-1688-ai-app.AgentLayout.Account.linkCardModalConfirm', '去授权')}
                </Button>
              </>
            ),
          });

        } else if (retCode === "NO_AUTH" && result) {
          // 本页面展示等待登录授权提示界面
          const jumpConfirmed = modal.confirm({
            classNames: { content: styles.downloadModal },
            title: $t(
              "global-1688-ai-app.studio-canvas.toolbar.productcj",
              "商品采集"
            ),
            width: 400,
            centered: true,
            closable: { "aria-label": "Custom Close Button" },
            onCancel: () => {
              jumpConfirmed.destroy();
            },
            icon: null,
            closeIcon: null,
            content: (
              <View
                onFirstAppear={() => {
                  aplus.record("/alphashop.32265064.gologin", "EXP");
                }}
              >
                <div>
                  {$t(
                    "global-1688-ai-app.studio-canvas.toolbar.pcsRdjiijhaLArimePhi",
                    "商品刊登将使用【通途ERP】平台，请到页面进行登录/注册，进行授权。登录授权完成后，回到该页面进行确认。"
                  )}
                </div>
              </View>
            ),
            footer: (
              <div className="footer-center">
                <Button
                  onClick={() => {
                    aplus.record("/alphashop.32265064.cancellogin", "CLK");
                    jumpConfirmed.destroy();
                  }}
                >
                  {$t("global-1688-ai-app.studio-canvas.toolbar.cancel", "取消")}
                </Button>
                <Button
                  type="primary"
                  onClick={() => {
                    aplus.record("/alphashop.32265064.gologin", "CLK");
                    // 无铺货权限，跳转到铺货页面登录授权
                    window.open(res.result);

                    // 关闭弹窗
                    jumpConfirmed.destroy();

                    // 打开等待登录授权提示界面
                    const waitingLoginConfirmed = modal.confirm({
                      classNames: { content: styles.downloadModal },
                      title: $t(
                        "global-1688-ai-app.studio-canvas.toolbar.productcj",
                        "商品采集"
                      ),
                      width: 400,
                      centered: true,
                      closable: { "aria-label": "Custom Close Button" },
                      icon: null,
                      closeIcon: null,
                      content: (
                        <div>
                          {$t(
                            "global-1688-ai-app.studio-canvas.toolbar.stzloee",
                            "是否已经在【通途ERP】中完成登录/注册？"
                          )}
                        </div>
                      ),
                      footer: (
                        <div className="footer-center">
                          <Button
                            onClick={() => {
                              waitingLoginConfirmed.destroy();
                            }}
                          >
                            {$t(
                              "global-1688-ai-app.studio-canvas.toolbar.zblogin",
                              "暂不登录"
                            )}
                          </Button>
                          <Button
                            type="primary"
                            onClick={async () => {
                              // 自动重试铺货，重试阶段铺货失败不能再重复全流程避免用户操作循环
                              await handleDistribute(distributeData);

                              waitingLoginConfirmed.destroy();
                            }}
                          >
                            {$t(
                              "global-1688-ai-app.studio-canvas.toolbar.wylogin",
                              "我已登录"
                            )}
                          </Button>
                        </div>
                      ),
                      onCancel: () => {
                        waitingLoginConfirmed.destroy();
                      },
                    });
                  }}
                >
                  {$t(
                    "global-1688-ai-app.studio-canvas.toolbar.qlogin",
                    "去登录"
                  )}
                </Button>
              </div>
            ),
          });
        }
      } else {
        toast.error("铺货失败，请稍后再试");
      }
    } catch (e) { }
  };

  // 采集铺货
  const handleDistributeConfirm = async () => {
    const offerCollectionList =
      canvasContext
        ?.findElementNode?.(selectedIds)
        ?.map?.((el: Konva.Node) => {
          const attributes = el?.attrs?.attributes || {};

          if (attributes?.offerData) {
            return {
              ...attributes.offerData,
              canvasConfig: {
                language: attributes.language || "zh",
                channelModel: attributes.channelModel || "temu", // 下游平台
                materialMode: attributes.materialMode || "", // 素材模式
              },
            };
          }
        })
        ?.filter((_) => !!_) || [];

    if (offerCollectionList.length) {
      const distributeData = {
        offerCollectionList,
        distributionData: {
          clientTime: new Date().getTime(),
          externalTool: "9767089",
        },
      };

      // 本页面展示等待登录授权提示界面
      const { preferences } = userPrefer;
      let noDistrubiteConfirmTip = preferences.confirm.distribute;

      // 用户偏好已设置，铺货前不需要确认提示
      if (noDistrubiteConfirmTip) {
        handleDistribute(distributeData, true);
        return;
      }

      const beforeDistributeConfirmed = modal.confirm({
        classNames: { content: styles.downloadModal },
        title: $t(
          "global-1688-ai-app.studio-canvas.toolbar.crt",
          "确认采集平台"
        ),
        width: 400,
        centered: true,
        closable: { "aria-label": "Custom Close Button" },
        icon: null,
        closeIcon: null,
        content: (
          <View
            onFirstAppear={() => {
              aplus.record("/alphashop.32265064.gatherconfirm", "EXP");
            }}
          >
            <span>
              {$t(
                "global-1688-ai-app.studio-canvas.toolbar.qpcE",
                `确定采集${offerCollectionList.length}个商品到「通途ERP」中吗？`,
                [offerCollectionList.length]
              )}
            </span>
          </View>
        ),
        footer: (
          <div className="footer-between">
            <Checkbox
              onChange={(e) => (noDistrubiteConfirmTip = e.target.checked)}
            >
              {$t(
                "global-1688-ai-app.studio-canvas.toolbar.xcbztips",
                "下次不再提示"
              )}
            </Checkbox>
            <Button
              type="primary"
              onClick={() => {
                aplus.record("/alphashop.32265064.gatherconfirm", "CLK");

                if (noDistrubiteConfirmTip) {
                  userPrefer.updateConfirm(
                    "distribute",
                    noDistrubiteConfirmTip
                  );
                }

                beforeDistributeConfirmed.destroy();
                // 单次第一轮操作铺货，失败需要执行ERP授权绑定等全流程
                handleDistribute(distributeData, true);
              }}
            >
              {$t("global-1688-ai-app.studio-canvas.toolbar.qdcj", "确定采集")}
            </Button>
          </div>
        ),
        onCancel: () => {
          beforeDistributeConfirmed.destroy();
        },
      });
    }
  };

  useEffect(() => {
    if (distributeMode) {
      aplus.record("/alphashop.32265064.distribute", "EXP");
    }

    if (!distributeMode && initAnimation === undefined) {
      return;
    }
    setInitAnimation(distributeMode);
  }, [distributeMode]);

  useEffect(() => {
    if (initAnimation && menuGroupRef.current) {
      const rect = menuGroupRef.current.getBoundingClientRect();
      const width = rect.width;
      rootRef.current?.style.setProperty(
        "--toolbar-menu-group-width",
        `${width}px`
      );
    }

    if (!initAnimation && distributeGroupRef.current) {
      const rect = distributeGroupRef.current.getBoundingClientRect();
      const width = rect.width;
      rootRef.current?.style.setProperty(
        "--toolbar-distribute-group-width",
        `${width}px`
      );
    }
  }, [initAnimation]);

  return (
    <div
      ref={rootRef}
      className={classnames({
        [styles.toolbar]: true,
        [styles.distributeModeAnimationIn]: initAnimation,
        [styles.distributeModeAnimationOut]:
          initAnimation !== undefined && !initAnimation,
      })}
    >
      {/* 工具按钮 */}
      {tools.map((tool) => {
        if (tool.type === "add") {
          return;
        }

        return (
          <Tooltip key={tool.type} title={tool.tooltip}>
            <div
              onClick={() => onToolChange(tool.type)}
              className={classnames({
                [styles.toolButton]: true,
                [styles.active]: activeTool === tool.type,
              })}
            >
              <div className={styles.toolIcon}>{tool.icon}</div>
              <span className={styles.toolLabel}>{tool.label}</span>
            </div>
          </Tooltip>
        );
      })}

      <div className={styles.toolTransformGroup}>
        <div ref={menuGroupRef} className={styles.toolAddGroup}>
          <Dropdown
            align={{
              offset: [0, 12],
            }}
            disabled={disabled}
            menu={{
              className: styles.toolAddMenu,
              items: addMenuItems,
              onClick: handleMenuClick,
            }}
            trigger={["click"]}
          // placement="top"
          >
            <div
              className={classnames({
                [styles.toolButton]: true,
                [styles.disabled]: disabled,
                [styles.toolAdd]: true,
              })}
            >
              <div className={styles.toolIcon}>
                <IconAdd />
              </div>
              <span className={styles.toolLabel}>
                {$t("global-1688-ai-app.studio-canvas.toolbar.add", "添加")}
              </span>
            </div>
          </Dropdown>

          <div className={styles.toolbarDivider} />

          {/* 撤销工具 */}
          <Tooltip title={`${adeptKeyMap.control.symbol} + Z`} key="undo">
            <div
              className={classnames({
                [styles.toolButton]: true,
                [styles.disabled]: disabled || !canUndo,
                [styles.toolUndo]: true,
              })}
              onClick={() => {
                if (disabled || !canUndo) {
                  return;
                }

                canvasContext?.undo();
              }}
            >
              <div className={styles.toolIcon}>
                <IconUndo />
              </div>
              <span className={styles.toolLabel}>
                {$t("global-1688-ai-app.studio-canvas.toolbar.cx", "撤销")}
              </span>
            </div>
          </Tooltip>

          {/* 重做工具 */}
          <Tooltip
            title={`${adeptKeyMap.control.symbol} + Y / ${adeptKeyMap.control.symbol} + Shift + Z`}
            key="redo"
          >
            <div
              className={classnames({
                [styles.toolButton]: true,
                [styles.disabled]: disabled || !canRedo,
                [styles.toolRedo]: true,
              })}
              onClick={() => {
                if (disabled || !canRedo) {
                  return;
                }

                canvasContext?.redo();
              }}
            >
              <div className={styles.toolIcon}>
                <IconRedo />
              </div>
              <span className={styles.toolLabel}>
                {$t("global-1688-ai-app.studio-canvas.toolbar.zz", "重做")}
              </span>
            </div>
          </Tooltip>
        </div>

        {/* 铺货工具 */}
        <div className={styles.toolDistributeGroup} ref={distributeGroupRef}>
          <div className={styles.toolbarDivider} />
          <div className={styles.toolLabel}>
            {$t(
              "global-1688-ai-app.studio-canvas.toolbar.yxproductk",
              `已选商品卡：${selectedIds.length}`,
              [selectedIds.length]
            )}
          </div>
          <Button
            type="primary"
            disabled={!selectedIds.length}
            onClick={() => {
              aplus.record("/alphashop.32265064.distribute", "CLK");
              handleDistributeConfirm();
            }}
          >
            {$t(
              "global-1688-ai-app.studio-canvas.toolbar.confirmcj",
              "确认采集"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
});

export default CanvasToolbar;
