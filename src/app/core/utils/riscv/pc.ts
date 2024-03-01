export class PC {
  pc: number
  constructor(pc: number) {
    this.pc = pc;
  }
  setPc(newPc: number) {
    this.pc = newPc;
  }

  getPc() {
    return this.pc;
  }

  plusFour() {
    return this.pc + 4;
  }
}
