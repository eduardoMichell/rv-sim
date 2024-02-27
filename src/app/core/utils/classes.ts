import { Instructions } from '../utils/constants'

export class Instruction {
  line: any
  inst: any
  t1: any
  t2: any
  t3: any
  info: any
  constructor(inst: any) {
    this.line = inst;
    this.inst = inst[0] ? inst[0] : null;
    this.t1 = inst[1] ? inst[1] : null;
    this.t2 = inst[2] ? inst[2] : null;
    this.t3 = inst[3] ? inst[3] : null;
    this.info = this.getInstInfo(this.inst);
  }

  getInstInfo(inst: any){
    return Instructions[inst];
  }
}
