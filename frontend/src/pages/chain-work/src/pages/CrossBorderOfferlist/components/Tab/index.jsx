import React, { useEffect, useState } from 'react';
import { Tab } from '@alifd/next';
import JoinedOfferTable from './joinedOfferTable';
import './index.scss';

const CrossBorderOfferTab = (props) => {
  const {
    balloonVisible,
    isFirstVisit,
    onRefreshBusinessBacklog,
    joinDialogVisible,
    onJoinDialogClose,
  } = props;
  const [currentChecked, setCurrentChecked] = useState([]);
  const [pageNo, setPageNo] = useState(1);
  const [filterParams, setFilterParams] = useState({});
  const [activeKey, setActiveKey] = useState('0');
  const [errParams, setErrParams] = useState({
    visible: false,
    text: '',
  });
  const handleTanChange = (value) => {
    setActiveKey(value.selectValue);
    setCurrentChecked([]);
    setPageNo(1);
    setFilterParams({ ...value });
    setErrParams({
      visible: false,
    });
  };

  return (
    <div className="offer-list-content">
      <Tab shape="wrapped" size="medium" activeKey={activeKey} onChange={(key) => handleTanChange({ selectValue: key })}>
        {/* <Tab.Item title={'货通全球商品'} key="joined" className="pft-tabStyle">
          <JoinedOfferTable balloonVisible={props.balloonVisible} />
        </Tab.Item> */}
        <Tab.Item title="已加入全球严选" key="0" className="pft-tabStyle">
          <JoinedOfferTable
            balloonVisible={balloonVisible}
            isFirstVisit={isFirstVisit}
            currentChecked={currentChecked}
            pageNo={pageNo}
            filterParams={filterParams}
            setCurrentChecked={setCurrentChecked}
            setPageNo={setPageNo}
            setFilterParams={setFilterParams}
            errParams={errParams}
            setErrParams={setErrParams}
            handleTanChange={handleTanChange}
            onRefreshBusinessBacklog={onRefreshBusinessBacklog}
            joinDialogVisible={joinDialogVisible}
            onJoinDialogClose={onJoinDialogClose}
          />
        </Tab.Item>
        <Tab.Item title="未加入全球严选" key="901094" className="pft-tabStyle">
          <JoinedOfferTable
            balloonVisible={balloonVisible}
            isFirstVisit={isFirstVisit}
            currentChecked={currentChecked}
            pageNo={pageNo}
            filterParams={filterParams}
            setCurrentChecked={setCurrentChecked}
            setPageNo={setPageNo}
            setFilterParams={setFilterParams}
            errParams={errParams}
            setErrParams={setErrParams}
            handleTanChange={handleTanChange}
            onRefreshBusinessBacklog={onRefreshBusinessBacklog}
            joinDialogVisible={joinDialogVisible}
            onJoinDialogClose={onJoinDialogClose}
          />
        </Tab.Item>
      </Tab>
    </div>
  );
};

export default CrossBorderOfferTab;
