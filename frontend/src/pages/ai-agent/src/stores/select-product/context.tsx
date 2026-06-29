import React, { createContext, useContext, ReactNode } from 'react';
import { SelectProductStore, createSelectProductStore } from './store';

// 创建Context
const SelectProductContext = createContext<SelectProductStore | null>(null);

// Provider组件
interface TypeSelectProductProviderProps {
  children: ReactNode;
  store?: SelectProductStore;
}

export const SelectProductProvider: React.FC<TypeSelectProductProviderProps> = ({
  children,
  store = createSelectProductStore(),
}) => {
  return (
    <SelectProductContext.Provider value={store}>
      {children}
    </SelectProductContext.Provider>
  );
};

// Hook to use SelectProduct store
export const useSelectProductStore = (): SelectProductStore => {
  const store = useContext(SelectProductContext);
  if (!store) {
    throw new Error('useSelectProductStore must be used within SelectProductProvider');
  }
  return store;
};
