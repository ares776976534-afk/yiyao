/* eslint-disable react/prop-types */
import React from 'react';
import styled from 'styled-components';
import { Notification } from '@alifd/next';
import service from '../../service';
import { parseTaskLink } from './utils';
// // import variables from '@alife/theme-ascp/variables';
// import variables from '../../style/variables.js';

// import locale from '../../locale';
import { TARGET } from '../../constants';
import UiContainer from '../../widges/list';
// import Refresh from '@ali/h2-refresh';

export default class TodoContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
    };
    this.isInit = true;
  }

  componentDidMount() {
    // this.getList();
    // this.poll = setInterval(() => {
    //   this.getList();
    // }, 60 * 10 * 1000);
  }

  componentWillUnmount() {
    clearInterval(this.poll);
  }

  getList=() => {
    const { locale } = this.props;
    service.getTodoList({
      jobType: 'todo',
      queryDays: 30,
    }).then((res) => {
      if (res.success && res.result) {
        const currentList = res.result.filter(item => item.current);
        if (currentList && currentList.length > 0) {
          const { list = [] } = currentList[0];
          const total = list.reduce((p, c) => p + c.jobCount, 0);
          const { counts = {} } = this.props;
          const count = counts[TARGET.TODO] || 0;
          if (total > count && !this.isInit) {
            Notification.notice({
              title: `${total - count}${locale.todoMessage}`,
              onClick: () => {
                Notification.destroy();
                this.props.onChange({
                  activeKey: 'todo',
                  visible: true,
                });
              },
            });
          }
          this.isInit = false;
          this.props.onCountChange({ [TARGET.TODO]: total });
          this.setState({
            dataSource: list,
          });
        }
      }
    }).catch((err) => {
      console.log('11',err);
    });
  }

renderItem=(item) => {
  const { locale } = this.props;

  return (
    <UiContainer.Item icon="shenpi" id={`task-${item.jobId}`} key={item.jobId} className="task-todo-item" onClick={() => this.open(parseTaskLink(item))}>
      <div className="cell-wrapper">
        <UiContainer.ItemTitle>{item.flowName}</UiContainer.ItemTitle>
        <span className="task-todo">
          <label
            className="task-todo-count"
          >
            {item.jobCount}
          </label>
          <span>{`${locale.item}${item.jobName}${locale.itemsToHandle}`}</span>
        </span>
      </div>
    </UiContainer.Item>
  );
}

open=(url) => {
  const { pageManager } = this.props;
  pageManager.openSingleton(url);
}

render() {
  const { dataSource } = this.state;
  const { appendBizTypeInfo, locale } = this.props;
  return (
    <StyleDIV>
      <UiContainer emptyTip={locale.todoEmptyTip}>
        {
          dataSource.map(item => this.renderItem(item))
        }
      </UiContainer>
      <div className="bottom-wrapper" onClick={() => { this.open(appendBizTypeInfo('/pages/ascm/basic_task_center')); }}>
        {locale.lookall}
      </div>
    </StyleDIV>
  );
}
}

const StyleDIV = styled.div`
  padding-bottom: 44px;
  .cell-wrapper{
    cursor: pointer;
  }
  .task-todo {
    color: #999;
    display: block;
    line-height: 28px;
    font-weight: 400;
    color: #333333;
    .task-todo-count {
      font-size: 20px;
      font-weight: 900;
      padding-right: 5px;
    }
  }
.bottom-wrapper{
  position: absolute;
  bottom: 0;
  left:0;
  text-align: center;
  width: 100%;
  height: 45px;
  line-height: 45px;
  border-top: 1px solid rgba(230,232,236,1);
  color:rgba(47,136,245,1);
  background:#FFF;
  cursor: pointer;
}
`;
