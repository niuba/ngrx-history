# ngrx-history
[![codecov](https://codecov.io/gh/niuba/ngrx-history-lib/branch/master/graph/badge.svg)](https://codecov.io/gh/niuba/ngrx-history-lib)
[![CircleCI](https://circleci.com/gh/niuba/ngrx-history-lib.svg?style=svg)](https://circleci.com/gh/niuba/ngrx-history-lib)

English | [简体中文](README-zh_CN.md)

An redo/undo library on [@ngrx/store](https://github.com/ngrx/platform).
According to the [redux-undo](https://github.com/omnidan/redux-undo) modification，the function is basically the same as the redux-undo@1.0.0-beta7.
The test code is also from [redux-undo](https://github.com/omnidan/redux-undo) (since the Slices are not used, this part of the test code has been removed)。

## Installation
```
npm install --save ngrx-history
```

## Usage
```typescript
import { undoable } from 'ngrx-history';

export const counterReducer: ActionReducer<number, AppActions.UnionAction> = (
  state = 0,
  action
) => {
  switch (action.type) {
    case AppActions.ActionTypes.INCREMENT:
      return state + 1;
    case AppActions.ActionTypes.DECREMENT:
      return state - 1;
    default:
      return state;
  }
};

export const undoableCounterReducer = undoable(counterReducer, {
  limit: 3
});
```

## More Information
[redux-undo](https://github.com/omnidan/redux-undo)
