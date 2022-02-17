/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-inner-declarations */
/* eslint-disable no-param-reassign */
import { eventChannel, END } from 'redux-saga';
import {
  put,
  take,
  fork,
  call,
  cancel,
  cancelled,
  select,
} from 'redux-saga/effects';
import qs from 'qs';

// Use this to actually throw exceptions, allows for easier debugging.
// const dispatch = put.resolve;

function createWebSocketConnection(url: string) {
  return new Promise((resolve, reject) => {
    const socket: any = new WebSocket(url);

    socket.onopen = function () {
      console.log({ socketonopen: socket });
      resolve(socket);
    };

    socket.onerror = function (evt: any) {
      console.log({ socketononerror: socket });
      reject(evt);
    };
  });
}

function createSocketChannel(socket: {
  onmessage: ((event: any) => void) | null;
  onclose: () => void;
}) {
  return eventChannel((emit): any => {
    socket.onmessage = (event: { data: unknown }) => {
      // emit data
      emit(event.data);
    };

    socket.onclose = () => {
      emit(END);
    };

    const unsubscribe = () => {
      socket.onmessage = null;
    };

    return unsubscribe;
  });
}

function* listenForSocketMessages({
  url,
  namespace,
  onReceived,
  onError,
  options = {
    parseMessage: true,
  },
}: {
  url: string;
  namespace: string;
  onReceived: any;
  onError: any;
  options?: any;
}): any {
  let socket: any, socketChannel: any;

  try {
    socket = yield call(createWebSocketConnection, url);

    socketChannel = yield call(createSocketChannel, socket);

    // tell the application that we have a connection
    console.log('connection success');
    yield put({
      type: `${namespace}/updateState`,
      payload: {
        socket,
        connected: true,
      },
    });

    yield put({ type: `${namespace}/connected` });

    while (true) {
      // wait for a message from the channel
      const payload: any = yield take(socketChannel);

      if (!payload) return;

      let receivedSocketPayload;

      if (options && options.parseMessage) {
        receivedSocketPayload = JSON.parse(payload);
      } else {
        receivedSocketPayload = payload;
      }

      if (onReceived) {
        yield onReceived(receivedSocketPayload, { put, select });
      }
    }
  } catch (error) {
    if (onError) {
      yield onError();
    }

    console.log({
      errorMessage: 'Error while connecting to the WebSocket',
      error,
    });

    yield put({
      type: `${namespace}/disconnect`,
      payload: {
        isErrorDC: false,
      },
    });
  } finally {
    yield put({
      type: `${namespace}/updateState`,
      payload: {
        socket: {},
        connected: false,
      },
    });

    if (yield cancelled()) {
      console.log('WebSocket close');

      if (socketChannel) {
        // close the channel
        socketChannel.close();
      }

      if (socket) {
        // close the WebSocket connection
        socket.close();
      }
    } else {
      console.log('WebSocket disconnected');
      yield put({
        type: `${namespace}/disconnect`,
        payload: {
          isErrorDC: true,
        },
      });
    }
  }
}

function* connectedSuccessFork({
  namespace,
  onConnected,
}: {
  namespace: string;
  onConnected: any;
}) {
  while (true) {
    yield take(`${namespace}/connected`);

    const { [namespace]: socket } = yield select((state) => state);
    if (socket.connected) {
      if (onConnected) {
        yield onConnected({ socket }, { put, select });
      }

      console.log(`${namespace} connecton success`);
    }
  }
}

function* connectFork({ namespace }: { namespace: string }) {
  while (true) {
    yield take(`${namespace}/connect`);

    const { [namespace]: socket } = yield select((state) => state);
    if (socket.connected) {
      console.log(`${namespace} already connected`);
    }
  }
}

function* notConnectFork({ namespace }: { namespace: string }) {
  while (true) {
    yield take(`${namespace}/disconnect`);

    const { [namespace]: socket } = yield select((state) => state);

    if (!socket.connected) {
      console.log(`${namespace} not connected yet`);
    }
  }
}

function* handleQueryForConnect(namespace: any, query: any) {
  let qsStr = '';

  if (query) {
    yield put({
      type: `${namespace}/updateState`,
      payload: {
        query,
      },
    });

    qsStr = `?${qs.stringify(query)}`;
  } else {
    const { [namespace]: socket } = yield select((state) => state);

    if (socket.query) {
      qsStr = `?${qs.stringify(socket.query)}`;
    }
  }

  return qsStr;
}

export default function* connect({
  url,
  namespace,
  onReceived,
  onConnected,
  onError,
  onDisconnected,
}: {
  url: string;
  namespace: any;
  onReceived: any;
  onConnected: any;
  onError: any;
  onDisconnected: any;
}): any {
  yield fork(notConnectFork, { namespace });
  yield fork(connectFork, { namespace });
  yield fork(connectedSuccessFork, { namespace, onConnected });

  console.log({ connect: `${namespace}/connect` });

  while (true) {
    const { query }: any = yield take(`${namespace}/connect`);

    const qsStr: string = yield handleQueryForConnect(namespace, query);

    const socketTask: any = yield fork(listenForSocketMessages, {
      url: `${url}${qsStr}`,
      namespace,
      onReceived,
      onError: () => onError(query, { put, select }),
    });

    yield take(`${namespace}/disconnect`);

    if (onDisconnected) {
      yield onDisconnected(query, { put, select });
    }

    console.log({ connectDisconnect: socketTask });

    yield cancel(socketTask);
  }
}
