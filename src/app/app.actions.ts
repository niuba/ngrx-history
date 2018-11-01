import { Action } from '@ngrx/store';

export enum ActionTypes {
  INCREMENT = 'INCREMENT',
  DECREMENT = 'DECREMENT'
}

export class IncrementAction implements Action {
  readonly type = ActionTypes.INCREMENT;
}

export class DecrementAction implements Action {
  readonly type = ActionTypes.DECREMENT;
}

export type UnionAction = IncrementAction | DecrementAction;
