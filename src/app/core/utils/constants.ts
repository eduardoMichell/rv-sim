export enum ConstantsInit {
  PC = 4194304,
  DATA_MEM_INIT = 268500992,
  HEAP_MEM_INIT = 268697600,
  GP_MEM_INIT = 268468224,
  SP_MEM_INIT = 2147479520,
  INST_MEM_INIT = 4194304,
}

export const Bit32Limit = {
  lowerLimit: -2147483648,
  upperLimit: 2147483647
}
export const Directives: any = ['.ascii', '.word', '.string',]

export const Opcodes = {
  R: '0110011',
  IJALR: '1100111',
  ILOAD: '0000011',
  IARITH: '0010011',
  IFENCE: '0001111',
  ISYSCALL: '1110011',
  S: '0100011',
  B: '1100011',
  ULUI: '0110111',
  UAUIPC: '0010111',
  UJAL: '1101111'
}

export const InstFormat = {
  R: '0001',
  IJALR: '0010',
  ILOAD: '0011',
  IARITH: '0100',
  IFENCE: '0101',
  ISYSCALL: '0110',
  S: '0111',
  B: '1000',
  ULUI: '1001',
  UAUIPC: '1010',
  UJAL: '1011'
}

export const AluOperations = {
  ADD: '0000',
  SUB: '1000',
  SLL: '0001',
  SLT: '0010',
  SLTU: '0011',
  XOR: '0100',
  SRL: '0101',
  SRA: '1101',
  OR: '0110',
  AND: '0111'
}

export const DumpTypes: any = [
  {
    typeName: "binary",
    description: "Binary"
  },
  {
    typeName: "hexadecimal",
    description: "Hexadecimal"
  },
  {
    typeName: "text",
    description: "Text"
  }
]


export const RegFile: any = {
  get zero() { return this.x0 },
  get ra() { return this.x1 },
  get sp() { return this.x2 },
  get gp() { return this.x3 },
  get tp() { return this.x4 },
  get t0() { return this.x5 },
  get t1() { return this.x6 },
  get t2() { return this.x7 },
  get s0() { return this.x8 },
  get s1() { return this.x9 },
  get a0() { return this.x10 },
  get a1() { return this.x11 },
  get a2() { return this.x12 },
  get a3() { return this.x13 },
  get a4() { return this.x14 },
  get a5() { return this.x15 },
  get a6() { return this.x16 },
  get a7() { return this.x17 },
  get s2() { return this.x18 },
  get s3() { return this.x19 },
  get s4() { return this.x20 },
  get s5() { return this.x21 },
  get s6() { return this.x22 },
  get s7() { return this.x23 },
  get s8() { return this.x24 },
  get s9() { return this.x25 },
  get s10() { return this.x26 },
  get s11() { return this.x27 },
  get t3() { return this.x28 },
  get t4() { return this.x29 },
  get t5() { return this.x30 },
  get t6() { return this.x31 },
  x0: {
    value: 0,
    'description': 'The constant value 0'
  },
  x1: {
    'value': 1,
    'description': 'Return address'
  },
  x2: {
    'value': 2,
    'description': 'Stack pointer'
  },
  x3: {
    'value': 3,
    'description': 'Global pointer'
  },
  x4: {
    'value': 4,
    'description': 'Thread pointer'
  },
  x5: {
    'value': 5,
    'description': 'Temporary'
  },
  x6: {
    'value': 6,
    'description': 'Temporary'
  },
  x7: {
    'value': 7,
    'description': 'Temporary'
  },
  x8: {
    'value': 8,
    'description': 'aved register / Frame pointer'
  },
  x9: {
    'value': 9,
    'description': 'Save register'
  },
  x10: {
    'value': 10,
    'description': 'Function argument / Return Value'
  },
  x11: {
    'value': 11,
    'description': 'Function argument / Return Value'
  },
  x12: {
    'value': 12,
    'description': 'Function argument'
  },
  x13: {
    'value': 13,
    'description': 'Function argument'
  },
  x14: {
    'value': 14,
    'description': 'Function argument'
  },
  x15: {
    'value': 15,
    'description': 'Function argument'
  },
  x16: {
    'value': 16,
    'description': 'Function argument'
  },
  x17: {
    'value': 17,
    'description': 'The constant value 0'
  },
  x18: {
    'value': 18,
    'description': 'Saved register'
  },
  x19: {
    'value': 19,
    'description': 'aved register'
  },
  x20: {
    'value': 20,
    'description': 'Saved register'
  },
  x21: {
    'value': 21,
    'description': 'Saved register'
  },
  x22: {
    'value': 22,
    'description': 'Saved register'
  },
  x23: {
    'value': 23,
    'description': 'Saved register'
  },
  x24: {
    'value': 24,
    'description': 'aved register'
  },
  x25: {
    'value': 25,
    'description': 'Saved register'
  },
  x26: {
    'value': 26,
    'description': 'Saved register'
  },
  x27: {
    'value': 27,
    'description': 'Saved register'
  },
  x28: {
    'value': 28,
    'description': 'Temporary'
  },
  x29: {
    'value': 29,
    'description': 'Temporary'
  },
  x30: {
    'value': 30,
    'description': 'Temporary'
  },
  x31: {
    'value': 31,
    'description': 'Temporary'
  }
}

