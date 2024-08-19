import { Opcodes, AluOperations, InstFormat } from '../constants'
import { getBinaryRange } from '../riscv-utils';

export class Control {
    constructor() {
    }

    generateControl(opcode: string, funct3: string, funct7: string) {
        let aluOp: any = 0;
        let aluSrcImm: any = 0;
        let immShamt: any = 0;
        let immUp: any = 0;
        let regWrite: any = 0;
        let invBranch: any = 0;
        let branch: any = 0;
        let jump: any = 0;
        let jalr: any = 0;
        let memRead: any = 0;
        let memWrite: any = 0;
        let loadUpImm: any = 0;
        let auipc: any = 0;
        let memBen: any = 0;
        let memUsgn: any = 0;

        const instructionFormat = this.getInstructionFormat(opcode);
        // console.log("opcode:",opcode)
        // console.log("instructionFormat:", instructionFormat)
        // -------------------- ALU --------------------
        const shiftOp = getBinaryRange(1, 0, funct3) === '01' ? 1 : 0;
        const branchOp = this.getBranchOperation(funct3);
        const addSubOp = funct3 === '000' ? 1 : 0;
        aluOp = this.getAluOp(funct3, funct7, branchOp, shiftOp, addSubOp, instructionFormat);
        aluSrcImm = instructionFormat !== InstFormat.R && instructionFormat !== InstFormat.B;

        // -------------------- IMMEDIATE SELECTOR --------------------
        immShamt = (instructionFormat === InstFormat.IARITH || instructionFormat === InstFormat.R) && (shiftOp === 1);
        immUp = (instructionFormat === InstFormat.ULUI || instructionFormat === InstFormat.UAUIPC);

        // -------------------- REGISTER BANK --------------------
        regWrite = (instructionFormat !== InstFormat.S && instructionFormat !== InstFormat.IFENCE &&
            instructionFormat !== InstFormat.B && instructionFormat !== InstFormat.ULUI);

        // -------------------- BRANCHS --------------------
        invBranch = Boolean(parseInt(getBinaryRange(2, 2, funct3)) ^ parseInt(getBinaryRange(0, 0, funct3)));
        branch = instructionFormat === InstFormat.B;
        jump = (instructionFormat === InstFormat.UJAL || instructionFormat === InstFormat.IJALR);
        jalr = instructionFormat === InstFormat.IJALR;

        // -------------------- MEMORY ACCESS --------------------
        memRead = instructionFormat === InstFormat.ILOAD;
        memWrite = instructionFormat === InstFormat.S;
        memBen = getBinaryRange(1, 1, funct3) === '0' ? getBinaryRange(1, 0, funct3) : '11';
        memUsgn = parseInt(getBinaryRange(2, 2, funct3));

        // -------------------- U TYPE --------------------
        loadUpImm = instructionFormat === InstFormat.ULUI;
        auipc = instructionFormat === InstFormat.UAUIPC;

        return {
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
        }
    }

    getInstructionFormat(opcode: string) {
        switch (opcode) {
            case Opcodes.R:
                return InstFormat.R;
            case Opcodes.IJALR:
                return InstFormat.IJALR;
            case Opcodes.ILOAD:
                return InstFormat.ILOAD;
            case Opcodes.IARITH:
                return InstFormat.IARITH;
            case Opcodes.IFENCE:
                return InstFormat.IFENCE;
            case Opcodes.ISYSCALL:
                return InstFormat.ISYSCALL;
            case Opcodes.S:
                return InstFormat.S;
            case Opcodes.B:
                return InstFormat.B;
            case Opcodes.ULUI:
                return InstFormat.ULUI;
            case Opcodes.UAUIPC:
                return InstFormat.UAUIPC;
            case Opcodes.UJAL:
                return InstFormat.UJAL;
            default:
                return "0000"; 
        }
    }


    getBranchOperation(funct3: string) {
        const funct3to2 = getBinaryRange(2, 1, funct3);
        switch (funct3to2) {
            case '00':
                return AluOperations.XOR;
            case '10':
                return AluOperations.SLT;
            case '11':
                return AluOperations.SLTU;
            default:
                return AluOperations.XOR;
        }
    }

    getAluOp(funct3: string, funct7: string, branchOp: string, shiftOp: number, addSubOp: number, format: string) {
        if (format === InstFormat.IARITH) {
            return (parseInt(getBinaryRange(5, 5, funct7)) && shiftOp) + funct3;
        } else {
            if (format === InstFormat.R) {
                return (parseInt(getBinaryRange(5, 5, funct7)) && (shiftOp || addSubOp)) + funct3;
            } else {
                if (format === InstFormat.B) {
                    return branchOp;
                } else {
                    return AluOperations.ADD;
                }
            }
        }
    }
}
