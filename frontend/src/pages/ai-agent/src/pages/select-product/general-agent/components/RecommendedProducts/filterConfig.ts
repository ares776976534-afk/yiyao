import { $t } from "@/i18n";
export const filterConfig = {
  platform:[
    {
      label:"1688",
      code:"1688",
      icon:"https://img.alicdn.com/imgextra/i4/O1CN01DlTIAW1RtSC8y6HYI_!!6000000002169-2-tps-80-80.png",
      filter:[
        {
          type:"rangeInput",
          label: $t("global-1688-ai-app.ChatFlow.ProductDetailTable.price", "价格"),
          inputFormat:"double",
          minCode:"priceStart",
          maxCode:"priceEnd",
          minBackgroundWords: $t("global-1688-ai-app.select-product.RecommendedProducts.filterConfig.minBackgroundWords", "最低价"),
          maxBackgroundWords: $t("global-1688-ai-app.select-product.RecommendedProducts.filterConfig.maxBackgroundWords", "最高价")
        },
        {
          type:"input",
          label: $t("global-1688-ai-app.select-product.general-agent.FormatList.KeywordDetails.monthSales", "月销量"),
          code:"sold30d",
          sold30dPlaceholder: $t("global-1688-ai-app.seller-center.order-management.OrderPagination.qinput", "请输入")
        },
        {
          type:"rangeInput",
          label: $t("global-1688-ai-app.ChatFlow.SameInfo.rating", "评分"),
          inputFormat:"double",
          minCode:"ratingStart",
          maxCode:"ratingEnd",
          minBackgroundWords: $t("global-1688-ai-app.ChatFlow.SameInfo.minBackgroundWords", "最低分"),
          maxBackgroundWords: $t("global-1688-ai-app.ChatFlow.SameInfo.maxBackgroundWords", "最高分")
        },
        {
          type:"timeRangeInput",
          label: $t("global-1688-ai-app.select-product.ChatFlow.ComparedDetailTable.sjtime", "上架时间"),
          code:"launchTime",
          startPlaceholder: $t("global-1688-ai-app.seller-center.credit-management.ExchangeRecord.startTime", "开始时间"),
          endPlaceholder: $t("global-1688-ai-app.seller-center.credit-management.ExchangeRecord.endTime", "结束时间")
        },
      ],
      sort:[
        // {
        //   label: $t("global-1688-ai-app.select-product.RecommendedProducts.filterConfig.relation", "按相似度排序"),
        //   code:"relation",
        //   supportSortType:["ASC"]
        // },
        {
          label: $t("global-1688-ai-app.select-product.RecommendedProducts.filterConfig.sellingPrice", "按价格排序"),
          code:"sellingPrice",
          supportSortType:["ASC","DESC"]
        },
        {
          label: $t("global-1688-ai-app.select-product.RecommendedProducts.filterConfig.sold30d", "按销量排序"),
          code:"sold30d",
          supportSortType:["ASC","DESC"]
        }
      ]
    }
  ],
}