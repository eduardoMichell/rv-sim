import { KeyValue } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Asm } from 'src/app/core/utils/types';
import { CodeService } from 'src/app/services/code-service/code.service';
import { UtilsService } from 'src/app/services/utils-service/utils.service';

@Component({
  selector: 'app-reg-file',
  templateUrl: './reg-file.component.html',
  styleUrls: ['./reg-file.component.scss']
})
export class RegFileComponent implements OnDestroy {

  private codeSubscription: Subscription;
  convertedCode: Asm;
  constructor(
    private codeService: CodeService,
    private utilsService: UtilsService
  ) {
    this.convertedCode = this.codeService.getConvertedCode();
    this.codeSubscription = this.codeService.convertedCode$.subscribe((convertedCode) => {
      this.convertedCode = convertedCode;
    });
  }

  ngOnDestroy() {
    this.codeSubscription.unsubscribe();
  }

  originalOrder = (a: KeyValue<number, string>, b: KeyValue<number, string>): number => {
    return 0;
  }

  getRegName(type: any): string {
    switch (type) {
      case 'x0':
        return 'zero';
      case 'x1':
        return 'ra';
      case 'x2':
        return 'sp';
      case 'x3':
        return 'gp';
      case 'x4':
        return 'tp';
      case 'x5':
        return 't0';
      case 'x6':
        return 't1';
      case 'x7':
        return 't2';
      case 'x8':
        return 's0';
      case 'x9':
        return 's1';
      case 'x10':
        return 'a0';
      case 'x11':
        return 'a1';
      case 'x12':
        return 'a2';
      case 'x13':
        return 'a3';
      case 'x14':
        return 'a4';
      case 'x15':
        return 'a5';
      case 'x16':
        return 'a6';
      case 'x17':
        return 'a7';
      case 'x18':
        return 's2';
      case 'x19':
        return 's3';
      case 'x20':
        return 's4';
      case 'x21':
        return 's5';
        case 'x22':
        return 's6';
      case 'x23':
        return 's7';
      case 'x24':
        return 's8';
      case 'x25':
        return 's9';
      case 'x26':
        return 's10';
      case 'x27':
        return 's11';
      case 'x28':
        return 't3';
      case 'x29':
        return 't4';
      case 'x30':
        return 't5';
      case 'x31':
        return 't6';
    }
    return '';
  }

  getHexValues(value: any){
    return this.utilsService.isHexadecimalValues(value);
  }


}
