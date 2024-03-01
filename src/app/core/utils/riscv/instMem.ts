import { ConstantsInit } from '../constants'
import { Text } from '../types'
export class InstMem {
    memory: any
    constructor(instMem: any, text: Text) {
        this.memory = this.setTextToInstMem(instMem, text)
    }
    setTextToInstMem(instMem: any, text: Text) {
        const instMemInit = ConstantsInit.INST_MEM_INIT;
        const totalOfInstruction = text.basic.length;
        for (let i = 0; i < totalOfInstruction; i++) {
            instMem[instMemInit + i * 4].basic = text.basic[i];
            instMem[instMemInit + i * 4].code = text.machineCode?.[i] ?? "";
            instMem[instMemInit + i * 4].source = text.source[i];
        }
        return instMem;
    }

    readInstruction(address: number) {
        return this.memory[address];
    }

}
