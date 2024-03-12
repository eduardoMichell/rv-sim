import { Component, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription, combineLatest } from 'rxjs';
import { DumpFileDialogComponent } from 'src/app/core/dialogs/dump-file-dialog/dump-file-dialog.component';
import { HelpDialogComponent } from 'src/app/core/dialogs/help-dialog/help-dialog.component';
import { ConstantsInit } from 'src/app/core/utils/constants';
import { Asm, Code } from 'src/app/core/utils/types';
import { ButtonsService } from 'src/app/services/buttons-service/buttons.service';
import { CodeService } from 'src/app/services/code-service/code.service';
import { RuntimeService } from 'src/app/services/runtime-service/runtime.service';
import { UtilsService } from 'src/app/services/utils-service/utils.service';
import { assembly } from 'src/app/core/utils/riscv-utils';
import { convertWrittenCode } from 'src/app/core/utils/riscv-utils';
import { RiscvService } from 'src/app/services/riscv-service/riscv.service';

@Component({
  selector: 'app-button-bar',
  templateUrl: './button-bar.component.html',
  styleUrls: ['./button-bar.component.scss']
})
export class ButtonBarComponent implements OnDestroy {

  private runtimeSubscription: Subscription;
  private codeSubscription: Subscription;

  convertedCode: Asm;
  code: string = '.data\n\n.text\n';

  currentTabIndex: number = 0;

  previousCode: Asm | null;

  constructor(
    private riscvService: RiscvService,
    private utilsService: UtilsService,
    private codeService: CodeService,
    private runtimeService: RuntimeService,
    private buttonService: ButtonsService,
    public dialog: MatDialog) {
    this.code = this.codeService.getCode();
    this.convertedCode = this.utilsService.initAsm();
    this.previousCode = this.codeService.getLastPreviousCode() || null;
    this.codeSubscription = combineLatest([this.codeService.convertedCode$, this.codeService.code$]).subscribe(([convertedCode, code]) => {
      this.convertedCode = convertedCode;
      if (code != "") {
        this.code = code;
      }
    })
    this.runtimeSubscription = this.runtimeService.currentTabIndex$.subscribe((newTabIndex) => {
      this.currentTabIndex = newTabIndex;
    })

  }

  ngOnDestroy() {
    this.codeSubscription.unsubscribe();
    this.runtimeSubscription.unsubscribe();
  }

  assembleCode() {
    this.setCode();
    const code = this.codeService.getConvertedCode();
    const { error, message } = assembly(code);
    if (!error) {
      this.runtimeService.setCurrentTabIndex(1);
      this.convertedCode = code;
      this.codeService.setConvertedCode(this.convertedCode);
      const { data } = this.riscvService.assembleCode(this.convertedCode);
      this.codeService.setConvertedCode(this.utilsService.createAsmObject(data));
      this.buttonService.setCanRun(true);
      this.buttonService.setCanDump(true);
      this.buttonService.setRowCodeIndex(this.convertedCode.memories.pc);
      this.utilsService.setConsole('Assemble', 'operation completed without errors.');
    } else {
      this.utilsService.setConsole('Error', message);
    }
  }

  runOneStep() {
    if (!this.canExecuteInstruction()) {
      this.codeService.setPreviousCode(this.codeService.getConvertedCode());
      const { data } = this.riscvService.runOneStep(this.codeService.getConvertedCode())
      this.codeService.setConvertedCode(this.utilsService.createAsmObject(data));
      this.buttonService.setCanUndoLastStep(false);
      this.buttonService.setRowCodeIndex(this.convertedCode.memories.pc);
    } else {
      this.utilsService.showMessage("Warning: You are trying to execute non-existent instructions", false, true)
    }
  }

  runEntireProgram() {
    if (!this.canExecuteInstruction()) {
      while (!this.canExecuteInstruction()) {
        this.runOneStep();
      }
    } else {
      this.utilsService.showMessage("Warning: You are trying to execute non-existent instructions", false, true)
    }
  }

  undoLastStep() {
    if (!this.canUndoLastStep()) {
      const previous = this.codeService.getLastPreviousCode();
      if (previous) {
        console.log(previous)
        this.codeService.setConvertedCode(previous);
        this.buttonService.setCanUndoLastStep(false);
        this.buttonService.setRowCodeIndex(this.convertedCode.memories.pc);
      }
    }
  }

  async dumpFile() {
    this.dialog.open(DumpFileDialogComponent, {
      data: this.convertedCode
    });
  }

  downloadFile() {
    this.utilsService.downloadFile(`riscv-${Date.now()}.asm`, this.codeService.getCode())
    this.utilsService.setConsole('System', `Downloaded file riscv-${Date.now()}.asm`);
  }

  async onFileSelected(event: any): Promise<void> {
    const code = await this.utilsService.onFileSelected(event);
    if (code) {
      this.setConvertedCode(code);
      this.codeService.setCode(code);
    }

  }

  setCode() {
    const code: Code = convertWrittenCode(this.codeService.getCode());
    this.convertedCode.code = code;
    this.convertedCode.memories = this.utilsService.initMemories();
    this.codeService.setConvertedCode(this.convertedCode);
  }

  help() {
    this.dialog.open(HelpDialogComponent, {
    });
  }

  canUndoLastStep() {
    const convertedCode = this.codeService.getConvertedCode();
    return convertedCode?.memories.pc === ConstantsInit.PC || this.buttonService.getCanUndoLastStep() || this.codeService.getPreviousCode().length === 0;
  }

  resetAll() {
    this.buttonService.setCanUndoLastStep(true);
    this.buttonService.setCanRun(false);
    this.buttonService.setCanDump(false);
    this.setConvertedCode(this.codeService.getCode());
  }

  setConvertedCode(code: string) {
    const convertedCode = this.codeService.getConvertedCode();
    convertedCode.memories = this.utilsService.initMemories();
    convertedCode.code = convertWrittenCode(code);
    this.codeService.setConvertedCode(convertedCode);
  }

  canExecuteInstruction(): boolean {
    return !this.buttonService.getCanRun() || this.isEnd();
  }

  isEnd() {
    const convertedCode = this.codeService.getConvertedCode();
    return convertedCode?.memories.pc === ConstantsInit.PC + (convertedCode.code.text.source.length * 4);
  }

  getCanRun() {
    return this.buttonService.getCanRun();
  }

  getCanDump() {
    return this.buttonService.getCanDump();
  }

}

