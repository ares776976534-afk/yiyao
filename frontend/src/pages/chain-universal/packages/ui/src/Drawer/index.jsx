import React from 'react';
import { Drawer } from '@alifd/next';

import './index.scss';

// const drawer = Drawer.show({
//   title: '货品详情',
//   content: <ProductDetail onClose={() => drawer.hide()} />,
//   placement: 'right',
//   closeable: true,
//   footer: false,
//   width: 'auto',
// });

Drawer._show = (props) => {
  const _props = {
    ...props,
    title: (
      <div className="chain-ui-drawer-title">
        <div className="chain-ui-drawer-title-block" onClick={() => instance.hide()} />
        {props.title}
      </div>
    ),
    headerStyle: {
      position: 'relative',
      padding: '20px 0',
      fontSize: '18px',
      fontWeight: 500,
      margin: '0 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
  };

  const instance = Drawer.show(_props);

  return instance;
};

export default Drawer;
