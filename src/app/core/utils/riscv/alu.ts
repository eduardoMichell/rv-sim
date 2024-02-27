import { toUnsigned32 } from '../riscv-utils';
import { AluOperations } from '../constants';

export class ALU {
    constructor() {
    }

    executeALU(aluControl: any, inputA: any, inputB: any) {
        let aluZero = false;
        let aluResult: any = 0;
        switch (aluControl) {
            case AluOperations.ADD:
                aluResult = inputA + inputB;
                break;
            case AluOperations.SUB:
                aluResult = inputA - inputB;
                break;
            case AluOperations.AND:
                aluResult = inputA & inputB;
                break;
            case AluOperations.OR:
                aluResult = inputA | inputB;
                break;
            case AluOperations.XOR:
                aluResult = inputA ^ inputB;
                break;
            case AluOperations.SLL:
                let sllRes = inputA;
                sllRes <<= inputB;
                aluResult = sllRes;
                break;
            case AluOperations.SRL:
                let srlRes = inputA;
                srlRes >>>= inputB;
                aluResult = srlRes;
                break;
            case AluOperations.SRA:
                aluResult = inputA >> inputB;
                break;
            case AluOperations.SLT:
                aluResult = inputA < inputB;
                break;
            case AluOperations.SLTU:
                aluResult = toUnsigned32(inputA) | toUnsigned32(inputB);
                break;
        }
        aluZero = this.checkIsZero(aluResult);
        return { aluResult, aluZero };
    }

    checkIsZero(value: any) {
        return value === 0;
    }

}

