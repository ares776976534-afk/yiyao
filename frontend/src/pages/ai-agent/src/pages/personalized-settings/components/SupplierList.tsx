import { useEffect, useState, useRef, useCallback } from 'react';
import styles from './supplierList.module.css';
import { WantWantIcon, SearchIcon, AddressIcon, SuperFactoryIcon, CattleIcon, TrashCanIcon } from '@/components/Icon';
import { Input, Button, message, Divider, Popconfirm } from 'antd';
import InfiniteScroll from 'react-infinite-scroll-component';
import { SyncOutlined, PlusOutlined, CheckCircleFilled, ExclamationCircleFilled, InfoCircleFilled, WarningFilled } from '@ant-design/icons';
import { sync, list, deleteData, add, canStatus } from '../services';
import AddSupplierModal from './AddSupplierModal';
import { $t } from '@/i18n';

const tagIcon = {
    pmplus: <SuperFactoryIcon />, // 超级工厂
    sourceProvider: null, // 源头工厂
    pm: <CattleIcon />, // 实力商家
    tp: null, // 诚信通 5 年
};

// 供应商卡片组件
const SupplierCard = ({ item, index, openPopconfirmIndex, onDeleteSupplier, onPopconfirmChange }: {
    item: any;
    index: number;
    openPopconfirmIndex: number | null;
    onDeleteSupplier: (wangwangId: string) => void;
    onPopconfirmChange: (index: number | null) => void;
}) => {
    const { companyName, wangwangId, headImg, tag, location, primaryCategory, serviceInfo, source } = item;
    
    return (
        <div className={styles.tableList}>
            <img className={styles.image} src={headImg} alt="" />
            <div className={styles.content}>
                <div className={styles.title}>
                    <span className={styles.titleText}>{companyName}</span>
                    <div className={styles.shop}>
                        <WantWantIcon className={styles.shopIcon} />
                        <span className={styles.shopName}>{wangwangId}</span>
                    </div>
                </div>
                <div className={styles.tag}>
                    {tag?.length > 0 && (
                        <>
                            <div className={styles.merchantTag}>
                                {tag?.map((ele: any, tagIndex: number) => (
                                    <div key={`provider-tag-${tagIndex}-${ele.code}`} className={`${styles.merchantTagItem} ${styles[ele.code]}`}>
                                        {tagIcon[ele.code]}
                                        {ele.value}
                                    </div>
                                ))}
                            </div>
                            <Divider type="vertical" />
                        </>
                    )}
                    <div className={styles.address}>
                        <AddressIcon className={styles.addressIcon} />
                        <span className={styles.addressName}>{location}</span>
                    </div>
                    <Divider type="vertical" />
                    <div className={styles.primaryCategory}>{$t("global-1688-ai-app.personalized-settings.SupplierList.zy", `主营：${primaryCategory}`, [primaryCategory])}</div>
                </div>
                <div className={styles.serviceInfo}>
                    {serviceInfo && serviceInfo.length && serviceInfo.map((ele: any, serviceIndex: number) => (
                        <>
                            <div key={ele.k} className={styles.serviceInfoItem}>
                                <span className={styles.serviceInfoKey}>{ele.k}</span>
                                <span className={styles.serviceInfoValue}>{ele.v}</span>
                            </div>
                            {serviceInfo.length > serviceIndex + 1 && <Divider type="vertical" />}
                        </>
                    ))}
                </div>
            </div>
            <div className={styles.trashCanContainer}>
                <div className={styles.autoSync}>{source}</div>
                {source === '手动添加' && (
                    <Popconfirm
                        placement="bottomLeft"
                        title={false}
                        description={
                            <div className={styles.trashCanDescription}>{$t("global-1688-ai-app.personalized-settings.SupplierList.deRenDe", "删除后将不可恢复，是否确认删除？")}</div>
                        }
                        okText={$t("global-1688-ai-app.personalized-settings.SupplierList.confirmDelete", "确认删除")}
                        cancelText={$t("global-1688-ai-app.personalized-settings.SupplierList.cancel", "取消")}
                        okButtonProps={{
                            className: styles.trashCanPopconfirm,
                        }}
                        onConfirm={() => onDeleteSupplier(wangwangId)}
                        onOpenChange={(visible) => onPopconfirmChange(visible ? index : null)}
                        icon={false}
                    >
                        <div className={`${styles.trashCan} ${openPopconfirmIndex === index ? styles.trashCanActive : ''}`}>
                            <TrashCanIcon />
                        </div>
                    </Popconfirm>
                )}
            </div>
        </div>
    );
};

