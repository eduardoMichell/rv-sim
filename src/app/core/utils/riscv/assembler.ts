import { Instruction } from '../classes';
import { RegFile } from '../constants';
import { shiftLeft, decimalToBinary, getBinaryRange, resize } from '../riscv-utils';
import { Text, Data, Code } from '../types'

export class Assembler {
  text: Text;
  data: Data[];
  constructor(code: Code) {
    const { text, data } = code;
    this.text = {
      machineCode: this.convertTextToMachineCode(text.basic),
      source: text.source,
      basic: text.basic
    }
    this.data = data || [];
  }

  convertTextToMachineCode(text: Array<string[]>) {
    const machineCode: string[] = [];
    const instructions = this.generateInstructions(text);
    for (const inst of instructions) {
      machineCode.push(this.getMachineCode(inst));
    }
    return machineCode;
  }

  getMachineCode(instruction: Instruction) {
    switch (this.getFormat(instruction)) {
      case 'R':
        return this.getRFormatInst(instruction);
      case 'I':
        return this.getIFormatInst(instruction);
      case 'S':
        return this.getSFormatInst(instruction);
      case 'B':
        return this.getBFormatInst(instruction);
      case 'U':
        return this.getUFormatInst(instruction);
      case 'J':
        return this.getJFormatInst(instruction);
    }
    return resize('0', 32);
  }

  getRFormatInst(instruction: Instruction) {
    /**
     * add, sub, sll, slt, sltu, xor, srl, sra, or e and
     */
    const rd = resize(decimalToBinary(this.getRd(instruction)), 5);
    const rs1 = resize(decimalToBinary(this.getRs1(instruction)), 5);
    const rs2 = resize(decimalToBinary(this.getRs2(instruction)), 5);
    const opcode = this.getOpcode(instruction);
    const funct3 = this.getFunct3(instruction);
    const funct7 = this.getFunct7(instruction);
    const result = funct7 + rs2 + rs1 + funct3 + rd + opcode;
    return resize(result, 32);
  }

  getIFormatInst(instruction: Instruction) {
    /**
     *  jalr, lb, lh, lw, lbu, lhu, addi, slti, sltiu, xori, ori, andi, slli, srli, srai, fence, fence.i, ecall
     *  ebreak, csrrw, csrrs, csrrc, csrrwi, csrrsi, csrrci
     */
    let rd = '';
    let rs1 = '';
    let imm = '';
    const opcode = this.getOpcode(instruction);
    const funct3 = this.getFunct3(instruction);

    const dif = ['fence', 'fence.i', 'ecall', 'ebreak'];
    const difLoad = ['lb', 'lh', 'lw', 'lbu', 'lhu'];
    const difShamt = ['slli', 'srli', 'srai'];
    const diffCs = ['csrrw', 'csrrs', 'csrrc', 'csrrwi', 'csrrsi', 'csrrci'];

    if (dif.includes(this.getInst(instruction))) {
      const zeros = '00000';
      rd = zeros;
      rs1 = zeros;
      //TODO: Implementation of these
      return resize('0', 32)
    }

    if (diffCs.includes(instruction.inst)) {
      //TODO: Implementation of these
      return resize('0', 32)
    }

    if (difLoad.includes(this.getInst(instruction))) {
      rd = resize(decimalToBinary(this.getRd(instruction)), 5);
      const { rs1Identifier, immIdentifier } = this.getLoadImm(instruction.t2);
      rs1 = resize(decimalToBinary(this.getRegNumber(rs1Identifier)), 5);
      imm = resize(decimalToBinary(immIdentifier), 12);
      return resize((imm + rs1 + funct3 + rd + opcode), 32);
    }

    if (difShamt.includes(this.getInst(instruction))) {
      rd = resize(decimalToBinary(this.getRd(instruction)), 5);
      rs1 = resize(decimalToBinary(this.getRs1(instruction)), 5);
      const funct7 = this.getFunct7(instruction);
      const shamt = resize(decimalToBinary(instruction.t3), 5);
      return resize((funct7 + shamt + rs1 + funct3 + rd + opcode), 32);
    }

    rd = resize(decimalToBinary(this.getRd(instruction)), 5);
    rs1 = resize(decimalToBinary(this.getRs1(instruction)), 5);
    imm = resize(decimalToBinary(instruction.t3), 12);
    return resize((getBinaryRange(11, 0, imm) + rs1 + funct3 + rd + opcode), 32);

  }

