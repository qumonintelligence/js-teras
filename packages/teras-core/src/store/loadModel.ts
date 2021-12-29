import omit from 'lodash/omit';
import pick from 'lodash/pick';
import map from 'lodash/map';
import type { Model } from './interface';

const commonReducers = (INITIAL_STATE: any = {}) => ({
  updateState(state: any, { payload }: any) {
    return {
      ...state,
      ...payload,
    };
  },
  removeState(state: any, { payload }: any) {
    const newState = omit(state, payload);
    return {
      ...newState,
    };
  },
  initializeState(state: any, { payload }: any) {
    const initialStates = pick(INITIAL_STATE, payload);
    return {
      ...state,
      ...initialStates,
    };
  },
  initializeAll(state: any, { payload }: any) {
    let newState = {};
    if (payload) {
      newState = omit(INITIAL_STATE, payload);
    } else {
      newState = INITIAL_STATE;
    }

    return {
      ...state,
      ...newState,
    };
  },
});

export default (
  model: Model = {
    namespace: '',
    state: {},
    effects: [],
    reducers: {},
  },
): Model => {
  const {
    namespace,
    state: modelState = {},
    effects = [],
    reducers = {},
  } = model;

  return {
    namespace,
    reducers: (state = modelState, action: any) => {
      if (!action.type || !action.type.includes(namespace)) {
        return state;
      }

      const fullReducers = { ...reducers, ...commonReducers(modelState) };

      const enhanceReducer: any = {};
      map(fullReducers, (r, l) => {
        enhanceReducer[`${namespace}/${l}`] = (e: any) => r(e, action);
      });

      return enhanceReducer[action.type]
        ? enhanceReducer[action.type](state, action.payload)
        : state;
    },
    effects: [
      ...map(effects, (effect, effectLbl) => ({
        effectLbl: `${namespace}/${effectLbl}`,
        effect,
      })),
    ],
    state: modelState,
  };
};
