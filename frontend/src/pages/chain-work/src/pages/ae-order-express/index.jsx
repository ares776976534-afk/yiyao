/**
 * 创建揽收单
 */
import React, { useState, useEffect } from 'react';

console.log('test')

export default class AeOrderExpress extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
  }
  componentDidMount() {
    this.setState({
      visible: true,
    });
  }
  render() {
    return (
      <div>
        {this.state.visible && <div>123</div>}
      </div>
    );
  }
}

