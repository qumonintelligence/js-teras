# Teras
[![npm version](https://img.shields.io/npm/v/teras.svg?style=flat-square)](https://www.npmjs.com/package/teras)
[![npm downloads](https://img.shields.io/npm/dm/teras.svg?style=flat-square)](https://www.npmjs.com/package/teras)
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
import Teras from 'teras';
import terasModel from "./models/terasModel";

ReactDOM.render(
   <Teras models={[terasModel]}>
     <App />
   </Teras>
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
import {core} from 'teras';

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

export default core.connect(mapStateToProps)(App);

```


#### Socket Connection

```javascript

function* onReceived(message, {put, select}) {
  if (!message) return;
  console.log('onReceived');
}

function* onConnected({socket}, {put, select}) {
  console.log('onConnected');
}

function* onDisconnected(query, {put, select}) {
  console.log('onDisconnected');
}

function* onError() {
  console.log('onEror');
}

export default {
  namespace: 'chatSocket',
  onReceived,
  onConnected,
  onDisconnected,
  onError,
  url: `wss://localhost,
};

```

## License
Copyright (C) 2021 Qumon Intelligence

Released under [MIT License](./LICENSE).