  getSFormatInst(instruction: Instruction) {
    /**
     * sb, sh, sw
     */
    const opcode = this.getOpcode(instruction);
    const funct3 = this.getFunct3(instruction);
    const { rs1Identifier, immIdentifier } = this.getStoreImm(instruction.t2);
    const rs2 = resize(decimalToBinary(this.getRegNumber(instruction.t1)), 5);
    const rs1 = resize(decimalToBinary(this.getRegNumber(rs1Identifier)), 5);
    const immBinary = decimalToBinary(immIdentifier);
    const imm = resize(immBinary, 12);
    const imm11a05 = getBinaryRange(11, 5, imm);
    const imm04a0 = getBinaryRange(4, 0, imm);
    const result = (imm11a05 + rs2 + rs1 + funct3 + imm04a0 + opcode);
    return resize(result, 32);
  }

  getBFormatInst(instruction: Instruction) {
    /**
     * beq, bne, blt, bge, bltu, bgeu
     */
    const opcode = this.getOpcode(instruction);
    const funct3 = this.getFunct3(instruction);
    const rs1 = resize(decimalToBinary(this.getRegNumber(instruction.t1)), 5);
    const rs2 = resize(decimalToBinary(this.getRegNumber(instruction.t2)), 5);
    const imm = resize(decimalToBinary(instruction.t3), 13);
    const twelve = getBinaryRange(12, 12, imm);
    const twelveAnd10to5 = twelve + getBinaryRange(10, 5, imm);
    const eleven = getBinaryRange(11, 11, imm);
    const fourTo1And11 = getBinaryRange(4, 1, imm) + eleven;
    const result = (twelveAnd10to5 + rs2 + rs1 + funct3 + fourTo1And11 + opcode);
    return resize(result, 32);
  }

  getUFormatInst(instruction: Instruction) {
    /**
     * lui, auipc
     */
    const opcode = this.getOpcode(instruction);
    const rd = resize(decimalToBinary(this.getRd(instruction)), 5);
    const immToShift = instruction.t2;
    const immShifted = shiftLeft(parseInt(immToShift), 12);
    const immIdentifier = decimalToBinary(immShifted);
    const imm = resize(immIdentifier, 32);
    const thirtyOneToTwelve = getBinaryRange(31, 12, imm);
    const result = (thirtyOneToTwelve + rd + opcode);
    return resize(result, 32);
  }

  getJFormatInst(instruction: Instruction) {
    /**
     * jal
     */
    const opcode = this.getOpcode(instruction);
    const imm = resize(decimalToBinary(instruction.t2), 21);
    const rd = resize(decimalToBinary(this.getRd(instruction)), 5);
    const twenty = getBinaryRange(20, 20, imm);
    const eleven = getBinaryRange(11, 11, imm);
    const nineteenToTwelve = getBinaryRange(19, 12, imm);
    const tenTo1 = getBinaryRange(10, 1, imm);
    const result = (twenty + tenTo1 + eleven + nineteenToTwelve + rd + opcode);
    return resize(result, 32);
  }

  generateInstructions(text: Array<any>) {
    const instructions = [];
    for (const line of text) {
      instructions.push(new Instruction(line.inst));
    }
    return instructions;
  }

  getLoadImm(t2: string) {
    const breaker = t2.split('(');
    const rs1Identifier = breaker[1].slice(0, breaker[1].length - 1);
    const immIdentifier = breaker[0];
    return { rs1Identifier, immIdentifier }
  }

  getStoreImm(t3: string) {
    const breaker = t3.split('(');
    const rs1Identifier = breaker[1].slice(0, breaker[1].length - 1);
    const immIdentifier = breaker[0];
    return { rs1Identifier, immIdentifier };
  }

  getFunct7(intruction: Instruction) {
    return intruction.info.funct7;
  }

  getFormat(instruction: Instruction) {
    return instruction.info.format;
  }

  getRegNumber(reg: string) {
    return RegFile[reg].value;
  }

  getRd(instruction: Instruction) {
    return this.getRegNumber(instruction.t1);
  }

  getRs1(instruction: Instruction) {
    return this.getRegNumber(instruction.t2);
  }

  getRs2(instruction: Instruction) {
    return this.getRegNumber(instruction.t3);
  }

  getFunct3(instruction: Instruction) {
    return instruction.info.funct3;
  }

  getOpcode(instruction: Instruction) {
    return instruction.info.opcode;
  }

  getInst(instrcution: Instruction) {
    return instrcution.inst;
  }
}

