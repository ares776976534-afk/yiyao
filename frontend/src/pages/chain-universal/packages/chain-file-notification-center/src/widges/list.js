/* eslint-disable react/no-multi-comp */
/* eslint-disable react/prop-types */
import React from 'react';
import styled from 'styled-components';
import Icon from './icon';


const empty = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAE8AAABKBAMAAAAI1xQGAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAkUExURUdwTOvs8e7w9Ors8+bo7uzu8+Ll7tzf6enr8vHy99XY5Nbb7R0BMtAAAAAGdFJOUwB4uiJP2BHrmcMAAARWSURBVEjHjZaxjxw1FMb3bnMhdAEhRVCdrgikOxoSqEiDCNWJKnRRFGzvXUOBxrnZChBej6gCyd5YdAgxxNNRMNHMP8f3nj0zntmVuLd3uzuzv33P7/NnrxeLSbz7x+eL68SB939eC/zKe38t8AOAp/9LfXxyAs5/fTI+bu/lnHM5wMKN8ep0X9XLAK4S0P20r99qN6P7dQf8jJHzkLF7M5Cn+4QJYOF+77oBPNsHruYgMr/cAatqyLgVijn6QrkD5j4vnMxzPDtbDKCbS/lhlQewGrvmzL9NuaXMdbVystI6kYcyzwQ63GitL53UuproiJj67tMrgBmBeg5OBbq31UTqBDTxzYuUu+FK3Uf8/KqfzDKdnCPnZB8RxLS/Du9Sgd5HpQwh8R9Bzy6hSARa4sNSZEIKKUUsOIKJQIc8eOKESEC/I9AjvhYhJhlLuUoFuhcFYdCl4Dk9vRjF6cMINclIz5ejQLcGTxtjVMFXAdx6Ful4EKe3agDZhwxeBTAKtHQDaBFuAP9i8O9BoEM3eNoqpYLDS59XKF1V1etBoEdu8HTISFelrnxGoH8+OOib0VIlwNi1hofdVudwaRToICKkYsxI13A8xqir/LJf3rfotoG18bBlWUaQjRx874JAcA5cmyNDnqvClsUIGvIn70UvWRyj0RxGU+kVMsqwS02N/IrE2dC4gYIsCldIzlHCmVpqGNS5izck0NvoDIHisYwMSXAlBdjnYTaOFw8I4jHyyg41oSM0gONFFreis8V9nWS8DF1oiAyMfKxo2gRlfIsa0aROSLXh11XJ3gwLg+bg9uIwp07y2GImeXnLzKV2D4rrWUjitCLMYsIUzynN4Z1YtefCIzNKKNl639a+UeyKo5TiEBpLVwkrat+2dV13XUObwI20KCmcgZPCWCV87WuONuyhoQ0enKDtgpe3NdbUvmvbruvW3zN4n7AsklSZHhfWGtN2qNuuqzYY9yBgVDGjXBkJWMOZhtLV66bTcb1m3AVxGFxA2wB2XdU0jf4nLtc7klrgTSrGue8Abrum6dZaN9/1u6PmLY8zhpmr2wZmN2uEbrTud8glVZNjPoWxNUVRlKjKegyb1F05QBS/oFUCLarqtZTPBvCT4JQ+4ZpaheHKteZBjdveQRxbiE1Xo1VeYLweRLLbD5DBnnLBLcAzW5oDIZ4mm/0XPQcvKAiMLrAqNhm7/En680FDU4DwsulIEf1vYWmekDH9+YBAihMaZWTwSNar+u3kJ+6u4YxWGYvxZdnIiWcT8KbAZgtjGbthY8aqNKLj6WlGhbAGHchxlnBrdk4RlI8qaxny9dzT2VHhS4IoaHC9WBZ/T2bgEWEKHhyaENScNfPDx9KGhCZJhyv7886Z6yPm7KbnMGb0ZndPcTcDGIsyRHG8e9wbwSBpuN5zgHxM90vCVJ/OFj/sOZE+wH1azCrqRF8rz/aAy8ecsU9GF/bHvYfh5cN3ZvFe8ul/e2BB+HljIYQAAAAASUVORK5CYII=';

class ItemContainer extends React.Component {
  render() {
    const { icon, id, children, className = '', ...otherProps } = this.props;
    return (
      <StyleLi id={id} className={`notification-item-container ${className}`} {...otherProps}>
        <div className="icon-wrapper">
          <Icon icon={icon} />
        </div>
        <div className="content-wrapper">
          {children}
        </div>
      </StyleLi>
    );
  }
}

const StyleLi = styled.li`
  width: 100%;
  min-height: 83px;
  padding:16px 20px 16px 16px;
  border-bottom: 1px solid rgba(230,232,236,1);
  display: flex;
  margin-top: 0px !important;
  .icon-wrapper{
    padding-right: 16px;

  }
  .content-wrapper{
    width: calc(100% - 48px);
    overflow:hidden;
  }
  &:hover {
    background-color: rgba(242,244,255,1);
  }
`;

class UlContainer extends React.Component {
  render() {
    const { children, className, emptyTip = '' } = this.props;
    return (
      <StyleUl className={className}>
        {children && children.length > 0 ?
          children :
          <EmptyDiv>
            <img src={empty} />
            <p>{emptyTip}</p>
          </EmptyDiv>
        }
      </StyleUl>
    );
  }
}

const EmptyDiv = styled.div`
  displty:flex;
  align-items: center;
  justify-content: center;
  top: 130px;
  left: 50%;
  transform: translateX(-50%);
  position: absolute;
  text-align: center;
  p{
    color: #CCCCCC;
  }
`;

const StyleUl = styled.ul`
  background-color: #fff;
`;

function Title({ children }) {
  return <TitleDiv className="item-title">{children}</TitleDiv>;
}

const TitleDiv = styled.h5`
  line-height: 1.2;
  font-size: 12px;
  font-weight: 500;
  margin: 0;
  margin-bottom: 6px;
  padding: 0;
`;

export default UlContainer;
UlContainer.Item = ItemContainer;
UlContainer.ItemTitle = Title;
