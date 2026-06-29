import { Button, Tag, Avatar, Table, Tooltip } from 'antd';
import styles from './SupplierComparison.module.css';
import { SupplierIcon, WantWantIcon, ShopOrderIcon, PositiveReviewIcon } from '@/components/Icon';
import type {
  TypeSupplierComparisonData,
  TypeProcessedInquiryAnswer,
  TypeTableColumn,
  TypeSellerInfo,
  TypeActionButton
} from '../types';
import { CheckMarkIcon } from '@/components/Icons';
import { $t } from '@/i18n';

interface TypeSupplierComparisonProps {
  data: TypeSupplierComparisonData | null;
  tableHead?: string[];
  inquiryAnswers?: TypeProcessedInquiryAnswer[];
}

function SupplierComparison({ data, tableHead, inquiryAnswers }: TypeSupplierComparisonProps) {
  // 生成动态列配置
  const generateColumns = (): TypeTableColumn[] => {
    const columns: TypeTableColumn[] = [];

    // 供应商信息列（固定第一列）
    columns.push({
      title: $t("global-1688-ai-app.inquiry.detail.SupplierComparison.gft", "供应商信息"),
      dataIndex: 'sellerInfo',
      key: 'sellerInfo',
      fixed: 'left',
      width: 240,
      render: (sellerInfo: TypeSellerInfo) => (
        <div className={sellerInfo?.isBest ? undefined : styles.supplierInfoTd}>
          {sellerInfo?.isBest && (
            <Tag color="orange" className={styles.recommendTag}>
              <PositiveReviewIcon className={styles.positiveReviewIcon} />
              <span className={styles.recommendText}>{$t("global-1688-ai-app.inquiry.detail.SupplierComparison.zod", "最佳推荐")}</span>
            </Tag>
          )}
          <div className={styles.supplierInfo}>
            <Avatar
              src={sellerInfo?.headImg}
              size={48}
              className={styles.supplierAvatar}
            />
            <div className={styles.supplierDetails}>
              <div className={styles.supplierName}>{sellerInfo?.companyName}</div>
              <div className={styles.supplierShop}>
                <WantWantIcon className={styles.shopIcon} />
                <span className={styles.shopName}>{sellerInfo?.wangwangId}</span>
              </div>
            </div>
          </div>
        </div>
      ),
    });

    // 动态数据列
    if (tableHead && tableHead.length > 0) {
      tableHead.forEach((header, index) => {
        columns.push({
          title: header,
          dataIndex: `data_${index}`,
          key: `data_${index}`,
          align: 'center' as const,
          render: (text: string) => <span className={styles.dataCellText}>{text || '-'}</span>,
        });
      });
    }
    columns.push({
      title: $t("global-1688-ai-app.inquiry.detail.SupplierComparison.xpd", "询盘完成度"),
      dataIndex: 'progress',
      key: 'progress',
      width: 120,
      fixed: 'right',
      align: 'center' as const,
      render: (value, record) => {
        console.log(record);
        return (
          <Tooltip
            placement="bottom"
            color='white'
            title={
              <div className={styles.completionTooltip}>
                <div className={styles.completionTooltipTitle}>{$t("global-1688-ai-app.inquiry.detail.SupplierComparison.xpissue", "询盘问题")}</div>
                <div className={styles.completionTooltipContent}>
                  {record?.questionProgress?.map((ele, index) => (
                    <div key={index} className={styles.completionTooltipContentItem}>
                      <CheckMarkIcon color={ele.isFinished ? '#22AC60' : '#CCCCD4'} />
                      {ele?.q}
                    </div>
                  ))}
                </div>
              </div>
            }
            arrow={true}
          >
            <div className={styles.completionCell}>
              <div className={styles.completionText}>{value}</div>
            </div>
          </Tooltip>
        );
      },
    })
    // 操作列（固定最后一列）
    columns.push({
      title: $t("global-1688-ai-app.inquiry.detail.SupplierComparison.cz", "操作"),
      dataIndex: 'actions',
      key: 'actions',
      width: 140,
      align: 'center' as const,
      fixed: 'right',
      render: (actions: TypeActionButton[], record: any) => (
        <div className={styles.operationCell}>
          {actions?.map((action, index) => (
            <Button
              key={index}
              size="small"
              type='primary'
              icon={action.type === 'primary' ? <ShopOrderIcon className={styles.shopOrderIcon} /> : <WantWantIcon className={styles.wantWantIcon} />}
              className={styles.actionButton + (action.type === 'primary' ? ' ' + styles.shopOrderBtn : ' ' + styles.wantWantBtn)}
              style={{ marginBottom: actions.length > 1 ? 4 : 0 }}
              onClick={() => action.onClick?.(record)}
            >
              {action.text}
            </Button>
          ))}
        </div>
      ),
    });

    return columns;
  };

  // 处理数据源
  const getDataSource = () => {
    if (inquiryAnswers && inquiryAnswers.length > 0) {
      // 使用传入的inquiryAnswers数据
      return inquiryAnswers.map((item, index) => {
        const processedItem: Record<string, any> = {
          ...item,
          key: index,
          sellerInfo: item.sellerInfo,
          progress: item.progress,
          actions: item.actions,
          questionProgress: item.questionProgress,
        };

        // 将动态数据映射到data_${index}格式
        if (tableHead && item.answers) {
          tableHead.forEach((header, headerIndex) => {
            processedItem[`data_${headerIndex}`] = item.answers[headerIndex];
          });
        }

        return processedItem;
      });
    }

    // 降级使用原有数据结构
    return data?.supplierCompare || [];
  };

  const columns = generateColumns();
  const dataSource = getDataSource();

  return (
    <div className={styles.supplierComparison}>
      <div className={styles.header}>
        <SupplierIcon className={styles.headerIcon} />
        <span className={styles.headerTitle}>{$t("global-1688-ai-app.inquiry.detail.SupplierComparison.gysdb", "供应商对比")}</span>
      </div>

      <Table
        dataSource={dataSource}
        columns={columns as any}
        pagination={false}
        bordered
        size="middle"
        scroll={{ x: 1200 }}
        className={styles.supplierTable}
        rowClassName={(record) =>
          record?.sellerInfo?.isBest ? styles.recommendedRow : ''
        }
      />
    </div>
  );
}

export default SupplierComparison;