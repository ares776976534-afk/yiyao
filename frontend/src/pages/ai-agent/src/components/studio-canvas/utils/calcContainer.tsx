import type { TypeNodeLayout } from "../types.d";

interface TypeContainerDisplayRow {
  columnCount: number;
  x: number;
  y: number;
  width: number;
  height: number;
  children: TypeContainerDisplayColumn[];
}

interface TypeContainerDisplayColumn {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface TypeContainerDisplay {
  width: number;
  height: number;
  rowCount: number;
  maxColumnCount: number;
  children: TypeContainerDisplayRow[];
  flatItems: TypeContainerDisplayColumn[];
}

const hasSetValue = (v) => {
  return v !== undefined;
};


const getDefaultSize = (): any => {
  return {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    children: [],
  };
}

export const calcMergeBlockModuleSize = (_list: any[], rowGap: number = 0): TypeNodeLayout => {
  const size = getDefaultSize();
  const list = _list.filter((item) => item.width && item.height);

  for (let i = 0; i < list.length; i++) {
    const item = list[i];

    // 更新y坐标
    item.y = size.height + (i > 0 ? rowGap : 0);

    const itemX = item.x || 0;
    const itemY = item.y || 0;

    size.x = i > 0 ? Math.min(size.x, itemX) : itemX;
    size.y = i > 0 ? Math.min(size.y, itemY) : itemY;

    size.width = Math.max(size.width, item.width);
    size.height += item.height + (i > 0 ? rowGap : 0);
  }

  size.children = list;

  return size;
}

export const calcRowContainer = (props: any, count: number) => {
  const {
    width,
    minWidth,
    maxWidth,
    height,
    minHeight,
    maxHeight,
    itemWidth,
    itemHeight,
    padding,
    paddingLeft,
    paddingRight,
    paddingTop,
    paddingBottom,
    rowGap,
    columnGap,
    borderWidth = 0,
  } = props;

  const _pl = (hasSetValue(paddingLeft) ? paddingLeft : padding) || 0;
  const _pr = (hasSetValue(paddingRight) ? paddingRight : padding) || 0;
  const _pt = (hasSetValue(paddingTop) ? paddingTop : padding) || 0;
  const _pb = (hasSetValue(paddingBottom) ? paddingBottom : padding) || 0;
  const _borderLeftWidth = (hasSetValue(borderWidth) ? borderWidth : borderWidth) || 0;
  const _borderRightWidth = (hasSetValue(borderWidth) ? borderWidth : borderWidth) || 0;
  const _borderTopWidth = (hasSetValue(borderWidth) ? borderWidth : borderWidth) || 0;
  const _borderBottomWidth = (hasSetValue(borderWidth) ? borderWidth : borderWidth) || 0;

  const containerLeftSize = _pl + _borderLeftWidth;
  const containerRightSize = _pr + _borderRightWidth;
  const containerTopSize = _pt + _borderTopWidth;
  const containerBottomSize = _pb + _borderBottomWidth;

  const display: TypeContainerDisplay = {
    width: 0,
    height: 0,
    rowCount: 0,
    maxColumnCount: 0,
    children: [],
    flatItems: [],
  };

  for (let i = 0, colIndex = 0; i < count;) {
    let _columnGap = colIndex > 0 ? columnGap : 0;
    let _rowGap = display.rowCount > 0 ? rowGap : 0;
    const currentRowIndex = display.rowCount;
    const list = display.children;
    let rowItem = list[currentRowIndex];

    if (!rowItem) {
      rowItem = {
        columnCount: 0,
        x: 0,
        y: ((list[currentRowIndex - 1]?.y || 0) || containerTopSize) + (list[currentRowIndex - 1]?.height || 0) + _rowGap,
        width: containerLeftSize,
        height: itemHeight,
        children: []
      };
      list[currentRowIndex] = rowItem;
    }

    // 预估总宽度 = 同一行前面元素的累计宽度(包含容器左边距+左边框) + 元素本身的宽度 + 元素之间的间距 + 容器右边距（包含右边框）
    let _width = rowItem.x + rowItem.width + itemWidth + _columnGap + containerRightSize;

    /**本行元素超出容器宽度，换到下一行
     * 本行索引值超出其它行中最小的列数，为了所有列对齐，要换到下一行
     */
    if (width >= _width) {
      let ceilItem = rowItem.children[colIndex];

      if (!ceilItem) {
        ceilItem = {
          x: 0,
          y: 0,
          width: 0,
          height: 0
        };
        rowItem.children[colIndex] = ceilItem;
      }

      display.flatItems.push(ceilItem);

      ceilItem.x = rowItem.x + rowItem.width + _columnGap;
      ceilItem.y = rowItem.y;
      ceilItem.width = itemWidth;
      ceilItem.height = itemHeight;

      rowItem.width = ceilItem.x + ceilItem.width;
      rowItem.columnCount++;

      display.height = Math.max(display.height, rowItem.y + rowItem.height);
      colIndex++;

      if (i === count - 1) {
        rowItem.width += containerRightSize;
        display.rowCount++;
        display.maxColumnCount = Math.max(display.maxColumnCount, rowItem.columnCount);
        // 多行取宽度最大并且不超出的一行作为总宽度
        display.width = Math.max(display.width, rowItem.width);
      }

      i++;
    } else {
      colIndex = 0;

      rowItem.width += containerRightSize;
      display.rowCount++;
      display.maxColumnCount = Math.max(display.maxColumnCount, rowItem.columnCount);
      // 多行取宽度最大并且不超出的一行作为总宽度
      display.width = Math.max(display.width, rowItem.width);
    }
  }

  display.height += containerBottomSize;

  if (hasSetValue(minWidth)) {
    display.width = Math.max(display.width, minWidth);
  }

  if (hasSetValue(maxWidth)) {
    display.width = Math.min(display.width, maxWidth);
  }

  if (hasSetValue(minHeight)) {
    display.height = Math.max(display.height, minHeight);
  }

  if (hasSetValue(maxHeight)) {
    display.height = Math.min(display.height, maxHeight);
  }

  return display;
};
