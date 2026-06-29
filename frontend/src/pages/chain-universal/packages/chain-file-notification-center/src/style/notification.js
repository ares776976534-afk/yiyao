import styled from 'styled-components';
// import variables from '@alife/theme-ascp/variables';

const globalWidth = 500;

export default styled.div`
.notification-center-mask{
  display: none;
  &.show {
    display:block;
    position: fixed;
    height:100vh;
    width:100vw;
    z-index:1;
    top:0;
    left:0;
    opacity:0;
  }
}
&:before{

}
@keyframes pulse {
  0% {
    -webkit-transform: scale(1);
    transform: scale(1);
  }
  50% {
    -webkit-transform: scale(1.1);
    transform: scale(1.1);
  }
  100% {
    -webkit-transform: scale(1);
    transform: scale(1);
  }
}
.animate__pulse {
  -webkit-animation-name: pulse;
  animation-name: pulse;
  animation-duration: 1s !important;
  -webkit-animation-duration: 1s !important;
}

.notification-expand {
  transform: scaleY(1) !important;
}


@keyframes fadeInLeftBig {
  from {
    opacity: 0;
    -webkit-transform: translate3d(0, 0, 0);
    transform: translate3d(0, 0, 0);
  }

  to {
    opacity: 1;
    -webkit-transform: translate3d(-${globalWidth + 50}px, 0, 0);
    transform: translate3d(-${globalWidth + 50}px, 0, 0);
  }
}
.animate__fadeInLeftBig {
  -webkit-animation-name: fadeInLeftBig;
  animation-name: fadeInLeftBig;
}

@keyframes fadeInRightBig {
  from {
    opacity: 1;
    -webkit-transform: translate3d(-${globalWidth + 50}px, 0px, 0);
    transform: translate3d(-${globalWidth + 50}px, 0, 0);
  }

  to {
    opacity: 0;
    -webkit-transform: translate3d(0, 0, 0);
    transform: translate3d(0, 0, 0);
  }
}

.animate__fadeInRightBig {
  -webkit-animation-name: fadeInRightBig;
  animation-name: fadeInRightBig;
}


.animate__animated {
  -webkit-animation-duration: 300ms;
  animation-duration: 300ms;
  -webkit-animation-duration: 300ms;
  animation-duration: 300ms;
  -webkit-animation-fill-mode: both;
  animation-fill-mode: both;
}


.notification-drawer-container{
  left:auto !important;
  transform: scaleY(0);
  transform-origin: top;
  -webkit-transform-origin: top;
  transition: transform ease-in-out .2s;
  width: ${globalWidth}px;
  position: absolute;
  z-index: 10;
  border:1px solid #e3e3e3;
  background:#FFF;
  ${'' /* box-shadow:${variables['$popup-global-shadow']}; */}
  &.top-container{
    right: 0;
    top: 40px;
    &:before{
      content: " ";
      top: -7px;
      right: 34px;
      border-right: none;
      border-bottom: none;
      -webkit-box-shadow: -1px -1px 1px 0 rgba(0,0,0,.1);
      box-shadow: -1px -1px 1px 0 rgba(0,0,0,.1);
      position: absolute;
      width: 12px;
      height: 12px;
      content: "";
      -webkit-transform: rotate(45deg);
      -ms-transform: rotate(45deg);
      transform: rotate(45deg);
      -webkit-box-sizing: content-box!important;
      box-sizing: content-box!important;
      border: 1px solid #dcdee3;
      background-color: #fff;
      z-index: -1;
    }
  }
  &.right-container{
    right:-${globalWidth + 50}px;
    top:0;
    height: 100%;
    overflow: auto;
  }
  .ascp-drawer-header{
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 10;
    ${'' /* color: ${variables['$color-line1-3']}; */}
    cursor: pointer;
    &.right{
      top:0;
    }
    .ascp-drawer-close-icon{
      &::before{
        ${'' /* font-size: 14px !important; */}
        height: 14px;
      }
    }
  }
  .next-tabs{
    background: #fff;
  }
.next-tabs-bar{
  ${'' /* border-bottom:1px solid rgba(230,232,236,1) */}
}
  .next-tabs-tabpane{
      height: 435px;
      overflow-y: auto;
  }
}
`;
