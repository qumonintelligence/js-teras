import React from 'react';
import core, { Store, connectSocket } from 'teras-core';
import * as ReduxPersist from "redux-persist";
import { PersistGate } from 'redux-persist/integration/react'
import storage from 'redux-persist/lib/storage'

export { core, connectSocket };

export default function App({ children, models, persist }: {
  children: any, models: any[], persist: {
    key?: string,
    storage?: any,
    whitelist?: string[],
    blacklist?: string[],
  }
}) {

  let storeConfig: any = { models };

  // contains redux persist config

  if (persist) {
    storeConfig.reduxPersist = {
      config: {
        key: 'root',
        storage,
        ...persist,
      },
      main: ReduxPersist,
    }

    Store.init(storeConfig);

    children = <PersistGate loading={null} persistor={Store.persistor} >
      {children}
    </PersistGate>
  } else {
    Store.init(storeConfig);
  }

  return <core.Provider store={Store.data}>
    {children}
  </core.Provider>

}


