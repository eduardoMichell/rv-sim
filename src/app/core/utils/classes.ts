import { Instructions } from '../utils/constants';
export class Instruction {
  line: string[];
  inst: string;
  t1: string;
  t2: string;
  t3: string;
  info: any;
  constructor(instruction: string[]) {
    this.line = instruction;
    this.inst = instruction[0] ? instruction[0] : "";
    this.t1 = instruction[1] ? instruction[1] : "";
    this.t2 = instruction[2] ? instruction[2] : "";
    this.t3 = instruction[3] ? instruction[3] : "";
    this.info = this.getInstInfo(this.inst);
  }

  getInstInfo(instruction: string){
    return Instructions[instruction];
  }
}
