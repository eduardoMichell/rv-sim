import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { Subscription, combineLatest } from 'rxjs';
import { Asm, Code } from 'src/app/core/utils/types';
import { CodeService } from 'src/app/services/code-service/code.service';
import { RuntimeService } from 'src/app/services/runtime-service/runtime.service';
import { convertWrittenCode } from 'src/app/core/utils/riscv-utils';
import { ButtonsService } from 'src/app/services/buttons-service/buttons.service';
import { UtilsService } from 'src/app/services/utils-service/utils.service';

@Component({
  selector: 'app-runtime',
  templateUrl: './runtime.component.html',
  styleUrls: ['./runtime.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RuntimeComponent implements OnInit, OnDestroy {

  editorOptions = { theme: 'rv32i-theme', language: 'rv32i', minimap: { enabled: false }, };
  private codeSubscription: Subscription;

  convertedCode: Asm;
  code: string = '.data\n\n.text\n';

  textSegment: any = [];
  dataSegment: any = [];

  constructor(
    private runtimeService: RuntimeService,
    private codeService: CodeService,
    private buttonService: ButtonsService,
    private utilsService: UtilsService
  ) {
    this.convertedCode = this.codeService.getConvertedCode();
    this.code = this.codeService.getCode();
    this.codeSubscription = combineLatest([this.codeService.convertedCode$, this.codeService.code$]).subscribe(([convertedCode, code]) => {
      this.convertedCode = convertedCode;
      if (code != "") {
        this.code = code;
      }
    })
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.codeSubscription.unsubscribe();
  }

  onTabChange(event: MatTabChangeEvent) {
    this.runtimeService.setCurrentTabIndex(event.index);
  }

  getSelectedIndex(): number {
    return this.runtimeService.getCurrentTabIndex();
  }

  onCodeChange(): void {
    this.resetAllButtons();
    this.codeService.setCode(this.code);
    const code: Code = convertWrittenCode(this.codeService.getCode());
    this.convertedCode.code = code;
    this.convertedCode.memories = this.utilsService.initMemories();
    this.codeService.setConvertedCode(this.convertedCode);
  }

  resetAllButtons() {
    this.buttonService.setCanUndoLastStep(true);
    this.buttonService.setCanRun(false);
    this.buttonService.setCanDump(false);
  }
}
