import Konva from "konva";

const hasSetValue = (v) => {
  return v !== undefined;
};

export default (props: any) => {
  const {
    text = '',
    width,
    minWidth,
    maxWidth,
    height = 0,
    minHeight,
    maxHeight,
    fontSize,
    lineHeight = 1,
    padding,
    paddingLeft,
    paddingRight,
    paddingTop,
    paddingBottom,
    borderWidth = 0,
  } = props;

  const _pl = (hasSetValue(paddingLeft) ? paddingLeft : padding) || 0;
  const _pr = (hasSetValue(paddingRight) ? paddingRight : padding) || 0;
  const _pt = (hasSetValue(paddingTop) ? paddingTop : padding) || 0;
  const _pb = (hasSetValue(paddingBottom) ? paddingBottom : padding) || 0;
  const _borderTopWidth = (hasSetValue(borderWidth) ? borderWidth : borderWidth) || 0;
  const _borderBottomWidth = (hasSetValue(borderWidth) ? borderWidth : borderWidth) || 0;
  const _borderLeftWidth = (hasSetValue(borderWidth) ? borderWidth : borderWidth) || 0;
  const _borderRightWidth = (hasSetValue(borderWidth) ? borderWidth : borderWidth) || 0;

  const contentX = _pl + _borderLeftWidth;
  const contentY = _pt + _borderTopWidth;
  const outContentWidth = _pl + _pr + _borderLeftWidth + _borderRightWidth;
  const outContentHeight = _pt + _pb + _borderTopWidth + _borderBottomWidth;

  let _width = width;
  let _height = height;

  if (hasSetValue(minWidth)) {
    _width = Math.max(_width, minWidth);
  }
  
  if (hasSetValue(maxWidth)) {
    _width = Math.min(_width, maxWidth);
  }
  
  if (hasSetValue(minHeight)) {
    _height = Math.max(_height, minHeight);
  }

  if (hasSetValue(maxHeight)) {
    _height = Math.min(_height, maxHeight);
  }


  const textNode = new Konva.Text({
    text,
    width: _width ? _width - outContentWidth : undefined,
    // height: contentHeight,
    fontSize,
    lineHeight,
  });

  const contentWidth = textNode.width();
  const contentHeight = textNode.height();
  
  _width = contentWidth + outContentWidth;
  _height = contentHeight + outContentHeight;

  
  if (hasSetValue(minHeight)) {
    _height = Math.max(_height, minHeight );
  }

  if (hasSetValue(maxHeight)) {
    _height = Math.min(_height, maxHeight);
  }

  return {
    nodeType: 'text',
    x: contentX -_pl - _borderLeftWidth,
    y: contentY -_pt - _borderTopWidth,
    width: _width,
    height: _height,
    contentWidth,
    contentHeight,
    contentX,
    contentY,
    text,
    fontSize,
    lineHeight,
    firstLineHeight: lineHeight * fontSize,
  };
};
