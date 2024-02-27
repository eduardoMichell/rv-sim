import { Injectable } from '@angular/core';
import { Asm } from 'src/app/core/utils/types';
import { RiscV } from '../../core/utils/riscv/riscv';
@Injectable({
  providedIn: 'root'
})
export class RiscvService {

  assembleCode(convertedCode: Asm) {
    const { memories, code } = convertedCode;
    const riscv = new RiscV({ memories, code });
    const result = {
      code: riscv.code,
      memories: {
        regFile: riscv.regFile.registers,
        instMem: riscv.instMem.memory,
        dataMem: riscv.dataMem.memory,
        pc: riscv.pc.getPc()
      }
    }
    return { error: false, data: result, message: 'Success' };
  }

  runOneStep(convertedCode: Asm) {
    const { memories, code } = convertedCode;
    const riscv = new RiscV({ memories, code });
    riscv.runOneStep();
    const result = {
      code: riscv.code,
      memories: {
        regFile: riscv.regFile.registers,
        instMem: riscv.instMem.memory,
        dataMem: riscv.dataMem.memory,
        pc: riscv.pc.getPc()
      }
    }
    return { error: false, data: result, message: 'Success' };
  }

  runEntireProgram(convertedCode: Asm) {
    const { memories, code } = convertedCode;
    const riscv = new RiscV({ memories, code });
    riscv.runEntireProgram();
    const result = {
      code: riscv.code,
      memories: {
        regFile: riscv.regFile.registers,
        instMem: riscv.instMem.memory,
        dataMem: riscv.dataMem.memory,
        pc: riscv.pc.getPc()
      }
    }
    return { error: false, data: result, message: 'Success' };
  }

  dumpFile(asm: any, type: any) {
    const { memories, code } = asm;
    const riscv = new RiscV({ memories, code });
    const data = riscv.dump(type);
    return { error: false, data, message: 'Success' };
  }
}
