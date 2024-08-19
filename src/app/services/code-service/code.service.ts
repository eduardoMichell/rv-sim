import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Asm } from 'src/app/core/utils/types';
import { UtilsService } from '../utils-service/utils.service';
import { cloneDeep } from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class CodeService {
  private code: string = '.data\n\n.text\n';
  code$: BehaviorSubject<string> = new BehaviorSubject<string>(this.code);

  private convertedCode: Asm;
  convertedCode$ = new BehaviorSubject<Asm>(this.utils.initAsm());

  private previousCode: Array<Asm> = [];
  previousCode$ = new BehaviorSubject<Array<Asm>>(this.previousCode);

  constructor(private utils: UtilsService) {
    this.code = '.data\n\n.text\n';
    this.previousCode = [];
    this.convertedCode = this.utils.initAsm();
  }

  setPreviousCode(code: Asm) {
    this.previousCode.push(cloneDeep(code));
    this.previousCode$.next(this.previousCode);
  }

  clearPreviousCode() {
    this.previousCode = [];
    this.previousCode$.next(this.previousCode);
  }

  getLastPreviousCode() {
    const element = this.previousCode.pop();
    this.previousCode$.next(this.previousCode);
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
