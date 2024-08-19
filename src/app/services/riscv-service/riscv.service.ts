import { Injectable } from '@angular/core';
import { Asm } from 'src/app/core/utils/types';
import { RiscV } from '../../core/utils/riscv/riscv';
@Injectable({
  providedIn: 'root'
})
export class RiscvService {
  private riscvInstance: RiscV | null = null;

  assembleCode(convertedCode: Asm) {
    const { memories, code } = convertedCode;
    this.riscvInstance = new RiscV({ memories, code });
    const result = this.generateResult();
    return { error: false, data: result, message: 'Success' };
  }

  runOneStep(convertedCode: Asm) {
    if (!this.riscvInstance) {
      this.assembleCode(convertedCode);
    } else {
      this.riscvInstance.memory.memory = new Map(convertedCode.memories.memory);
      this.riscvInstance.regFile.registers = { ...convertedCode.memories.regFile };
      this.riscvInstance.pc.setPc(convertedCode.memories.pc);
    }
    this.riscvInstance?.runOneStep();
    const result = this.generateResult();
    return { error: false, data: result, message: 'Success' };
  }


  dumpFile(asm: Asm, type: string) {
    if (!this.riscvInstance) {
      this.assembleCode(asm);
    }
    const data = this.riscvInstance?.dump(type);
    return { error: false, data, message: 'Success' };
  }

  private generateResult() {
    if (!this.riscvInstance) {
      throw new Error('RISC-V instance is not initialized.');
    }

    return {
      code: this.riscvInstance.code,
      memories: {
        regFile: this.riscvInstance.regFile.registers,
        memory: this.riscvInstance.memory.memory,
        pc: this.riscvInstance.pc.getPc()
      },
      control: this.riscvInstance.rvControl
    };
  }
}
