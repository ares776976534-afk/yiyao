import React from 'react';
import { Message } from '@alifd/next';
import Icon from '../Icon';
import './index.scss';

// Message._show = (props) => {
//   const _props = {
//     ...props,
//     iconType: false,
//     title: (
//       <div>
//         <Icon type={props.type} /> {props.title}
//       </div>
//     ),
//   };

//   const instance = Message.show(_props);

//   return instance;
// };

const IconRender = (props) => {
  return <Icon type={props.type} style={{ marginRight: '6px' }} size={props.size || 16} />;
};

export const ChainMessage = (props) => {
  const iconInTitle = !!props.title;
  return (
    <Message
      {...props}
      iconType={false}
      type={props.type}
      title={
        iconInTitle ? (
          <>
            {IconRender(props)}
            {props.title}
          </>
        ) : null
      }
      style={{
        '--message-size-m-padding': '9px',
        '--message-size-m-content-font': '14px',
        color: '#666',
        // height: '40px',
        paddingLeft: '12px',
        ...props.style,
      }}
      className="message-wrap"
    >
      <div className="leading-[22px] height-[22px]">
        {!iconInTitle && IconRender(props)} {props.children}
      </div>
    </Message>
  );
};
ChainMessage._show = (props) => {
  const iconInTitle = !!props.title;
  const _props = {
    ...props,
    iconType: false,
    title: iconInTitle ? (
      <>
        {IconRender(props)}
        {props.title}
      </>
    ) : null,
    content: (
      <div className="leading-[22px] height-[22px]">
        {!iconInTitle && IconRender(props)} {props.content}
      </div>
    ),
    className: 'message-wrap',
  };

  const instance = Message.show(_props);

  return instance;
};

export default ChainMessage;
