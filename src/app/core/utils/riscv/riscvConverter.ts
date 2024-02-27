import { Instruction } from '../classes';
import { RegFile } from '../constants';
import  { shiftLeft, decimalToBinary, getBinaryRange } from '../riscv-utils';

export class RiscvConverter {
    text: any
    data: any
  constructor(code: any) {
    const { text, data } = code
    this.text= {
      machineCode: this.convertTextToMachineCode(text.basic),
      source: text.source,
      basic: text.basic
    }
    this.data = data
  }

  convertTextToMachineCode(text: any) {
    const machineCode = [];
    const instructions = this.generateInstructions(text);
    for (const inst of instructions) {
      machineCode.push(this.getMachineCode(inst));
    }
    return machineCode;
  }

  getMachineCode(inst: any) {
    switch (this.getFormat(inst)) {
    case 'R':
      return this.getRFormatInst(inst);
    case 'I':
      return this.#getIFormatInst(inst);
    case 'S':
      return this.getSFormatInst(inst);
    case 'B':
      return this.getBFormatInst(inst);
    case 'U':
      return this.getUFormatInst(inst);
    case 'J':
      return this.getJFormatInst(inst);
    }
    return this.others('0',32);
  }

  getRFormatInst(inst: any) {
    /**
     * add, sub, sll, slt, sltu, xor, srl, sra, or e and
     */
    const rd = this.others(decimalToBinary(this.getRd(inst)), 5);
    const rs1 = this.others(decimalToBinary(this.getRs1(inst)), 5);
    const rs2 = this.others(decimalToBinary(this.getRs2(inst)), 5);
    const opcode = this.getOpcode(inst);
    const funct3 = this.getFunct3(inst);
    const funct7 = this.getFunct7(inst);
    const result = funct7 + rs2 + rs1 + funct3 + rd + opcode;
    return this.others(result, 32);
  }

  #getIFormatInst(inst: any) {
    /**
     *  jalr, lb, lh, lw, lbu, lhu, addi, slti, sltiu, xori, ori, andi, slli, srli, srai, fence, fence.i, ecall
     *  ebreak, csrrw, csrrs, csrrc, csrrwi, csrrsi, csrrci
     */
    let rd = '';
    let rs1 = '';
    let imm = '';
    const opcode = this.getOpcode(inst);
    const funct3 = this.getFunct3(inst);

    const dif = ['fence', 'fence.i', 'ecall', 'ebreak'];
    const difLoad = ['lb', 'lh', 'lw', 'lbu', 'lhu'];
    const difShamt = ['slli', 'srli', 'srai'];
    const diffCs = ['csrrw', 'csrrs', 'csrrc', 'csrrwi', 'csrrsi', 'csrrci'];

    if (dif.includes(this.getInst(inst))){
      const zeros = '00000';
      rd = zeros;
      rs1 = zeros;
      //TODO: Implementation of these
      return this.others('0',32) //Temp
    }

    if (diffCs.includes(inst.inst)) {
      //TODO: Implementation of these
      return this.others('0',32) //Temp
    }

    if (difLoad.includes(this.getInst(inst))) {
      rd = this.others(decimalToBinary(this.getRd(inst)), 5);
      const { rs1Identifier, immIdentifier } = this.getLoadImm(inst.t2);
      rs1 = this.others(decimalToBinary(this.getRegNumber(rs1Identifier)), 5);
      imm = this.others(decimalToBinary(immIdentifier), 12);
      return this.others((imm + rs1 + funct3 + rd + opcode), 32);
    }

    if (difShamt.includes(this.getInst(inst))) {
      rd = this.others(decimalToBinary(this.getRd(inst)), 5);
      rs1 = this.others(decimalToBinary(this.getRs1(inst)), 5);
      const funct7 = this.getFunct7(inst);
      const shamt = this.others(decimalToBinary(inst.t3), 5);
      return this.others((funct7 + shamt + rs1 + funct3 + rd + opcode), 32);
    }

