import React, { useState } from 'react';
import { Button, Icon } from '@alifd/next';
import './expandIcon.scss';

function ExpandIcon({ retractText, expandText, onClick }) {
  const [showAll, setShowAll] = useState(false);
  const buttonText = showAll ? retractText || expandText : expandText || retractText;
  const iconType = showAll ? 'arrow-up' : 'arrow-down';
  return (
    <div className="expandIcon">
      <Button
        onClick={() => {
          setShowAll(!showAll);
          onClick();
        }}
        text
        type="primary"
        className="iconStyle"
      >
        {buttonText}
        <Icon type={iconType} />
      </Button>
    </div>
  );
}

export default ExpandIcon;
