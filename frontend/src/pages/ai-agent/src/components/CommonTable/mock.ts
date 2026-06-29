export const mockTableData = {
  tableData: {
    headers: [
      {
        align: "center",
        colType: "image",
        key: "productImg",
        title: "商品图片",
        width: "100px",
        headerHoverText: "商品图片描述",
      },
      {
        align: "center",
        colType: "text_icon",
        key: "platform",
        title: "平台",
        width: "100px",
      },
      {
        align: "center",
        colType: "text_icon",
        key: "region",
        title: "国家",
        width: "100px",
      },
      {
        align: "center",
        colType: "text",
        key: "productTitle",
        title: "商品标题",
        width: "100px",
        properties: {
          showRowNum: 1,
          showType: "collapse",
        },
      },
      {
        align: "center",
        colType: "text",
        key: "spItemCnt",
        title: "同款数",
        width: "100px",
      },
      { align: "center", colType: "text", key: "category", title: "类目" },
      {
        align: "center",
        colType: "text",
        key: "launchTime",
        title: "上架时间",
        width: "100px",
      },
      {
        align: "center",
        colType: "text",
        key: "priceRange",
        title: "价格范围",
        width: "100px",
      },
      {
        align: "center",
        colType: "text",
        key: "ratingRange",
        title: "评分范围",
        width: "100px",
      },
      {
        align: "center",
        colType: "text",
        key: "soldCnt30d",
        title: "商品总月销量(近1个月)",
        width: "100px",
      },
      {
        align: "center",
        colType: "trend_line",
        key: "v",
        title: "趋势",
        width: "200px",
      },
    ],
    meta: { tableSubTitle: "图搜相关商品", tableTitle: "商品列表" },
    rowData: [
      {
        v: {
          value: [
            {
              timeScale: "month",
              timeValue: "202412",
              trendValue: "2",
            },
            {
              timeScale: "month",
              timeValue: "202501",
              trendValue: "12",
            },
            {
              timeScale: "month",
              timeValue: "202502",
              trendValue: "2",
            },
            {
              timeScale: "month",
              timeValue: "202503",
              trendValue: "0",
            },
            {
              timeScale: "month",
              timeValue: "202504",
              trendValue: "0",
            },
            {
              timeScale: "month",
              timeValue: "202505",
              trendValue: "0",
            },
            {
              timeScale: "month",
              timeValue: "202506",
              trendValue: "0",
            },
            {
              timeScale: "month",
              timeValue: "202507",
              trendValue: "0",
            },
            {
              timeScale: "month",
              timeValue: "202508",
              trendValue: "1",
            },
            {
              timeScale: "month",
              timeValue: "202509",
              trendValue: "0",
            },
            {
              timeScale: "month",
              timeValue: "202510",
              trendValue: "0",
            },
            {
              timeScale: "month",
              timeValue: "202511",
              trendValue: "1",
            },
          ],
        },
        productImg: {
          imgUrl:
            "https://image-transform.oss-accelerate.aliyuncs.com/795e9b29b8bb41c18bc20241d52edc77",
          imgLink: "https://www.amazon.co.jp/dp/B0D4JM9KWW/",
        },
        platform: {
          text: "Amazon",
          icon: "https://gw.alicdn.com/imgextra/i1/O1CN01g3yyE51dJ45s3B70l_!!6000000003714-2-tps-112-112.png",
        },
        region: {
          text: "日本",
          icon: "https://gw.alicdn.com/imgextra/i3/O1CN01Bb1Iv31DS3rbJLawQ_!!6000000000214-2-tps-112-112.png",
        },
        productTitle: "https://www.amazon.co.jp/dp/B0D4JM9KWW/",
        spItemCnt: { text: 4 },
        category: {
          text: "服装，鞋子和珠宝-> 妇女-> 服装-> 上衣，t恤和上衣-> 时尚连帽衫和运动衫-> 时尚连帽衫",
        },
        launchTime: { text: "2024-05-19" },
        priceRange: { text: "JP¥2260.0" },
        ratingRange: { text: "2.5" },
        soldCnt30d:
          "服装，鞋子和珠宝-> 妇女-> 服装-> 上衣，t恤和上衣-> 时尚连帽衫和运动衫-> 时尚连帽衫",
      },
    ],
  },
};
