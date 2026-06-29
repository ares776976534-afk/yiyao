const PRODUCT_INFO = {
    title: '产品信息',
    dataIndex: 'productInfo',
    cell: (value, index, record) => value
};
const PRODUCT_ID = {
    title: '产品ID',
    dataIndex: 'productId',
    cell: (value, index, record) => value
};
const PRODUCT_NAME = {
    title: '产品名称',
    dataIndex: 'productName',
    cell: (value, index, record) => value
};

export default () => {
    return [PRODUCT_INFO, PRODUCT_ID, PRODUCT_NAME]
}