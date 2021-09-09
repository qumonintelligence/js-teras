export default function createPromiseMiddleware(lblList: string | any[]) {
  return () =>
    (next: (arg0: any) => void) =>
    (action: { type: string }): any => {
      const { type } = action;
      if (lblList.includes(type)) {
        return new Promise((resolve, reject) => {
          next({
            _resolve: resolve,
            _reject: reject,
            ...action,
          });
        });
      }
      return next(action);
    };
}
