export interface Model {
  namespace: string;
  state?: any;
  effects?: any;
  reducers?: any;
}

export interface Init {
  models: Model[];
  plugins: any[];
}

export interface Effects {
  effectMain: any[];
  effectsList: any[];
  reducerMain: any;
  initialState: any;
}
