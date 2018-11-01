# ngrx-history
[![codecov](https://codecov.io/gh/niuba/ngrx-history-lib/branch/master/graph/badge.svg)](https://codecov.io/gh/niuba/ngrx-history-lib)
[![CircleCI](https://circleci.com/gh/niuba/ngrx-history-lib.svg?style=svg)](https://circleci.com/gh/niuba/ngrx-history-lib)

简体中文 | [English](README.md)

在 [@ngrx/store](https://github.com/ngrx/platform) 上的 redo/undo 库。
根据 [redux-undo](https://github.com/omnidan/redux-undo) 修改，功能和版本 redux-undo@1.0.0-beta7 基本一致。
测试代码也来自 [redux-undo](https://github.com/omnidan/redux-undo) (由于没有使用 Slices ，所以这部分的测试代码删去了)。

## 安装
```
npm install --save ngrx-history
```

## 使用
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

## 更多信息
请浏览 [redux-undo](https://github.com/omnidan/redux-undo)
