import { RiscvConverter } from './riscvConverter';
import { RegFile } from './regFile';
import { Memory } from './memory';
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
    binaryToDecimalSigned,
    decimalToBinary,
    resize
} from '../riscv-utils';
import { RVControl } from '../classes';

export class RiscV {
    code: Code
    regFile: RegFile;
    memory: Memory;
    alu: ALU;
    pc: PC;
    immGen: ImmGen;
    control: Control;
    rvControl: RVControl;
    constructor(asm: any) {
        const { code, memories } = asm;
        const { regFile, pc, memory } = memories;
        this.code = new RiscvConverter(code);
        this.regFile = new RegFile(regFile);
        this.alu = new ALU();
        this.memory = new Memory(memory, this.code);

        this.pc = new PC(pc);
        this.immGen = new ImmGen();
        this.control = new Control();
        this.rvControl = new RVControl();
    }

    runOneStep() {
        //PC
        const instruction = resize(decimalToBinary(this.memory.readMemory(this.pc.getPc(), true, null, null, null)), 32);
        // console.log("============== INIT INST ==============")
        // console.log("instruction:", instruction)
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

        // console.log("aluOp:", aluOp)
        // console.log("aluSrcImm:", aluSrcImm)
        // console.log("immShamt:", immShamt)
        // console.log("immUp:", immUp)
        // console.log("regWrite:", regWrite)
        // console.log("invBranch:", invBranch)
        // console.log("branch:", branch)
        // console.log("jump:", jump)
        // console.log("jalr:", jalr)
        // console.log("memRead:", memRead)
        // console.log("memWrite:", memWrite)
        // console.log("loadUpImm:", loadUpImm)
        // console.log("auipc:", auipc)
        // console.log("memBen:", memBen)
        // console.log("memUsgn:", memUsgn)

        const rd1 = getBinaryRange(19, 15, instruction);
        const rd2 = getBinaryRange(24, 20, instruction);
        const writeRg = getBinaryRange(11, 7, instruction);
        const rgData1 = this.regFile.read(rd1);
        const rgData2 = this.regFile.read(rd2);
        const instImm = this.immGen.generate(instruction, immShamt, immUp, memWrite, jump, jalr);
        // console.log("rd1:", rd1)
        // console.log("rd2:", rd2)
        // console.log("writeRg:", writeRg)
        // console.log("rgData1:", rgData1)
        // console.log("rgData2:", rgData2)
        // console.log("instImm:", instImm)

        const immBranchValue = getBinaryRange(31, 31, instruction) +
            getBinaryRange(7, 7, instruction) + getBinaryRange(30, 25, instruction) +
            getBinaryRange(11, 8, instruction) + '0';
        const immBranch = binaryToDecimalSigned(resizeSigned(immBranchValue, 32));

        // console.log("immBranchValue:", immBranchValue)
        // console.log("immBranch:", immBranch)

        const { aluInput1, aluInput2 } = aluDataSelector(auipc, jump, jalr, aluSrcImm, this.pc.getPc(), instImm, rgData1, rgData2);
        // console.log("aluInput1:", aluInput1)
        // console.log("aluInput2:", aluInput2)
        //EXEC
        const { aluZero, aluResult } = this.alu.executeALU(aluOp, aluInput1, aluInput2);
        // console.log("aluZero:", aluZero)
        // console.log("aluResult:", aluResult)
        // MEM ACCESS
        this.memory.writeMemory(aluResult, rgData2, memWrite)
        const dataMemData = this.memory.readMemory(aluResult, memRead, rgData2, memBen, memUsgn);
        // console.log("dataMemData:", dataMemData)

        // WRITEBACK
        const regFileWriteData = memDataSelector(memRead, loadUpImm, jump, dataMemData, instImm, this.pc.plusFour(), aluResult);
        // console.log("regFileWriteData:", regFileWriteData)
        const lastEdited = this.regFile.write(regWrite, writeRg, regFileWriteData);
        this.rvControl.setLastRegIndex(lastEdited);

        const pcSel = branch && (Number(aluZero) ^ invBranch);
        // console.log("pcSel:", pcSel)
        const newPc = jump ? aluResult : multiplexer2x1(this.pc.plusFour(), add(this.pc.getPc(), immBranch), pcSel);
        // console.log("newPc:", newPc)
        this.pc.setPc(newPc);
        // console.log("============== END INST ==============")
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
                return convertArrayBinaryToHexadecimal(this.code.text.machineCode || []);
            case DumpTypes[2].typeName:
                return convertConfigToText(this.code, this.pc.getPc());
            default:
                return "You selected a non-existent option";
        }
    }
}
