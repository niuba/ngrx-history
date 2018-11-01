import { Action } from '@ngrx/store';

export interface History<T> {
  _latestUnfiltered?: T;
  index?: number;
  limit?: number;
  past?: T[];
  present?: T;
  future?: T[];
  group?: string;
}

export function parseActions(
  rawActions: string | string[],
  defaultValue: string[] = []
): string[] {
  if (Array.isArray(rawActions)) {
    return rawActions;
  } else if (typeof rawActions === 'string') {
    return [rawActions];
  }
  return defaultValue;
}

// isHistory helper: check for a valid history object
export function isHistory(history) {
  return (
    typeof history.present !== 'undefined' &&
    typeof history.future !== 'undefined' &&
    typeof history.past !== 'undefined' &&
    Array.isArray(history.future) &&
    Array.isArray(history.past)
  );
}

export type Filter<T, V extends Action = Action> = (
  action: V,
  state?: T,
  history?: History<T>
) => boolean;

// includeAction helper: whitelist actions to be added to the history
export function includeAction(rawActions: string | string[]): Filter<never> {
  const actions = parseActions(rawActions);
  return (action: Action) => actions.indexOf(action.type) >= 0;
}

// excludeAction helper: blacklist actions from being added to the history
export function excludeAction(rawActions: string | string[]): Filter<never> {
  const actions = parseActions(rawActions);
  return (action: Action) => actions.indexOf(action.type) < 0;
}

// combineFilters helper: combine multiple filters to one
export function combineFilters<T>(...filters: Filter<T>[]) {
  return filters.reduce(
    (prev, curr) => (action, currentState, previousHistory) =>
      prev(action, currentState, previousHistory) &&
      curr(action, currentState, previousHistory),
    () => true
  );
}

export type GroupBy<T, V extends Action = Action> = (
  action: V,
  state?: T,
  history?: History<T>
) => string;

export function groupByActionTypes(rawActions: string[]): GroupBy<never> {
  const actions = parseActions(rawActions);
  return (action: Action) =>
    actions.indexOf(action.type) >= 0 ? action.type : null;
}

export function newHistory<T>(
  past: T[],
  present: T,
  future: T[],
  group: string = null
): History<T> {
  return {
    past,
    present,
    future,
    group,
    _latestUnfiltered: present,
    index: past.length,
    limit: past.length + future.length + 1
  };
}
