import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ButtonsService {
  private canRun: boolean;
  canRun$ = new Subject<boolean>();
  private canUndoLastStepBool: boolean;
  canUndoLastStepBool$ = new Subject<boolean>();

  private canDump: boolean;
  canDump$ = new Subject<boolean>();

  constructor() {
    this.canRun = false;
    this.canUndoLastStepBool = true;
    this.canDump = false;
  }

  setCanRun(canRun: boolean) {
    this.canRun = canRun;
    this.canRun$.next(canRun);
  }

  getCanRun() {
    return this.canRun;
  }

  setCanUndoLastStep(canUndoLastStepBool: boolean) {
    this.canUndoLastStepBool = canUndoLastStepBool;
    this.canUndoLastStepBool$.next(canUndoLastStepBool);
  }

  getCanUndoLastStep() {
    return this.canUndoLastStepBool;
  }

  setCanDump(canDump: boolean) {
    this.canDump = canDump;
    this.canDump$.next(canDump);
  }

  getCanDump() {
    return this.canDump;
  }


}
