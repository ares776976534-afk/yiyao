import { Tooltip } from 'antd';
import { imgIcon } from '@/components/ChatFlow/imgIcon';

export const TooltipComponent = () => {
  return (
    <Tooltip title="相关电商平台数据来源于第三方，仅供用户在电商平台经营时参考" placement="top">
      <img style={{ width: '18px', height: '18px', cursor: 'pointer' }} src={imgIcon[28]} alt="" />
    </Tooltip>
  );
};