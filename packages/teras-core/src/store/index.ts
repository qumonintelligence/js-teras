/* eslint-disable no-empty-pattern */
import { createStore, applyMiddleware, compose, combineReducers } from 'redux';

import createSagaMiddleware from 'redux-saga';
import * as sagaEffects from 'redux-saga/effects';
import map from 'lodash/map';
import { composeWithDevTools } from 'redux-devtools-extension/developmentOnly.js';
import loadModel from './loadModel';
import { loadingGen } from './loading';
import createPromiseMiddleware from './createPromiseMiddleware';
import type { Model, Effects } from './interface';

const { all } = sagaEffects;
declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: any;
  }
}

class Store {
  data: any;
  persistor: any;

  init = ({
    models,
    reduxPersist,
    nextOptions,
    middlewares = [],
  }: {
    models: Model[];
    reduxPersist?: any;
    nextOptions?: any;
    middlewares: any[];
  }): any => {
    const genEffects: any = (
      effectLbl: string,
      effect: (arg0: any, arg1: any) => any,
      operation: { type: string; ms: any } | undefined,
    ) =>
      function* () {
        function* generationEffect(e: {
          type?: any;
          _resolve?: any;
          _reject?: any;
        }) {
          const { _resolve, _reject } = e;
          try {
            yield sagaEffects.put({
              type: `loading/@@${e.type}/START`,
              payload: e.type,
            });

            const ret: any = yield* effect(e, sagaEffects);

            yield sagaEffects.put({
              type: `loading/@@${e.type}/END`,
              payload: e.type,
            });
            _resolve(ret);
          } catch (ee) {
            _reject(ee);
          }
        }

        let type = 'takeEvery';

        if (operation) {
          type = operation.type;
        }

        if (type === 'throttle') {
          if (operation && operation.ms) {
            yield sagaEffects.throttle(
              operation.ms,
              effectLbl,
              generationEffect,
            );
          } else {
            yield sagaEffects.takeEvery(effectLbl, generationEffect);
          }
        } else if (type === 'takeLatest') {
          yield sagaEffects.takeLatest(effectLbl, generationEffect);
        } else {
          yield sagaEffects.takeEvery(effectLbl, generationEffect);
        }
      };

    const getEffects = (): Effects => {
      let effectMain: any[] = [];
      const lblList: string[] = [];
      const reducerMain: any = {};
      const initialState: any = {};

      const loadingModel = loadingGen(models);

      const modules = {
        ...models,
        loadingModel,
      };

      map(modules, (model: Model) => {
        const { state, namespace, reducers = {}, effects } = loadModel(model);

        reducerMain[namespace] = reducers;
        initialState[namespace] = state;

        if (effects) {
          effectMain = [
            ...effectMain,
            ...map(effects, (eff: { effectLbl: string; effect: any }) => {
              const { effectLbl, effect } = eff;

              lblList.push(effectLbl);

              if (effect && Array.isArray(effect) && effect.length >= 2) {
                return genEffects(effectLbl, effect[0], effect[1])();
              }

              return genEffects(effectLbl, effect)();
            }),
          ];
        }
      });

      return { effectMain, effectsList: lblList, reducerMain, initialState };
    };

    const genRootSaga = (effs: any[]) =>
      function* rootSaga() {
        yield all(effs);
      };

    const { initialState, effectMain, effectsList, reducerMain } = getEffects();

    const promiseMiddleware = createPromiseMiddleware(effectsList);

    const sagaMiddleware = createSagaMiddleware();

    const setupMiddlewares = (m: any[]) => m;

    const composeEnhancers = composeWithDevTools({
      // Specify here name, actionsBlacklist, actionsCreators and other options
    });

    // const composeEnhancers: any =
    //   process.env['NODE_ENV'] !== 'production' &&
    //     window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    //     ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
    //       trace: true,
    //       maxAge: 30,
    //     })
    //     : compose;

    const _middlewares = setupMiddlewares([promiseMiddleware, sagaMiddleware]);

    const mergeMiddlewares = [..._middlewares, ...middlewares];

    const enhancer = composeEnhancers(applyMiddleware(...mergeMiddlewares));

    const rootReducer = combineReducers(reducerMain);
    let rReducer: any;

    if (nextOptions && nextOptions.HYDRATE) {
      // nextJS settings cater for server side redux store sync
      rReducer = (state: any, action: any) => {
        if (action.type === nextOptions.HYDRATE) {
          const nextState = {
            ...state,
            ...action.payload, // apply delta from hydration
          };
          return nextState;
        } else {
          return rootReducer(state, action as never);
        }
      };
    } else {
      rReducer = rootReducer;
    }

    if (reduxPersist) {
      // redux persist settings
      const { main, config } = reduxPersist;
      const { persistStore, persistReducer } = main;

      rReducer = persistReducer(config, rReducer);
      this.data = createStore(rReducer, enhancer);
      this.persistor = persistStore(this.data);
    } else {
      this.data = createStore(rReducer, enhancer);
    }

    sagaMiddleware.run(genRootSaga(effectMain));
  };
}

export default new Store();
