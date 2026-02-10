export const tableSchema = {
  drugs: {
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '名称', dataIndex: 'name' },
      { title: '编码', dataIndex: 'code' },
      { title: '规格', dataIndex: 'specification' },
      { title: '单位', dataIndex: 'unit', width: 80 }
    ],
    searchFields: ['name', 'code', 'specification']
  },
  stock: {
    columns: [
      { title: '药品', dataIndex: 'name' },
      { title: '编码', dataIndex: 'code' },
      { title: '规格', dataIndex: 'specification' },
      { title: '库存', dataIndex: 'stock', width: 100 },
      { title: '单位', dataIndex: 'unit', width: 60 }
    ],
    searchFields: ['name', 'code', 'specification']
  },
  records: {
    columns: [
      { title: '日期', dataIndex: 'record_date', width: 110 },
      { title: '类型', dataIndex: 'type', width: 80, render: { type: 'map', map: { in: '入库', out: '出库' } } },
      { title: '药品', dataIndex: 'drug_name' },
      { title: '数量', dataIndex: 'quantity', width: 80 },
      { title: '单位', dataIndex: 'unit', width: 60 },
      { title: '批号', dataIndex: 'batch_no', width: 100 },
      { title: '经手人', dataIndex: 'personnel_name' },
      { title: '备注', dataIndex: 'note' }
    ],
    searchFields: ['drug_name', 'batch_no', 'personnel_name', 'note'],
    filters: [
      { key: 'type', label: '类型', type: 'select', options: [{ value: 'in', label: '入库' }, { value: 'out', label: '出库' }] },
      { key: 'drug_id', label: '药品', type: 'select', optionsApi: '/drugs', optionsKey: 'id', optionsLabel: 'name' },
      { key: 'personnel_id', label: '经手人', type: 'select', optionsApi: '/personnel', optionsKey: 'id', optionsLabel: 'name' },
      { key: 'dateRange', label: '日期', type: 'dateRange', startKey: 'start_date', endKey: 'end_date' }
    ]
  },
  personnel: {
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '姓名', dataIndex: 'name' },
      { title: '电话', dataIndex: 'phone' },
      { title: '类型', dataIndex: 'type', width: 100 },
      { title: '创建时间', dataIndex: 'created_at', width: 180 }
    ],
    searchFields: ['name', 'phone', 'type']
  },
  'sales-by-personnel': {
    columns: [
      { title: '日期', dataIndex: 'record_date', width: 110 },
      { title: '人员', dataIndex: 'personnel_name' },
      { title: '药品', dataIndex: 'drug_name' },
      { title: '销售数量', dataIndex: 'total_quantity', width: 100 },
      { title: '单位', dataIndex: 'unit', width: 60 }
    ],
    searchFields: ['personnel_name', 'drug_name']
  },
  merchants: {
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '商家名称', dataIndex: 'name' },
      { title: '联系人', dataIndex: 'contact' },
      { title: '电话', dataIndex: 'phone' },
      { title: '地址', dataIndex: 'address', ellipsis: true }
    ],
    searchFields: ['name', 'contact', 'phone', 'address']
  },
  franchisees: {
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '加盟商名称', dataIndex: 'name' },
      { title: '联系人', dataIndex: 'contact' },
      { title: '电话', dataIndex: 'phone' },
      { title: '分销类型', dataIndex: 'dist_type', width: 100 },
      { title: '下级成员', dataIndex: 'sub_count', width: 80 },
      { title: '分销订单', dataIndex: 'order_count', width: 80 },
      { title: '累计金额', dataIndex: 'total_amount', width: 100 },
      { title: '已结算', dataIndex: 'settled_amount', width: 100 },
      { title: '地址', dataIndex: 'address', ellipsis: true }
    ],
    searchFields: ['name', 'contact', 'phone', 'dist_type']
  },
  users: {
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '用户名', dataIndex: 'username' },
      { title: '电话', dataIndex: 'phone' },
      { title: '角色', dataIndex: 'role', width: 80, render: { type: 'map', map: { admin: '管理员', manager: '经理', staff: '员工', member: '会员' } } },
      { title: '状态', dataIndex: 'status', width: 80, render: { type: 'map', map: { active: '正常', inactive: '停用', banned: '封禁' } } },
      { title: '渠道', dataIndex: 'channel', width: 80 },
      { title: '性别', dataIndex: 'gender', width: 60, render: { type: 'map', map: { male: '男', female: '女' } } },
      { title: '年龄', dataIndex: 'age', width: 60 },
      { title: '城市', dataIndex: 'city', width: 80 }
    ],
    searchFields: ['username', 'phone', 'channel', 'city']
  },
  riders: {
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '姓名', dataIndex: 'name' },
      { title: '电话', dataIndex: 'phone' },
      { title: '状态', dataIndex: 'status', width: 80, render: { type: 'map', map: { active: '在线', rest: '休息', inactive: '离职' } } },
      { title: '配送区域', dataIndex: 'area', width: 100 }
    ],
    searchFields: ['name', 'phone', 'area']
  },
  news: {
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '标题', dataIndex: 'title' },
      { title: '作者', dataIndex: 'author', width: 80 },
      { title: '分类', dataIndex: 'category', width: 100 },
      { title: '状态', dataIndex: 'status', width: 80, render: { type: 'map', map: { published: '已发布', draft: '草稿' } } },
      { title: '创建时间', dataIndex: 'created_at', width: 180 }
    ],
    searchFields: ['title', 'author', 'content']
  },
  lottery: {
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '活动名称', dataIndex: 'name' },
      { title: '状态', dataIndex: 'status', width: 80, render: { type: 'map', map: { active: '进行中', ended: '已结束', upcoming: '待开始' } } },
      { title: '开始日期', dataIndex: 'start_date', width: 110 },
      { title: '结束日期', dataIndex: 'end_date', width: 110 },
      { title: '奖品', dataIndex: 'prize', ellipsis: true }
    ],
    searchFields: ['name', 'prize']
  },
  carousel: {
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '标题', dataIndex: 'title' },
      { title: '图片链接', dataIndex: 'image_url', ellipsis: true },
      { title: '跳转链接', dataIndex: 'link_url', width: 100 },
      { title: '排序', dataIndex: 'sort', width: 60 },
      { title: '状态', dataIndex: 'status', width: 80, render: { type: 'map', map: { active: '启用', inactive: '禁用' } } }
    ],
    searchFields: ['title', 'image_url']
  },
  'purchase-orders': {
    columns: [
      { title: '订单号', dataIndex: 'order_no' },
      { title: '药品', dataIndex: 'drug_name' },
      { title: '供应商', dataIndex: 'merchant_name' },
      { title: '数量', dataIndex: 'quantity', width: 80 },
      { title: '状态', dataIndex: 'status', width: 80, render: { type: 'map', map: { pending: '待确认', confirmed: '已确认', shipped: '已发货', completed: '已完成' } } },
      { title: '日期', dataIndex: 'order_date', width: 110 }
    ],
    searchFields: ['order_no', 'drug_name', 'merchant_name']
  },
  orders: {
    columns: [
      { title: '订单号', dataIndex: 'order_no' },
      { title: '药品', dataIndex: 'drug_name' },
      { title: '数量', dataIndex: 'quantity', width: 80 },
      { title: '经手人', dataIndex: 'personnel_name' },
      { title: '日期', dataIndex: 'order_date', width: 110 }
    ],
    searchFields: ['order_no', 'drug_name', 'personnel_name']
  },
  'coupon-orders': {
    columns: [
      { title: '订单号', dataIndex: 'order_no' },
      { title: '用户', dataIndex: 'username' },
      { title: '积分券', dataIndex: 'coupon_name' },
      { title: '数量', dataIndex: 'quantity', width: 80 },
      { title: '日期', dataIndex: 'created_at', width: 180 }
    ],
    searchFields: ['order_no', 'username', 'coupon_name']
  },
  withdrawals: {
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '申请人', dataIndex: 'username' },
      { title: '金额', dataIndex: 'amount', width: 100 },
      { title: '状态', dataIndex: 'status', width: 80, render: { type: 'map', map: { approved: '已通过', rejected: '已拒绝', pending: '待审核' } } },
      { title: '申请时间', dataIndex: 'created_at', width: 180 }
    ],
    searchFields: ['username', 'amount']
  },
  transactions: {
    columns: [
      { title: '流水号', dataIndex: 'trans_no' },
      { title: '类型', dataIndex: 'type', width: 80 },
      { title: '金额', dataIndex: 'amount', width: 100 },
      { title: '备注', dataIndex: 'note' },
      { title: '时间', dataIndex: 'created_at', width: 180 }
    ],
    searchFields: ['trans_no', 'type', 'note']
  },
  promotions: {
    columns: [
      { title: 'ID', dataIndex: 'id', width: 60 },
      { title: '计划名称', dataIndex: 'name' },
      { title: '推广类型', dataIndex: 'type', width: 80 },
      { title: '投入金额', dataIndex: 'input', width: 100 },
      { title: '产出金额', dataIndex: 'output', width: 100 },
      { title: '月份', dataIndex: 'month', width: 100 },
      { title: '状态', dataIndex: 'status', width: 80, render: { type: 'map', map: { active: '进行中', paused: '暂停', completed: '已完成' } } },
      { title: '创建时间', dataIndex: 'created_at', width: 180 }
    ],
    searchFields: ['name', 'type', 'month']
  }
};