    rd = this.others(decimalToBinary(this.getRd(inst)), 5);
    rs1 = this.others(decimalToBinary(this.getRs1(inst)), 5);
    imm = this.others(decimalToBinary(inst.t3), 12);
    return this.others((getBinaryRange(11,0,imm) + rs1 + funct3 + rd + opcode), 32);

  }

  getSFormatInst(inst: any) {
    /**
     * sb, sh, sw
     */
    const opcode = this.getOpcode(inst);
    const funct3 = this.getFunct3(inst);
    const { rs1Identifier, immIdentifier } = this.getStoreImm(inst.t2);
    const rs2 = this.others(decimalToBinary(this.getRegNumber(inst.t1)), 5);
    const rs1 = this.others(decimalToBinary(this.getRegNumber(rs1Identifier)), 5);
    const immBinary = decimalToBinary(immIdentifier);
    const imm = this.others(immBinary, 12);
    const imm11a05 = getBinaryRange(11,5, imm);
    const imm04a0 = getBinaryRange(4,0, imm);
    const result = (imm11a05 + rs2 + rs1 + funct3 + imm04a0 + opcode);
    return this.others(result, 32);
  }

  getBFormatInst(inst: any) {
    /**
     * beq, bne, blt, bge, bltu, bgeu
     */
    const opcode = this.getOpcode(inst);
    const funct3 = this.getFunct3(inst);
    const rs1 = this.others(decimalToBinary(this.getRegNumber(inst.t1)), 5);
    const rs2 = this.others(decimalToBinary(this.getRegNumber(inst.t2)), 5);
    const imm = this.others(decimalToBinary(inst.t3),13);
    const twelve= getBinaryRange(12,12,imm);
    const twelveAnd10to5 = twelve + getBinaryRange(10,5,imm);
    const eleven = getBinaryRange(11,11,imm);
    const fourTo1And11 = getBinaryRange(4, 1, imm) + eleven;
    const result = (twelveAnd10to5 + rs2 + rs1 + funct3 + fourTo1And11 + opcode);
    return this.others(result, 32);
  }

  getUFormatInst(inst: any) {
    /**
     * lui, auipc
     */
    const opcode = this.getOpcode(inst);
    const rd = this.others(decimalToBinary(this.getRd(inst)), 5);
    const immToShift = inst.t2;
    const immShifted = shiftLeft(parseInt(immToShift),12);
    const immIdentifier = decimalToBinary(immShifted);
    const imm = this.others(immIdentifier, 32);
    const thirtyOneToTwelve = getBinaryRange(31,12,imm);
    const result = (thirtyOneToTwelve + rd + opcode);
    return this.others(result, 32);
  }

  getJFormatInst(inst: any) {
    /**
     * jal
     */
    const opcode = this.getOpcode(inst);
    const imm = this.others(decimalToBinary(inst.t2),21);
    const rd = this.others(decimalToBinary(this.getRd(inst)), 5);
    const twenty = getBinaryRange(20,20,imm);
    const eleven = getBinaryRange(11,11,imm);
    const nineteenToTwelve = getBinaryRange(19,12,imm);
    const tenTo1= getBinaryRange(10,1, imm);
    const result = (twenty + tenTo1 + eleven + nineteenToTwelve + rd + opcode);
    return this.others(result, 32);
  }

  generateInstructions(text: any) {
    const instructions = [];
    for (const line of text) {
      instructions.push(new Instruction(line));
    }
    return instructions;
  }

  getLoadImm(t2: any) {
    const breaker = t2.split('(');
    const rs1Identifier = breaker[1].slice(0, breaker[1].length - 1);
    const immIdentifier = breaker[0];
    return { rs1Identifier, immIdentifier }
  }

  getStoreImm(t3: any) {
    const breaker = t3.split('(');
    const rs1Identifier = breaker[1].slice(0, breaker[1].length - 1);
    const immIdentifier = breaker[0];
    return { rs1Identifier, immIdentifier };
  }

  getFunct7(inst: any) {
    return inst.info.funct7;
  }

  getFormat(inst: any) {
    return inst.info.format;
  }

  getRegNumber(reg: any) {
    return RegFile[reg].value;
  }

  getRd(inst: any) {
    return this.getRegNumber(inst.t1);
  }

  getRs1(inst: any) {
    return this.getRegNumber(inst.t2);
  }

  getRs2(inst: any) {
    return this.getRegNumber(inst.t3);
  }

  getFunct3(inst: any) {
    return inst.info.funct3;
  }

  getOpcode(inst: any) {
    return inst.info.opcode;
  }

  getInst(inst: any) {
    return inst.inst;
  }

  others = (inst: any, quantity: any, number = '0') => {
    const increment = quantity - inst.length;
    for (let i = 0; i < increment; i++) {
      inst = number + inst;
    }
    return inst;
  }


}

