import {
  ActionTypes,
  ActionUnion,
  JumpToFutureAction,
  JumpToPastAction,
  JumpAction,
  ClearHistoryAction
} from './actions';
import { History, Filter, GroupBy, newHistory, isHistory, parseActions } from './helpers';
import { ActionReducer, Action } from '@ngrx/store';

// createHistory
function createHistory<T>(state: T, ignoreInitialState: boolean) {
  // ignoreInitialState essentially prevents the user from undoing to the
  // beginning, in the case that the undoable reducer handles initialization
  // in a way that can't be redone simply
  const history = newHistory([], state, []);
  if (ignoreInitialState) {
    history._latestUnfiltered = null;
  }
  return history;
}

// lengthWithoutFuture: get length of history
function lengthWithoutFuture<T>(history: History<T>) {
  return history.past.length + 1;
}

// insert: insert `state` into history, which means adding the current state
//         into `past`, setting the new `state` as `present` and erasing
//         the `future`.
function insert<T>(history: History<T>, state: T, limit: number, group) {
  const { past, _latestUnfiltered } = history;
  const historyOverflow = limit && lengthWithoutFuture(history) >= limit;

  const pastSliced = past.slice(historyOverflow ? 1 : 0);
  const newPast =
    _latestUnfiltered != null ? [...pastSliced, _latestUnfiltered] : pastSliced;

  return newHistory(newPast, state, [], group);
}

// jumpToFuture: jump to requested index in future history
function jumpToFuture<T>(history: History<T>, index: number) {
  if (index < 0 || index >= history.future.length) {
    return history;
  }

  const { past, future, _latestUnfiltered } = history;

  const newPast = [...past, _latestUnfiltered, ...future.slice(0, index)];
  const newPresent = future[index];
  const newFuture = future.slice(index + 1);

  return newHistory(newPast, newPresent, newFuture);
}

// jumpToPast: jump to requested index in past history
function jumpToPast<T>(history: History<T>, index: number) {
  if (index < 0 || index >= history.past.length) {
    return history;
  }

  const { past, future, _latestUnfiltered } = history;

  const newPast = past.slice(0, index);
  const newFuture = [...past.slice(index + 1), _latestUnfiltered, ...future];
  const newPresent = past[index];

  return newHistory(newPast, newPresent, newFuture);
}

// jump: jump n steps in the past or forward
function jump<T>(history: History<T>, n: number) {
  if (n > 0) {
    return jumpToFuture(history, n - 1);
  }
  if (n < 0) {
    return jumpToPast(history, history.past.length + n);
  }
  return history;
}

// helper to dynamically match in the reducer's switch-case
function actionTypeAmongClearHistoryType(
  actionType: string,
  clearHistoryType: string[]
) {
  return clearHistoryType.indexOf(actionType) > -1 ? actionType : !actionType;
}

export interface UndoableConFig<T, V extends Action = Action> {
  initTypes?: string | string[];
  limit?: number;
  filter?: Filter<T, V>;
  groupBy?: GroupBy<T, V>;
  undoType?: string;
  redoType?: string;
  jumpToPastType?: string;
  jumpToFutureType?: string;
  jumpType?: string;
  clearHistoryType?: string[];
  neverSkipReducer?: boolean;
  ignoreInitialState?: boolean;
  syncFilter?: boolean;
}

export function undoableFactory<T, V extends Action = Action>(
  rawConfig: UndoableConFig<T>
) {
  return (reducer: ActionReducer<T>): ActionReducer<History<T>> => {
    const config: UndoableConFig<T> = {
      initTypes: parseActions(rawConfig.initTypes, ['[ngrx-history] INIT']),
      limit: rawConfig.limit || 100,
      filter: rawConfig.filter || ((action: Action) => true),
      groupBy: rawConfig.groupBy || ((action: Action) => null),
      undoType: rawConfig.undoType || ActionTypes.UNDO,
      redoType: rawConfig.redoType || ActionTypes.REDO,
      jumpToPastType: rawConfig.jumpToPastType || ActionTypes.JUMP_TO_PAST,
      jumpToFutureType:
        rawConfig.jumpToFutureType || ActionTypes.JUMP_TO_FUTURE,
      jumpType: rawConfig.jumpType || ActionTypes.JUMP,
      clearHistoryType: rawConfig.clearHistoryType || [
        ActionTypes.CLEAR_HISTORY
      ],
      neverSkipReducer: rawConfig.neverSkipReducer || false,
      ignoreInitialState: rawConfig.ignoreInitialState || false,
      syncFilter: rawConfig.syncFilter || false
    };

    // const initialState: History<T> = createHistory(
    //   reducer(undefined, new ClearHistoryAction()),
    //   config.ignoreInitialState
    // );
    let initialState: History<T>;
    return (state: History<T> = initialState, action: Action | ActionUnion) => {
      if (action === undefined) {
        return state;
      }

      let history = state;
      if (!initialState) {
        if (state === undefined) {
          const clearHistoryAction = { type: ActionTypes.CLEAR_HISTORY };
          const start = reducer(undefined, clearHistoryAction);

          history = createHistory(start, config.ignoreInitialState);
        } else if (isHistory(state)) {
          history = initialState = config.ignoreInitialState
            ? state
            : newHistory(state.past, state.present, state.future);
        } else {
          history = initialState = createHistory(
            state as any,
            config.ignoreInitialState
          );
        }
      }

      function skipReducer(res: History<T>) {
        if (config.neverSkipReducer) {
          return {
            ...res,
            present: reducer(res.present, action)
          };
        } else {
          return res;
        }
      }

      switch (action.type) {
        case config.undoType:
          return skipReducer(jump(history, -1));

        case config.redoType:
          return skipReducer(jump(history, 1));

        case config.jumpToPastType:
          return skipReducer(
            jumpToPast(history, (<JumpToPastAction>action).payload)
          );

        case config.jumpToFutureType:
          return skipReducer(
            jumpToFuture(history, (<JumpToFutureAction>action).payload)
          );

        case config.jumpType:
          return skipReducer(jump(history, (<JumpAction>action).payload));

        case actionTypeAmongClearHistoryType(
          action.type,
          config.clearHistoryType
        ):
          return skipReducer(
            createHistory(history.present, config.ignoreInitialState)
          );

        default:
          const res: T = reducer(history.present, action);

          if ((<string[]>config.initTypes).some(actionType => actionType === action.type)) {
            return initialState;
          }

          if (history._latestUnfiltered === res) {
            // Don't handle this action. Do not call debug.end here,
            // because this action should not produce side effects to the console
            return history;
          }

          const filtered = !config.filter(action, res, history);

          if (filtered) {
            // if filtering an action, merely update the present
            const filteredState = newHistory(
              history.past,
              res,
              history.future,
              history.group
            );
            if (!config.syncFilter) {
              filteredState._latestUnfiltered = history._latestUnfiltered;
            }

            return filteredState;
          }

          const group = config.groupBy(action, res, history);
          if (group != null && group === history.group) {
            // if grouping with the previous action, only update the present
            const groupedState = newHistory(
              history.past,
              res,
              history.future,
              history.group
            );
            return groupedState;
          }

          // If the action wasn't filtered or grouped, insert normally
          history = insert(history, res, config.limit, group);
          return history;
      }
    };
  };
}
