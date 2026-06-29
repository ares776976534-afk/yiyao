import { createContext } from 'react';

export const ModalContext = createContext({
  showModal: () => {},
  hideModal: () => {},
  pauseQueue: () => {},
  resumeQueue: () => {},
  clearQueue: () => {},
  isPaused: false
});
