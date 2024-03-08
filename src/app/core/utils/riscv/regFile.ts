import { binaryToDecimal } from '../riscv-utils';

export class RegFile {
    registers: any;
    constructor(regFile: any) {
        this.registers = regFile;
    }

    writeRegister(index: string, value: string) {
        this.registers[index] = value;
    }

    readRegister(index: string) {
        return this.registers[index];
    }

    read(rd: string) {
        return this.readRegister('x' + binaryToDecimal(rd));
    }

    write(regWrite: boolean, writeRg: string, data: string) {
        if (regWrite && binaryToDecimal(writeRg) !== 0) {
            this.writeRegister('x' + binaryToDecimal(writeRg), data);
        }
    }
}





