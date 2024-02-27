import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { ConstantsInit } from 'src/app/core/utils/constants';
import { Asm } from 'src/app/core/utils/types';
import { ButtonsService } from 'src/app/services/buttons-service/buttons.service';
import { CodeService } from 'src/app/services/code-service/code.service';
import { RuntimeService } from 'src/app/services/runtime-service/runtime.service';
import { UtilsService } from 'src/app/services/utils-service/utils.service';

@Component({
  selector: 'app-execute',
  templateUrl: './execute.component.html',
  styleUrls: ['./execute.component.scss']
})
export class ExecuteComponent implements OnInit, OnDestroy {
  private runtimeSubscription: Subscription;

  page: number = 0;
  MEM_PAGE_SIZE: number = ConstantsInit.MEM_PAGE_SIZE;

  memoryTypes = [
    {
      init: ConstantsInit.DATA_MEM_INIT,
      name: ".data"
    },
    {
      init: ConstantsInit.INST_MEM_INIT,
      name: ".text"
    }
  ];

  memoryType = this.memoryTypes[0];
  checkboxes: any;

  constructor(
    private utils: UtilsService,
    private runtimeService: RuntimeService,
    private buttonService: ButtonsService,
    private codeService: CodeService,
    public dialog: MatDialog) {
    this.runtimeSubscription = this.runtimeService.checkboxes$.subscribe((checkboxes) => {
      this.checkboxes = checkboxes;
    });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.runtimeSubscription.unsubscribe();
  }


  getTextSegment() {
    return this.createTextSegment(ConstantsInit.PC);
  }

  getDataSegment() {
    return this.createDataSegment(this.memoryType.init, this.memoryType.name,
      this.memoryType.init + (this.page * (128 * 2)), this.page * 256);
  }

  createTextSegment(initialMemory: number) {
    const asm = this.codeService.getConvertedCode();

    const visualization = [];
    for (let i = initialMemory; i < ConstantsInit.PC + (asm.code.text.basic.length * 4); i += 4) {
      const instMem = asm.memories.instMem[i];
      if (instMem && instMem.basic && Array.isArray(instMem.basic)) {
        visualization.push({
          code: this.binaryToHexadecimal(instMem.code),
          basic: instMem.basic?.join(" "),
          source: instMem.source?.join(" "),
          address: i
        })
      }
    }
    return visualization;
  }

  createDataSegment(memoryTypeNumber: number, memoryTypeName: string, initialMemory: number, sum: number) {
    const asm = this.codeService.getConvertedCode();
    const visualization = [];
    for (let i = initialMemory; i < memoryTypeNumber + (128 * 4) + sum; i += 4) {
      visualization.push({
        address: i,
        value0: memoryTypeName === '.data' ? asm.memories.dataMem[i] : this.binaryToNumber(asm.memories.instMem[i].code),
        value4: memoryTypeName === '.data' ? asm.memories.dataMem[i + 4] : this.binaryToNumber(asm.memories.instMem[i + 4].code),
        value8: memoryTypeName === '.data' ? asm.memories.dataMem[i + 8] : this.binaryToNumber(asm.memories.instMem[i + 8].code),
        value12: memoryTypeName === '.data' ? asm.memories.dataMem[i + 12] : this.binaryToNumber(asm.memories.instMem[i + 12].code),
        value16: memoryTypeName === '.data' ? asm.memories.dataMem[i + 16] : this.binaryToNumber(asm.memories.instMem[i + 16].code),
        value20: memoryTypeName === '.data' ? asm.memories.dataMem[i + 20] : this.binaryToNumber(asm.memories.instMem[i + 20].code),
        value24: memoryTypeName === '.data' ? asm.memories.dataMem[i + 24] : this.binaryToNumber(asm.memories.instMem[i + 24].code),
        value28: memoryTypeName === '.data' ? asm.memories.dataMem[i + 28] : this.binaryToNumber(asm.memories.instMem[i + 28].code),
      })
      i += 28;
    }
    return visualization;
  }


  numberToHexadecimal(number: number) {
    return this.utils.numberToHexadecimal(number);
  }

  binaryToHexadecimal(binary: any) {
    return this.utils.binaryToHexadecimal(binary);
  }

  binaryToNumber(binary: any) {
    return this.utils.binaryToNumber(binary);
  }

  getHexValues(value: any) {
    return this.utils.isHexadecimalValues(value);
  }

  getHexAddresses(value: any) {
    return this.utils.isHexadecimalAddresses(value);
  }

  canRun() {
    return this.buttonService.getCanRun();
  }

  previousPage() {
    if (this.page > 0) {
      this.page--;
    }
  }

  nextPage() {
    if (this.page <= (ConstantsInit.MEM_PAGE_SIZE)) {
      this.page++;
    }
  }

  selectOnChange() {
    this.page = 0;
  }

}