const SupplierList = () => {
    const [supplierList, setSupplierList] = useState<any[]>([]);
    const [pageNum, setPageNum] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [companyName, setCompanyName] = useState('');
    const [isFirstSearch, setIsFirstSearch] = useState(true);
    const [openPopconfirmIndex, setOpenPopconfirmIndex] = useState<number | null>(null);
    const [open, setOpen] = useState(false);
    const [canStatusText, setCanStatusText] = useState($t("global-1688-ai-app.personalized-settings.SupplierList.t8r", "同步1688收藏"));
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncPollingTimer, setSyncPollingTimer] = useState<NodeJS.Timeout | null>(null);
    const [messageApi, contextHolder] = message.useMessage();
    const searchTimerRef = useRef<NodeJS.Timeout | null>(null);

    const MessageContact = (params) => {
      messageApi.open({
        className: styles.messageContact,
        ...params,
      });
    };
    // 常用的搜索参数
    const getSearchParams = (customParams = {}) => ({
        companyName,
        pageNum: 1,
        pageSize: 10,
        ...customParams
    });

    // 防抖搜索函数
    const debouncedSearch = useCallback((searchValue: string) => {
        // 清除之前的定时器
        if (searchTimerRef.current) {
            clearTimeout(searchTimerRef.current);
        }

        // 设置新的定时器
        searchTimerRef.current = setTimeout(() => {
            // 直接发起搜索，允许空字符串查询所有数据
            const searchParams = { companyName: searchValue, pageNum: 1, pageSize: 10 };
            list(searchParams).then((res: any) => updateSupplierList(res, searchParams, false));
        }, 500); // 1秒后执行搜索
    }, []);
    // 统一的列表请求处理函数
    const updateSupplierList = (res: any, params: any, isLoadMore: boolean = false) => {
        const { data = [], success = false, msg = '', total = 0 } = res;
        
        if (success) {
            setPageNum(params.pageNum || 1);
            setPageSize(params.pageSize || 10);
            
            if (isLoadMore && params.pageNum > 1) {
                setSupplierList(prevList => {
                    const newList = [...prevList, ...data];
                    return newList;
                });
            } else {
                setSupplierList(data);
            }
            
            setTotal(total);
            return data;
        } else {
            MessageContact({
                content: msg,
                icon: <ExclamationCircleFilled style={{ color: '#fff', fontSize: 16 }} />,
            })
            return [];
        }
    };

    const handleSearch = (params: { companyName?: string, pageNum?: number, pageSize?: number }) => {
        // 确保搜索时从第1页开始
        const searchParams = { ...params, pageNum: params.pageNum || 1 };
        
        list(searchParams).then((res: any) => updateSupplierList(res, searchParams, false));
    };
    // 滚动到底加载更多
    const handleLoadMore = () => {
        const nextPageParams = { companyName, pageNum: pageNum + 1, pageSize: pageSize };  
        list(nextPageParams).then((res: any) => {
            updateSupplierList(res, nextPageParams, true);
        });
    };
    useEffect(() => {
        // 初始化时获取供应商列表
        const initParams = { pageNum: 1, pageSize: 10 };
        list(initParams).then((res: any) => {
            const data = updateSupplierList(res, initParams, false);
            setIsFirstSearch(data.length === 0);
        });

        // 检查是否正在同步中
        checkInitialSyncStatus();
    }, []);

    // 清理定时器
    useEffect(() => {
        return () => {
            if (syncPollingTimer) {
                clearInterval(syncPollingTimer);
            }
            if (searchTimerRef.current) {
                clearTimeout(searchTimerRef.current);
            }
        };
    }, [syncPollingTimer]);

    // 重置同步状态
    const resetSyncStatus = () => {
        setIsSyncing(false);
        setCanStatusText($t("global-1688-ai-app.personalized-settings.SupplierList.t8r", "同步1688收藏"));
        if (syncPollingTimer) {
            clearInterval(syncPollingTimer);
            setSyncPollingTimer(null);
        }
    };

    // 获取供应商库状态,如果返回的data为true,则同步完成，否则继续同步，一值到同步结束为止
    const getCanStatus = async () => {
        try {
            const res = await canStatus({});
            
            if (res?.success && res?.data === true) {
                resetSyncStatus();
                
                // 同步完成后发起list请求，并更新isFirstSearch状态
                const listParams = getSearchParams();
                list(listParams).then((res: any) => {
                    const data = updateSupplierList(res, listParams, false);
                    setIsFirstSearch(data.length === 0);
                });
                MessageContact({
                    icon: <CheckCircleFilled style={{ color: '#fff', fontSize: 16 }} />,
                    content: $t("global-1688-ai-app.personalized-settings.SupplierList.tbcomplete", "同步完成！"),
                })
                
                return true; // 同步完成
            }
            
            return false; // 继续同步
        } catch (error) {
            resetSyncStatus();
            MessageContact({
                content: $t("global-1688-ai-app.personalized-settings.SupplierList.jteR", "检查同步状态失败，请稍后重试"),
                icon: <ExclamationCircleFilled style={{ color: '#fff', fontSize: 16 }} />,
            })
            return true; // 停止轮询
        }
    };

    // 开始轮询同步状态
    const startSyncPolling = () => {
        const timer = setInterval(async () => {
            const isCompleted = await getCanStatus();
            if (isCompleted) {
                clearInterval(timer);
                setSyncPollingTimer(null);
            }
        }, 2000); // 每2秒检查一次
        
        setSyncPollingTimer(timer);
    };

    // 检查初始同步状态
    const checkInitialSyncStatus = async () => {
        try {
            const res = await canStatus({});
            
            // 如果返回的data不为true，说明可能正在同步中
            if (res?.success && res?.data !== true) {
                setIsSyncing(true);
                setCanStatusText($t("global-1688-ai-app.personalized-settings.SupplierList.zztb", "正在同步..."));
                // 开始轮询检查同步状态
                startSyncPolling();
            }
        } catch (error) {
            // 初始检查失败不需要特别处理，保持默认状态即可
            console.warn('初始同步状态检查失败:', error);
        }
    };
    const handleSync1688Collect = async () => {
        if (isSyncing) {
            MessageContact({
                content: $t("global-1688-ai-app.personalized-settings.SupplierList.zpe", "正在同步中，请稍候..."),
                icon: <WarningFilled style={{ color: '#fff', fontSize: 16 }} />,
            })
            return;
        }

        try {
            setIsSyncing(true);
            setCanStatusText($t("global-1688-ai-app.personalized-settings.SupplierList.zztb", "正在同步..."));
            
            const syncRes = await sync({});
            
            if (syncRes?.success) {
                MessageContact({
                    content: $t("global-1688-ai-app.personalized-settings.SupplierList.st8rlw", "开始同步1688收藏，请稍候..."),
                    icon: <InfoCircleFilled style={{ color: '#fff', fontSize: 16 }} />,
                })
                startSyncPolling();
            } else {
                resetSyncStatus();
                MessageContact({
                    content: syncRes?.msg || $t("global-1688-ai-app.personalized-settings.SupplierList.qaqt", "启动同步失败，请稍后重试"),
                    icon: <ExclamationCircleFilled style={{ color: '#fff', fontSize: 16 }} />,
                })
            }
        } catch (error) {
            resetSyncStatus();
            MessageContact({
                content: $t("global-1688-ai-app.personalized-settings.SupplierList.qaqt", "启动同步失败，请稍后重试"),
                icon: <ExclamationCircleFilled style={{ color: '#fff', fontSize: 16 }} />,
            })
        }
    };
    // 通用的操作成功后处理
    const handleOperationSuccess = (res: any, successMsg: string, errorMsg: string) => {
        if (res?.success) {
            MessageContact({
                content: res.msg || successMsg || $t("global-1688-ai-app.personalized-settings.SupplierList.addSuccess", "添加成功"),
                icon: <CheckCircleFilled style={{ color: '#fff', fontSize: 16 }} />,
            })
            // 操作成功后重新搜索第一页数据
            const searchParams = getSearchParams();
            list(searchParams).then((res: any) => updateSupplierList(res, searchParams, false));
        } else {
            MessageContact({
                content: res.msg || errorMsg || $t("global-1688-ai-app.personalized-settings.SupplierList.systemAbnormal", "系统异常"),
                icon: <ExclamationCircleFilled style={{ color: '#fff', fontSize: 16 }} />,
            })
        }
    };

    // 删除供应商
    const handleDeleteSupplier = (wangwangId: string) => {
        deleteData({ wangwangId: [wangwangId] }).then((res: any) => 
            handleOperationSuccess(res, $t("global-1688-ai-app.personalized-settings.SupplierList.deus", "删除供应商成功"), $t("global-1688-ai-app.personalized-settings.SupplierList.deleteFailed", "删除失败"))
        );
    };

    // 确认添加
    const onConfirm = (suppliers: any[]) => {
        add({ wangwangId: suppliers.map((ele: any) => ele.wangwangId) }).then((res: any) => {
            if (res.success) {
                MessageContact({
                    content: res.msg || $t("global-1688-ai-app.personalized-settings.SupplierList.addSuccess", "添加成功"),
                    icon: <CheckCircleFilled style={{ color: '#fff', fontSize: 16 }} />,
                })
                // 添加成功后重新搜索第一页数据
                const searchParams = getSearchParams();
                list(searchParams).then((res: any) => {
                    const data = updateSupplierList(res, searchParams, false);
                    // 添加成功后根据数据长度设置 isFirstSearch，有数据时切换到列表状态
                    setIsFirstSearch(data.length === 0);
                });
            } else {
                MessageContact({
                    content: res.msg || $t("global-1688-ai-app.personalized-settings.SupplierList.systemAbnormal", "系统异常"),
                    icon: <ExclamationCircleFilled style={{ color: '#fff', fontSize: 16 }} />,
                })
            }
        });
    };
    return (
        <div>
            {contextHolder}
            {!isFirstSearch ? (
                <div className={styles.supplierList}>
                    <div className={styles.searchContainer}>
                        <Input
                            placeholder={$t("global-1688-ai-app.personalized-settings.SupplierList.srrsw", "支持搜索供应商名称及旺旺ID")}
                            suffix={<SearchIcon style={{ color: '#86909c', cursor: 'pointer' }} onClick={() => handleSearch(getSearchParams())} />}
                            value={companyName}
                            onChange={(e) => {
                                const value = e.target.value;
                                setCompanyName(value);
                                debouncedSearch(value);
                            }}
                            style={{ width: '360px', borderRadius: '8px', border: '1px solid #E7E8EE' }}
                            onPressEnter={() => handleSearch(getSearchParams())}
                        />
                        <div className={styles.searchButton}>
                            <div className={styles.searchButtonAdd} onClick={() => setOpen(true)}>
                                <PlusOutlined />{$t("global-1688-ai-app.personalized-settings.SupplierList.sdadd", "手动添加")}</div>
                            <Divider type="vertical" className={styles.divider} />
                            <div className={styles.searchButtonSync} onClick={handleSync1688Collect}>
                                <SyncOutlined spin={isSyncing} />
                                {canStatusText}
                            </div>
                        </div>
                    </div>
                    <div id="scrollableDiv" className={styles.scrollContainer}>
                        <InfiniteScroll
                            dataLength={supplierList?.length || 0}
                            next={handleLoadMore}
                            hasMore={total > 0 && (supplierList?.length || 0) < total}
                            loader={<div style={{ textAlign: 'center', padding: 12, color: '#86909C' }}>{$t("global-1688-ai-app.personalized-settings.SupplierList.loading", "加载中...")}</div>}
                            scrollableTarget="scrollableDiv"
                            style={{display: 'flex', flexDirection: 'column', gap: 16, ...(supplierList?.length > 0 ? { } : { justifyContent: 'center', alignItems: 'center' })}}
                        >
                        {supplierList?.length > 0 ? supplierList.map((item, i) => (
                            <SupplierCard 
                                key={item.wangwangId}
                                item={item}
                                index={i}
                                openPopconfirmIndex={openPopconfirmIndex}
                                onDeleteSupplier={handleDeleteSupplier}
                                onPopconfirmChange={setOpenPopconfirmIndex}
                            />
                        )) : <div className={styles.noSearchResult}>{$t("global-1688-ai-app.personalized-settings.SupplierList.zrs", "暂无搜索结果")}</div>}
                        </InfiniteScroll>
                    </div>
                </div>
            ) : (
                <div className={styles.supplierLibrary}>
                    <div className={styles.header}>
                        <img className={styles.headerImage} src="https://img.alicdn.com/imgextra/i2/O1CN01zTo4tk1D6zdCxWUIo_!!6000000000168-2-tps-176-176.png" alt="" srcSet="" />
                        <div className={styles.headerTitle}>{$t("global-1688-ai-app.personalized-settings.SupplierList.itSrdd", "导入1688卖家，更好地管理你的供应商库")}</div>
                    </div>
                    <div className={styles.footer}>
                        <Button
                            className={styles.footerButton}
                            color="primary"
                            variant="solid"
                            icon={<SyncOutlined spin={isSyncing} />}
                            onClick={handleSync1688Collect}
                            disabled={isSyncing}
                        >
                            {canStatusText}
                        </Button>
                        <Button
                            className={styles.autoFooterButton}
                            color="primary"
                            variant="outlined"
                            icon={<PlusOutlined />}
                            onClick={() => setOpen(true)}
                        >{$t("global-1688-ai-app.personalized-settings.SupplierList.sdaddgys", "手动添加供应商")}</Button>
                    </div>
                </div>
            )}
            <AddSupplierModal open={open} onClose={() => setOpen(false)} onConfirm={onConfirm}  />
        </div>
    );
};

export default SupplierList;