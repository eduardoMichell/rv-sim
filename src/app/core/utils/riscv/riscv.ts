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
    code: any
    regFile: any
    instMem: any
    dataMem: any
    alu: any
    pc: any
    immGen: any
    control: any
    constructor(asm: any) {
        const { code, memories } = asm;
        const { instMem, regFile, pc, dataMem } = memories;
        this.code = new RiscvConverter(code);
        this.regFile = new RegFile(regFile);
        this.instMem = new InstMem(instMem, this.code.text);
        this.dataMem = new DataMem(dataMem, this.code.data);
        this.alu = new ALU();

        this.pc = new PC(pc);
        this.immGen = new ImmGen();
        this.control = new Control();
    }

    runOneStep() {
        //PC
        const instruction = this.instMem.readInstruction(this.pc.getPc()).code;
        console.log("--------------------------")
        console.log('instruction', instruction, this.pc.getPc());
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

        console.log("aluOp", aluOp)
        console.log("aluSrcImm", aluSrcImm)
        console.log("immShamt", immShamt)
        console.log("immUp", immUp)
        console.log("regWrite", regWrite)
        console.log("invBranch", invBranch)
        console.log("branch", branch)
        console.log("jump", jump)
        console.log("jalr", jalr)
        console.log("memRead", memRead)
        console.log("memWrite", memWrite)
        console.log("loadUpImm", loadUpImm)
        console.log("auipc", auipc)
        console.log("memBen", memBen)
        console.log("memUsgn", memUsgn)

        const rd1 = getBinaryRange(19, 15, instruction);
        const rd2 = getBinaryRange(24, 20, instruction);
        console.log('rd1', rd1, 'rd2', rd2)
        const writeRg = getBinaryRange(11, 7, instruction);
        console.log('writeRg', writeRg)
        const rgData1 = this.regFile.read(rd1);
        const rgData2 = this.regFile.read(rd2);
        console.log('rgData1', rgData1, 'rgData2', rgData2)
        const instImm = this.immGen.generate(instruction, immShamt, immUp, memWrite, jump, jalr);
        console.log('instImm', instImm)

        const immBranchValue = getBinaryRange(31, 31, instruction) +
            getBinaryRange(7, 7, instruction) + getBinaryRange(30, 25, instruction) +
            getBinaryRange(11, 8, instruction) + '0';
        const immBranch = binaryToDecimalSigned(resizeSigned(immBranchValue, 32));


        const { aluInput1, aluInput2 } = aluDataSelector(auipc, jump, jalr, aluSrcImm, this.pc.getPc(), instImm, rgData1, rgData2);
        console.log('aluInput1', aluInput1, 'aluInput2', aluInput2)

        //EXEC
        const { aluZero, aluResult } = this.alu.executeALU(aluOp, aluInput1, aluInput2);
        console.log('aluZero', aluZero, 'aluResult', aluResult)

        //MEM ACCESS
        this.dataMem.writeMemory(aluResult, rgData2, memWrite)
        const dataMemData = this.dataMem.readMemory(aluResult, rgData2, memRead, memBen, memUsgn);

        //WRITEBACK
        const regFileWriteData = memDataSelector(memRead, loadUpImm, jump, dataMemData, instImm, this.pc.plusFour(), aluResult);
        this.regFile.write(regWrite, writeRg, regFileWriteData);
        const pcSel = branch && (aluZero ^ invBranch);
        console.log('pcSel', pcSel,)

        const newPc = multiplexer2x1(this.pc.plusFour(), add(this.pc.getPc(), immBranch), pcSel);
        console.log('newPc', newPc,)

        this.pc.setPc(newPc);
    }

    runEntireProgram() {
        for (const line of this.code.text.machineCode) {
            this.runOneStep();
        }
    }


    dump(type: any) {
        switch (type) {
            case DumpTypes[0].typeName:
                return this.code.text.machineCode;
            case DumpTypes[1].typeName:
                return convertArrayBinaryToHexadecimal(this.code.text.machineCode);
            case DumpTypes[2].typeName:
                return convertConfigToText(this.code, this.instMem.memory, this.pc.getPc());
        }
    }


}
