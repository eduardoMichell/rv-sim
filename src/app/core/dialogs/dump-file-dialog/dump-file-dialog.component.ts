import { Component, Inject } from '@angular/core';
import { UtilsService } from 'src/app/services/utils-service/utils.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Asm } from '../../utils/types';
import { DumpTypes } from '../../utils/constants';
import { RiscvService } from 'src/app/services/riscv-service/riscv.service';

@Component({
  selector: 'app-dump-file-dialog',
  templateUrl: './dump-file-dialog.component.html',
  styleUrls: ['./dump-file-dialog.component.scss']
})
export class DumpFileDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public currentCode: Asm,
    public dialogRef: MatDialogRef<DumpFileDialogComponent>,
    private riscvService: RiscvService,
    private utils: UtilsService) {
  }

  types: any[] = DumpTypes;
  type: any = this.types[0];

  async dumpFile() {
    const { data } = this.riscvService.dumpFile(this.currentCode, this.type.typeName);
    this.utils.downloadFile(`dump-${this.type.typeName}-${Date.now()}.txt`, data);
    this.utils.setConsole('System', `The file dump-${this.type.typeName}-${Date.now()}.txt was successfully created`);
    this.closeDialog();
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
