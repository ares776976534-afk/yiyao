import React, { createContext, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import { createStore, Store } from "./store";
import type { TypeStoreServices } from "./types";

const StoreContext = createContext<Store | null>(null);

let globalStoreInstance: Store | null = null;

const getOrCreateGlobalStore = (services: TypeStoreServices): Store => {
  if (!globalStoreInstance) {
    globalStoreInstance = createStore(services);
  }
  return globalStoreInstance;
};

export function StoreProvider(props: {
  children: ReactNode;
  services: TypeStoreServices;
}) {
  const store = useMemo(
    () => getOrCreateGlobalStore(props.services),
    [props.services]
  );

  return (
    <StoreContext.Provider value={store}>
      {props.children}
    </StoreContext.Provider>
  );
}

export function useStore(): Store {
  const contextStore = useContext(StoreContext);

  if (contextStore) {
    return contextStore;
  }

  if (globalStoreInstance) {
    return globalStoreInstance;
  }

  throw new Error(
    "useStore: Store not initialized. Ensure StoreProvider is mounted before using this hook."
  );
}
