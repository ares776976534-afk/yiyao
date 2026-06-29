import styles from "./index.module.scss";
import { useState, useRef, forwardRef, useImperativeHandle } from "react";
import { createPortal } from "react-dom";

export default forwardRef(function LoadingMask(
  props: any,
  ref
) {
  const { open } = props;
  const [editRect, setEditRect] = useState<any>(null);

  useImperativeHandle(
    ref,
    () => ({
      setPosition: (rect) => {
        setEditRect(rect);
      },
    }),
    []
  );

  return open && createPortal(
    <div
      data-root="studio"
      style={{
        position: "fixed",
        zIndex: 2,
        width: (editRect?.rt?.x || 0) - (editRect?.lt?.x || 0),
        height: (editRect?.lb?.y || 0) - (editRect?.lt?.y || 0),
        left: editRect?.lt?.x,
        top: editRect?.lt?.y,
        background: 'var(--material-processing) no-repeat 0 / 100% 100%',
      }}
    />,
    document.body
  );
});
