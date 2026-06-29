import { useContext } from 'react';
import { ModalContext } from './ModalContext';

export default () => {
  return useContext(ModalContext);
};
