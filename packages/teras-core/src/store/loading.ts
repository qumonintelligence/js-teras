import map from 'lodash/map';
import type { Model } from './interface';

const INITIAL_STATE = {};

const loadingGen = (models: Model[]): Model => {
  let reducers: any = {};

  map(models, ({ namespace }) => {
    const r = {
      [`@@${namespace}/START`](state: any, { payload }: any): any {
        return {
          ...state,
          [payload]: true,
        };
      },
      [`@@${namespace}/END`](state: any, { payload }: any): any {
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

  return {
    namespace: 'loading',
    state: INITIAL_STATE,
    effects: {},
    reducers,
  };
};

export { loadingGen };
