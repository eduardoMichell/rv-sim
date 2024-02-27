import { binaryToDecimal } from '../riscv-utils';

export class RegFile {
    registers: any;
    constructor(regFile: any) {
        this.registers = regFile;
    }

    writeRegister(index: any, value: any) {
        this.registers[index] = value;
    }

    readRegister(index: any) {
        return this.registers[index];
    }

    read(rd: any) {
        return this.readRegister('x' + binaryToDecimal(rd));
    }

    write(regWrite: any, writeRg: any, data: any) {
        if (regWrite) {
            this.writeRegister('x' + binaryToDecimal(writeRg), data);
        }
    }
}





