import map from 'lodash/map';
import type { Model } from './interface';

const INITIAL_STATE = {};

const loadingGen = (models: Model[]): Model => {
  let reducers: any = {};

  map(models, ({ effects }) => {
    map(effects, (_, effectsLbl) => {
      const r = {
        [`@@${effectsLbl}/START`](state: any, { payload }: any): any {
          return {
            ...state,
            [payload]: true,
          };
        },
        [`@@${effectsLbl}/END`](state: any, { payload }: any): any {
          return {
            ...state,
            [payload]: false,
          };
        },
      };

      reducers = {
        ...r,
      };
    });
  });

  return {
    namespace: 'loading',
    state: INITIAL_STATE,
    effects: {},
    reducers,
  };
};

export { loadingGen };
