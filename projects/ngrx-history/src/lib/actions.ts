import { Action } from '@ngrx/store';

export enum ActionTypes {
  UNDO = '[ngrx-history] UNDO',
  REDO = '[ngrx-history] REDO',
  JUMP_TO_FUTURE = '[ngrx-history] JUMP_TO_FUTURE',
  JUMP_TO_PAST = '[ngrx-history] JUMP_TO_PAST',
  JUMP = '[ngrx-history] JUMP',
  CLEAR_HISTORY = '[ngrx-history] CLEAR_HISTORY'
}

export class UndoAction implements Action {
  readonly type = ActionTypes.UNDO;
}
export class RedoAction implements Action {
  readonly type = ActionTypes.REDO;
}
export class JumpToFutureAction implements Action {
  readonly type = ActionTypes.JUMP_TO_FUTURE;
  constructor(public payload: number) {}
}
export class JumpToPastAction implements Action {
  readonly type = ActionTypes.JUMP_TO_PAST;
  constructor(public payload: number) {}
}
export class JumpAction implements Action {
  readonly type = ActionTypes.JUMP;
  constructor(public payload: number) {}
}
export class ClearHistoryAction implements Action {
  readonly type = ActionTypes.CLEAR_HISTORY;
}

export type ActionUnion =
  | UndoAction
  | RedoAction
  | JumpToFutureAction
  | JumpToPastAction
  | JumpAction
  | ClearHistoryAction;

export const ActionCreators = {
  undo() {
    return new UndoAction();
  },
  redo() {
    return new RedoAction();
  },
  jumpToFuture(index: number) {
    return new JumpToFutureAction(index);
  },
  jumpToPast(index) {
    return new JumpToPastAction(index);
  },
  jump(index) {
    return new JumpAction(index);
  },
  clearHistory() {
    return new ClearHistoryAction();
  }
};
