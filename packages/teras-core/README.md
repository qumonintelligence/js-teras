# teras-core

[![npm version](https://img.shields.io/npm/v/teras-core.svg?style=flat-square)](https://www.npmjs.com/package/teras-core)
[![npm downloads](https://img.shields.io/npm/dm/teras-core.svg?style=flat-square)](https://www.npmjs.com/package/teras-core)
[![Library minified size](https://badgen.net/bundlephobia/min/teras-core)](https://bundlephobia.com/result?p=teras-core)
[![Library minified + gzipped size](https://badgen.net/bundlephobia/minzip/teras-core)](https://bundlephobia.com/result?p=teras-core)

Teras is a wrapper-library based on [redux](https://github.com/reactjs/redux), [redux-saga](https://github.com/redux-saga/redux-saga) and [react-router](https://github.com/ReactTraining/react-router). (Inspired by [dva-js](https://github.com/dvajs/dva))

## Installation

This library is published in the NPM registry and can be installed using any compatible package manager.

```sh
npm install teras-core --save
```
or

```sh
yarn add teras-core
```

## Usage 

#### Init
```javascript
import Teras, {Store} from 'teras-core';
import terasModel from "./models/terasModel";

Store.init({models: [terasModel]});

const {Provider} = Teras;

ReactDOM.render(
   <Provider store={Store.data}>
      <App />
   </Provider>,
  document.getElementById('root')
);

```

#### Models

```javascript
const INITIAL_STATE = {
  initlabel： 'Hello World'
};

export default {
  namespace: 'terasModel',

  state: INITIAL_STATE,

  reducers: {},

  effects: {
  },
};

```

#### App
```javascript
import Teras from 'teras-core';
const {connect} = Teras;

const mapStatesToProps = ({terasModel}) => ({
  terasModel,
});

function App({dispatch, terasModel}) {
  const {initlabel} = terasModel;

   return (
       <div>
        {initlabel}
      </div>
    );
}

export default connect(mapStateToProps)(App);

```

## License
Copyright (C) 2021 Qumon Intelligence

Released under [MIT License](./LICENSE).
