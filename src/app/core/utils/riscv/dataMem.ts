import { ConstantsInit } from '../constants'
import { binaryToDecimal } from '../riscv-utils';

export class DataMem {
    memory: any;
    constructor(dataMem: any, data: any) {
        this.memory = this.setDataToDataMem(dataMem, data)
    }
    writeMemory(address: any, data: any, memWrite: any) {
        if (memWrite) {
            this.memory[address] = data;
        }
    }
    readMemory(address: any, rgData2: any, memRead: any, memBen: any, memUsgn: any) {
        if (memRead) {
            return this.memory[binaryToDecimal(address)];
        }
    }

    setDataToDataMem(datamem: any, data: any) {
        let total = 0
        for (const dataI of data) {
            for (let i = 0; i < dataI.basic.length; i++) {
                datamem[ConstantsInit.DATA_MEM_INIT + total * 4] = dataI.basic[i];
                total++;
            }
        }
        return datamem;
    }

}
