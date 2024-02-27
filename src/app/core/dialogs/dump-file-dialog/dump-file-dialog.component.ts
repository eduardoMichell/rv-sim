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
    const text = this.prepareDataToDump(this.type.typeName, data);
    this.utils.downloadFile(`dump-${this.type.typeName}-${Date.now()}.txt`, text);
    this.utils.setConsole('System', `The file dump-${this.type.typeName}-${Date.now()}.txt was successfully created`);
    this.closeDialog();

  }

  private prepareDataToDump(type: string, data: any): string {
    switch (type) {
      case 'binary':
      case 'hexadecimal':
        return data.toString().replaceAll(',', '\n')
      case 'text':
        let text = 'Address        Code              Basic                   Line Source\n';
        for (let i = 0; i < data.address.length; i++) {
          text += `${data.address[i]}     ${data.code[i]}        ${data.basic[i]}${" ".repeat(24 - data.basic[i].toString().length)}${i}   ${data.source[i]}\n`;
        }
        return text;
    }
    return 'Error';
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

}
