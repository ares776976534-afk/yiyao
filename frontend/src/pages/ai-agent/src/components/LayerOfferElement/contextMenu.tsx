import { Menu } from "antd";
import { useState, useRef, forwardRef, useImperativeHandle } from "react";
import { createPortal } from "react-dom";

interface TypeContextMenuProps {
  onClick: (e: any) => void;
  items: any[];
}

export default forwardRef(function ContextMenu (props: TypeContextMenuProps, ref)  {
  const {
    onClick,
    items,
  } = props;

  const [editRect, setEditRect] = useState<any>(null);
  // const [show, setShow] = useState(true);
  // const timeRef = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    setPosition: (rect) => {
      setEditRect(rect);
    },
  }), [setEditRect]);

  return (
    <div
      className="studio-element-menu"
    >
      <Menu
        selectable={false}
        onClick={onClick}
        items={items}
      />
    </div>
  );
});
