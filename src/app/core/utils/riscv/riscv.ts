import { RiscvConverter } from './riscvConverter';
import { RegFile } from './regFile';
import { InstMem } from './instMem';
import { DataMem } from './dataMem';
import { Control } from './control';
import { ALU } from './alu';
import { PC } from './pc';
import { ImmGen } from './immGen';
import { multiplexer2x1 } from './controllers/multiplexers';
import { add, aluDataSelector, memDataSelector } from './controllers/control';
import { DumpTypes } from '../../utils/constants';
import { Code } from '../../utils/types';
import {
    convertArrayBinaryToHexadecimal,
    convertConfigToText,
    getBinaryRange,
    getOpcode,
    getFunct3,
    getFunct7,
    resizeSigned,
    binaryToDecimalSigned
} from '../riscv-utils';


//TODO: VERIFICAR A QUANTIDADE E FORMATO DA SAIDA DA ALU, PC, REGFILE, ETC
// VERIFICAR O FORMATO DE TODOS PARAMETROS, STRING OU NUMBER
// FAZER O OTHER '0' PARA SAIDAS DE TODAS FUNCOES


export class RiscV {
    code: Code
    regFile: RegFile;
    instMem: InstMem;
    dataMem: DataMem;
    alu: ALU;
    pc: PC;
    immGen: ImmGen;
    control: Control;
    constructor(asm: any) {
        const { code, memories } = asm;
        const { instMem, regFile, pc, dataMem } = memories;
        this.code = new RiscvConverter(code);
        this.regFile = new RegFile(regFile);
        this.instMem = new InstMem(instMem, this.code.text);
        this.dataMem = new DataMem(dataMem, this.code.data || []);
        this.alu = new ALU();

        this.pc = new PC(pc);
        this.immGen = new ImmGen();
        this.control = new Control();
    }

    runOneStep() {
        //PC
        const instruction = this.instMem.readInstruction(this.pc.getPc()).code;

        //DECODE
        const {
            aluOp,
            aluSrcImm,
            immShamt,
            immUp,
            regWrite,
            invBranch,
            branch,
            jump,
            jalr,
            memRead,
            memWrite,
            loadUpImm,
            auipc,
            memBen,
            memUsgn
        } = this.control.generateControl(getOpcode(instruction), getFunct3(instruction), getFunct7(instruction));

        const rd1 = getBinaryRange(19, 15, instruction);
        const rd2 = getBinaryRange(24, 20, instruction);
        const writeRg = getBinaryRange(11, 7, instruction);
        const rgData1 = this.regFile.read(rd1);
        const rgData2 = this.regFile.read(rd2);
        const instImm = this.immGen.generate(instruction, immShamt, immUp, memWrite, jump, jalr);

        const immBranchValue = getBinaryRange(31, 31, instruction) +
            getBinaryRange(7, 7, instruction) + getBinaryRange(30, 25, instruction) +
            getBinaryRange(11, 8, instruction) + '0';
        const immBranch = binaryToDecimalSigned(resizeSigned(immBranchValue, 32));

        const { aluInput1, aluInput2 } = aluDataSelector(auipc, jump, jalr, aluSrcImm, this.pc.getPc(), instImm, rgData1, rgData2);

        //EXEC
        const { aluZero, aluResult } = this.alu.executeALU(aluOp, aluInput1, aluInput2);

        //MEM ACCESS
        this.dataMem.writeMemory(aluResult, rgData2, memWrite)
        const dataMemData = this.dataMem.readMemory(aluResult, rgData2, memRead, memBen, memUsgn);

        //WRITEBACK
        const regFileWriteData = memDataSelector(memRead, loadUpImm, jump, dataMemData, instImm, this.pc.plusFour(), aluResult);
        this.regFile.write(regWrite, writeRg, regFileWriteData);
        const pcSel = branch && (Number(aluZero) ^ invBranch);

        const newPc = multiplexer2x1(this.pc.plusFour(), add(this.pc.getPc(), immBranch), pcSel);
        this.pc.setPc(newPc);
    }

    dump(type: string) {
        switch (type) {
            case DumpTypes[0].typeName:
                if (this.code.text.machineCode) {
                    return this.code.text.machineCode.toString().replace(/,/g, '\n');
                } else {
                    return "The code was not assembled correctly";
                }
            case DumpTypes[1].typeName:
                return convertArrayBinaryToHexadecimal(this.code.text.machineCode);
            case DumpTypes[2].typeName:
                return convertConfigToText(this.code, this.pc.getPc());
            default:
                return "You selected a non-existent option";
        }
    }
}
