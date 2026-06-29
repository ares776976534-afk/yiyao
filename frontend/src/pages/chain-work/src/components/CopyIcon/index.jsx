import React from 'react';
import Clipboard from '@/components/ClipBoard';
import { Icon } from '@alifd/next';

function CopyIcon({ text }) {
  return (
    <Clipboard text={text}>
      <Icon type="copy" />
    </Clipboard>
  );
}

export default CopyIcon;
