import { ConstantsInit } from '../constants'
import { binaryToDecimal } from '../riscv-utils';
import { Data } from '../types';

export class DataMem {
    memory: any;
    constructor(dataMem: any, data: Data[]) {
        this.memory = this.setDataToDataMem(dataMem, data)
    }
    writeMemory(address: number, data: Data[], memWrite: boolean) {
        if (memWrite) {
            this.memory[address] = data;
        }
    }

    readMemory(address: string, rgData2: any, memRead: boolean, memBen: any, memUsgn: any) {
        if (memRead) {
            return this.memory[binaryToDecimal(address)];
        }
    }

    setDataToDataMem(datamem: any, data: Data[]) {
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
