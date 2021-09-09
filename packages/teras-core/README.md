# Teras

[![Build Status](https://travis-ci.org/[repositoryOwner]/[repositoryName].svg?branch=master)](https://travis-ci.org/[repositoryOwner]/[repositoryName])
[![License](https://badgen.net/github/license/sebdott/teras)](./LICENSE)
[![Library minified size](https://badgen.net/bundlephobia/min/teras)](https://bundlephobia.com/result?p=teras)
[![Library minified + gzipped size](https://badgen.net/bundlephobia/minzip/teras)](https://bundlephobia.com/result?p=teras)

Teras is a wrapper-library based on [redux](https://github.com/reactjs/redux), [redux-saga](https://github.com/redux-saga/redux-saga) and [react-router](https://github.com/ReactTraining/react-router). (Inspired by [dva-js](https://github.com/dvajs/dva))

## Installation

This library is published in the NPM registry and can be installed using any compatible package manager.

```sh
npm install teras --save
```
or

```sh
yarn add teras
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
