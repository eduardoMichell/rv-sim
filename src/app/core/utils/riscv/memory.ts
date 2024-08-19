import { ConstantsInit } from '../constants'
import { binaryToDecimal } from '../riscv-utils';
import { Code, Data, Text } from '../types';

export class Memory {
    memory: any;
    constructor(memory: Map<any, any>, code: Code) {
        this.memory = memory;
        this.memory = this.setDataToDataMem(memory, code.data || []);
        this.memory = this.setTextToInstMem(memory, code.text);
    }

    writeMemory(address: number, data: any, memWrite: boolean) {
        if (memWrite) {
            this.memory.set(address, data);
        }
    }

    readMemory(address: number, memRead: boolean, rgData2: any, memBen: any, memUsgn: any) {
        if (memRead) {
            return this.memory.get(address) || 0;
        }
    }

    setDataToDataMem(memory: Map<any, any>, data: Data[]) {
        let total = 0
        for (const dataI of data) {
            for (let i = 0; i < dataI.basic.length; i++) {
                memory.set(ConstantsInit.DATA_MEM_INIT + total * 4, dataI.basic[i]);
                total++;
            }
        }
        return memory;
    }

    setTextToInstMem(memory: Map<any, any>, text: Text) {
        const instMemInit = ConstantsInit.INST_MEM_INIT;
        const totalOfInstruction = text.basic.length;
        for (let i = 0; i < totalOfInstruction; i++) {
            memory.set(instMemInit + i * 4, binaryToDecimal(text.machineCode?.[i] || "") || 0)
        }
        return memory;
    }

}