export const Instructions: any = {
  "lui": {
    "opcode": "0110111",
    "funct7": "0000000",
    "format": "U"
  },
  "auipc": {
    "opcode": "0010111",
    "funct7": "0000000",
    "format": "U"
  },
  "jal": {
    "opcode": "1101111",
    "funct7": "0000000",
    "format": "J"
  },
  "jalr":{
    "opcode": "1100111",
    "funct3": "000",
    "funct7": "0000000",
    "format": "I"
  },
  "beq":{
    "opcode": "1100011",
    "funct3": "000",
    "funct7": "0000000",
    "format": "B"
  },
  "bne":{
    "opcode": "1100011",
    "funct3": "001",
    "funct7": "0000000",
    "format": "B"
  },
  "blt":{
    "opcode": "1100011",
    "funct3": "100",
    "funct7": "0000000",
    "format": "B"
  },
  "bge":{
    "opcode": "1100011",
    "funct3": "101",
    "funct7": "0000000",
    "format": "B"
  },
  "bltu":{
    "opcode": "1100011",
    "funct3": "110",
    "funct7": "0000000",
    "format": "B"
  },
  "bgeu":{
    "opcode": "1100011",
    "funct3": "111",
    "funct7": "0000000",
    "format": "B"
  },
  "lb":{
    "opcode": "0000011",
    "funct3": "000",
    "funct7": "0000000",
    "format": "I"
  },
  "lh":{
    "opcode": "0000011",
    "funct3": "001",
    "funct7": "0000000",
    "format": "I"
  },
  "lw":{
    "opcode": "0000011",
    "funct3": "010",
    "funct7": "0000000",
    "format": "I"
  },
  "lbu":{
    "opcode": "0000011",
    "funct3": "100",
    "funct7": "0000000",
    "format": "I"
  },
  "lhu":{
    "opcode": "0000011",
    "funct3": "101",
    "funct7": "0000000",
    "format": "I"
  },
  "sb":{
    "opcode": "0100011",
    "funct3": "000",
    "funct7": "0000000",
    "format": "S"
  },
  "sh":{
    "opcode": "0100011",
    "funct3": "001",
    "funct7": "0000000",
    "format": "S"
  },
  "sw":{
    "opcode": "0100011",
    "funct3": "010",
    "funct7": "0000000",
    "format": "S"
  },
  "addi":{
    "opcode": "0010011",
    "funct3": "000",
    "funct7": "0000000",
    "format": "I"
  },
  "slti":{
    "opcode": "0010011",
    "funct3": "010",
    "funct7": "0000000",
    "format": "I"
  },
  "sltiu":{
    "opcode": "0010011",
    "funct3": "011",
    "funct7": "0000000",
    "format": "I"
  },
  "xori":{
    "opcode": "0010011",
    "funct3": "100",
    "funct7": "0000000",
    "format": "I"
  },
  "ori":{
    "opcode": "0010011",
    "funct3": "110",
    "funct7": "0000000",
    "format": "I"
  },
  "andi":{
    "opcode": "0010011",
    "funct3": "111",
    "funct7": "0000000",
    "format": "I"
  },
  "slli":{
    "opcode": "0010011",
    "funct3": "001",
    "funct7": "0000000",
    "format": "I"
  },
  "srli":{
    "opcode": "0010011",
    "funct3": "101",
    "funct7": "0000000",
    "format": "I"
  },
  "srai":{
    "opcode": "0010011",
    "funct3": "101",
    "funct7": "0100000",
    "format": "I"
  },
  "add":{
    "opcode": "0110011",
    "funct3": "000",
    "funct7": "0000000",
    "format": "R"
  },
  "sub":{
    "opcode": "0110011",
    "funct3": "000",
    "funct7": "0100000",
    "format": "R"
  },
  "sll":{
    "opcode": "0110011",
    "funct3": "001",
    "funct7": "0000000",
    "format": "R"
  },
  "slt":{
    "opcode": "0110011",
    "funct3": "010",
    "funct7": "0000000",
    "format": "R"
  },
  "sltu":{
    "opcode": "0110011",
    "funct3": "011",
    "funct7": "0000000",
    "format": "R"
  },
  "xor":{
    "opcode": "0110011",
    "funct3": "100",
    "funct7": "0000000",
    "format": "R"
  },
  "srl":{
    "opcode": "0110011",
    "funct3": "101",
    "funct7": "0000000",
    "format": "R"
  },
  "sra":{
    "opcode": "0110011",
    "funct3": "101",
    "funct7": "0100000",
    "format": "R"
  },
  "or":{
    "opcode": "0110011",
    "funct3": "110",
    "funct7": "0000000",
    "format": "R"
  },
  "and":{
    "opcode": "0110011",
    "funct3": "111",
    "funct7": "0000000",
    "format": "R"
  },
  "fence":{
    "opcode": "0001111",
    "funct3": "000",
    "funct7": "0000000",
    "format": "I"
  },
  "fence.i":{
    "opcode": "0001111",
    "funct3": "001",
    "funct7": "0000000",
    "format": "I"
  },
  "ecall":{
    "opcode": "1110011",
    "funct3": "000",
    "funct7": "0000000",
    "format": "I"
  },
  "ebreak":{
    "opcode": "1110011",
    "funct3": "000",
    "funct7": "0000000",
    "format": "I"
  },
  "csrrw":{
    "opcode": "1110011",
    "funct3": "001",
    "funct7": "0000000",
    "format": "I"
  },
  "csrrs":{
    "opcode": "1110011",
    "funct3": "010",
    "funct7": "0000000",
    "format": "I"
  },
  "csrrc":{
    "opcode": "1110011",
    "funct3": "011",
    "funct7": "0000000",
    "format": "I"
  },
  "csrrwi":{
    "opcode": "1110011",
    "funct3": "101",
    "funct7": "0000000",
    "format": "I"
  },
  "csrrsi":{
    "opcode": "1110011",
    "funct3": "110",
    "funct7": "0000000",
    "format": "I"
  },
  "csrrci":{
    "opcode": "1110011",
    "funct3": "111",
    "funct7": "0000000",
    "format": "I"
  }
}
