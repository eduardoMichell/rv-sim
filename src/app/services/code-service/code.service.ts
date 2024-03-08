import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Asm } from 'src/app/core/utils/types';
import { UtilsService } from '../utils-service/utils.service';

@Injectable({
  providedIn: 'root'
})
export class CodeService {
  private code: string = '.data\n\n.text\n';
  code$: BehaviorSubject<string> = new BehaviorSubject<string>('');

  private convertedCode: Asm;
  convertedCode$ = new Subject<Asm>();

  private previousCode: Array<string>;
  previousCode$ = new Subject<Array<string>>();

  constructor(private utils: UtilsService) {
    this.code = '.data\n\n.text\n';
    this.previousCode = [];
    this.convertedCode = this.utils.initAsm();
  }

  setPreviousCode(code: any) {
    this.previousCode.push(JSON.stringify(code));
    this.previousCode$.next(this.previousCode);
  }

  clearPreviousCode() {
    this.previousCode = [];
    this.previousCode$.next(this.previousCode);
  }

  getLastPreviousCode() {
    console.log(this.previousCode.length)
    const element = this.previousCode.pop();
    this.previousCode$.next(this.previousCode);
    console.log(this.previousCode.length)
    return element;
  }

  getPreviousCode() { 
    return this.previousCode;
  }

  setCode(code: string) {
    this.code = code;
    this.code$.next(code);
  }

  getCode() {
    return this.code;
  }

  setConvertedCode(convertedCode: Asm) {
    this.convertedCode = convertedCode;
    this.convertedCode$.next(convertedCode);
  }

  getConvertedCode() {
    return this.convertedCode;
  }
}
