/* eslint-disable react/prop-types */
import React from 'react';
import Icon from '../../../widges/icon';
import { Animate } from '@alifd/next';
import styled from 'styled-components';
// import variables from '@alife/theme-ascp/variables';
// import variables from '../../../style/variables.js';

import Constants from '../constants';

const DIV = styled.div`
    display:flex;
    width: 100%;
    text-align: left;
    font-size: 12px;
    padding-bottom: 3px;
    position: relative;
    .pick-icon{
        position: absolute;
        top: 0;
        right: 0;
    }
    .icon{
      width: 14px;
      height: 14px;
      top: 3px;
      position: relative;
      border-radius: 50%;
      padding: 2px;
      &.packup,&.packdown{
        border:none;
        width: 16px;
        height: 16px;
      }
      &.success{
        color:rgba(15,161,118,1);
        border: 1px solid rgba(15,161,118,1);
      }
      &.error{
          color:#d13921;
          border: 1px solid #d13921;

      }
    }
    .reason{
      line-height: 1.7;
      position:relative;
      word-break: break-word;
      padding-left: 20px;
      .icon{
        position: absolute;
        top: 0;
        left: 0;
      }
      .success{
        text-indent: 2em;
      }
      .error{
        color: #f3552e;

      }
    }
    .reason-single-wrapper{
        width: 100%;
        padding-right: 50px;
        overflow: hidden;
        text-overflow:ellipsis;
        white-space: nowrap;
    }
    .reason-multable-wrapper{
        width: 100%;
        padding-right: 50px;
    }
    .expand-enter {
        overflow: hidden;
    }
    
    .expand-enter-active {
        transition: height 0.3s ease-out;
    }
    
    .expand-leave {
        overflow: hidden;
    }
    
    .expand-leave-active {
        transition: height 0.3s ease-out;
    }
    
    
`;

export default class Reason extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      showIcon: false,
    };
  }

  componentDidMount() {
    if (this.reason.offsetWidth > this.reasonContainer.offsetWidth) {
      this.setState({
        showIcon: true,
      });
    }
  }

    toggleVisible=() => {
      this.setState({
        visible: !this.state.visible,
      });
    }

     beforeEnter=(node) => {
       this.height = node.offsetHeight;
       node.style.height = '0px';
     }

    onEnter=(node) => {
      node.style.height = `${this.height}px`;
    }

     afterEnter=(node) => {
       this.height = null;
       node.style.height = null;
     }

     beforeLeave=(node) => {
       node.style.height = `${this.height}px`;
     }

    onLeave=(node) => {
      node.style.height = '0px';
    }

    afterLeave=(node) => {
      node.style.height = null;
    }

    getMessage=() => {
      const { locale } = this.props;
      const { text, successCount, failCount } = this.props;
      if (text) {
        return <span className="error">{text}</span>;
      }
      return (
        <>
          {successCount ? <span className="success">{`${locale.success}${successCount}${locale.item}`}</span> : null}
          {failCount && successCount ? <span>，</span> : null}
          {failCount ? <span className="error">{`${locale.fail}${failCount}${locale.item}`}</span> : null}
        </>
      );
    }


    render() {
      const { visible, showIcon } = this.state;
      const { status } = this.props;
      return (
        <DIV>
          <Animate
            animation="expand"
            beforeEnter={this.beforeEnter}
            onEnter={this.onEnter}
            afterEnter={this.afterEnter}
            beforeLeave={this.beforeLeave}
            onLeave={this.onLeave}
            afterLeave={this.afterLeave}
          >


            <div ref={(ref) => { this.reasonContainer = ref; }} className={`${visible ? 'reason-multable-wrapper' : 'reason-single-wrapper'}`}>
              <span className="reason" ref={(ref) => { this.reason = ref; }}><Icon icon={Constants.ENUM.FileStatus[status].icon} />{this.getMessage()}</span>
            </div>

          </Animate>
          <div className="pick-icon">
            {showIcon ? <Icon
              icon={visible ? 'packup' : 'packdown'}
              onClick={this.toggleVisible}
            /> : null}
          </div>
        </DIV>
      );
    }
}
