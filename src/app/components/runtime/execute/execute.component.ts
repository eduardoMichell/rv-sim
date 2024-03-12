import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { ConstantsInit } from 'src/app/core/utils/constants';
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
  private buttonSubscription: Subscription;

  page: number = 0;
  MEM_PAGE_SIZE: number = ConstantsInit.MEM_PAGE_SIZE;
  PC_START: number = ConstantsInit.PC;
  rowIndex: number = 0;
  memoryTypes = [
    {
      init: ConstantsInit.DATA_MEM_INIT,
      name: ".data"
    },
    {
      init: ConstantsInit.INST_MEM_INIT,
      name: ".text"
    },
    {
      init: ConstantsInit.SP_MEM_INIT,
      name: "Current SP"
    },
    {
      init: ConstantsInit.GP_MEM_INIT,
      name: "Current GP"
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

    this.buttonSubscription = this.buttonService.rowIndex$.subscribe((rowIndex) => {
      this.scrollToSelectedRow(rowIndex);
      this.rowIndex = rowIndex;
    });
  }

  ngOnInit() {
    this.scrollToSelectedRow(this.PC_START);
  }

  ngOnDestroy() {
    this.runtimeSubscription.unsubscribe();
    this.buttonSubscription.unsubscribe();
  }


  getTextSegment() {
    return this.createTextSegment(this.PC_START);
  }

  getDataSegment() {
    return this.createDataSegment(this.memoryType.init, this.page * 256);
  }

  createTextSegment(initialMemory: number) {
    const asm = this.codeService.getConvertedCode();
    const visualization = [];
    let pc = initialMemory;
    for (let i = 0; i < asm.code.text.basic.length; i++) {
      const source = asm.code.text.source[i];
      const basic = asm.code.text.basic[i];
      const machineCode = asm.code.text.machineCode?.[i] || "";
      if (basic && Array.isArray(basic.inst)) {
        visualization.push({
          code: this.binaryToHexadecimal(machineCode),
          basic: basic?.inst.join(" "),
          source: source?.join(" "),
          address: pc
        })
        pc+=4;
      }
    }
    return visualization;
  }

  createDataSegment(memoryTypeNumber: number, sum: number) {
    const asm = this.codeService.getConvertedCode();
    const visualization = [];
    for (let i = memoryTypeNumber + sum; i < memoryTypeNumber + (128 * 4) + sum; i += 4) {
      visualization.push({
        address: i,
        value0: asm.memories?.memory?.get(i) ? asm.memories.memory.get(i) : 0,
        value4: asm.memories?.memory?.get(i + 4) ? asm.memories.memory.get(i + 4) : 0,
        value8: asm.memories?.memory?.get(i + 8) ? asm.memories.memory.get(i + 8) : 0,
        value12: asm.memories?.memory?.get(i + 12) ? asm.memories.memory.get(i + 12) : 0,
        value16: asm.memories?.memory?.get(i + 16) ? asm.memories.memory.get(i + 16) : 0,
        value20: asm.memories?.memory?.get(i + 20) ? asm.memories.memory.get(i + 20) : 0,
        value24: asm.memories?.memory?.get(i + 24) ? asm.memories.memory.get(i + 24) : 0,
        value28: asm.memories?.memory?.get(i + 28) ? asm.memories.memory.get(i + 28) : 0,
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
    return this.utils.binaryToDecimal(binary);
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
      this.page--;
  }

  nextPage() {
      this.page++;
  }

  selectOnChange() {
    this.page = 0;
  }

  scrollToSelectedRow(number: number) {
    const rowId = 'row-' + number;
    const row = document.getElementById(rowId);
    if (row) {
      row.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    }
  }

}
