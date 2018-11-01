import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import * as AppReducers from './app.reducers';
import { Store, select } from '@ngrx/store';
import { IncrementAction, DecrementAction } from './app.actions';
import { RedoAction, UndoAction } from 'projects/ngrx-history/src/lib';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  counter$: Observable<number>;
  constructor(private store: Store<AppReducers.State>) {}
  ngOnInit() {
    this.counter$ = this.store.pipe(select(AppReducers.selectCounter));
  }
  public redo = () => this.store.dispatch(new RedoAction());
  public undo = () => this.store.dispatch(new UndoAction());
  public inc = () => this.store.dispatch(new IncrementAction());
  public dec = () => this.store.dispatch(new DecrementAction());
}
