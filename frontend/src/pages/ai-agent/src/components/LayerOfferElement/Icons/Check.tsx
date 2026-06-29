import { Group, Circle, Image, Rect } from "react-konva";
import { useImage } from "react-konva-utils";

type CloseIconProps = {
  size?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  onClick?: (e: any) => void;
  onPointerDown?: (e: any) => void;
};

export const UncheckedIcon: React.FC<CloseIconProps> = ({ size = 16, fill = "#FFF", stroke = "rgba(0, 0, 0, 0.15)", strokeWidth = 1, onClick, onPointerDown }) => {
  // 圆形的xy是圆心点，不是左上角，需要计算偏移值
  const circleOffset = size / 2;

  return (
    <Circle
      x={circleOffset}
      y={circleOffset}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      width={size - strokeWidth * 2}
      height={size - strokeWidth * 2}
      onClick={onClick}
      onPointerDown={onPointerDown}
    />
  );
};

export const CheckedIcon: React.FC<CloseIconProps> = ({ size = 16, fill = "#08CAE0", onClick, onPointerDown }) => {
  const image = useImage("https://img.alicdn.com/imgextra/i2/O1CN01rQ7syH1YO2JYGKNYg_!!6000000003048-55-tps-18-18.svg", "anonymous");
  const imageSize = 10 / 16 * size;
  // 圆形的xy是圆心点，不是左上角，需要计算偏移值
  const circleOffset = size / 2;
  const imageCenterOffset = (size - imageSize) / 2;

  return (
    <Group>
      {/* 选择框的背景圆圈 */}
      <Circle
        x={circleOffset}
        y={circleOffset}
        width={size}
        height={size}
        fill={fill}
      />
      <Image
        image={image[0]}
        x={imageCenterOffset}
        y={imageCenterOffset}
        width={imageSize}
        height={imageSize}
        onClick={onClick}
        onPointerDown={onPointerDown}
      />
    </Group>
  );
};
