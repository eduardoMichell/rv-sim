import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RuntimeService {

  private currentTabIndex: number;
  currentTabIndex$ = new Subject<number>(); 

  private checkboxes: any;
  checkboxes$ = new Subject<any>(); 

  constructor() { 
    this.currentTabIndex = 0;
    this.checkboxes = {
      isHexAddresses: true,
      isHexValues: true,
      isAscii: false
    }
  }

  setCurrentTabIndex(currentTabIndex: number){
    this.currentTabIndex = currentTabIndex;
    this.currentTabIndex$.next(currentTabIndex);
  }

  getCurrentTabIndex(){
    return this.currentTabIndex;
  }


  setCheckboxes(checkboxes: any){
    this.checkboxes = checkboxes;
    this.checkboxes$.next(checkboxes);
  }

  getCheckboxes(){
    return this.checkboxes;
  }
}
