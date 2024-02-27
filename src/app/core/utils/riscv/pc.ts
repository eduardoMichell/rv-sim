export class PC {
    pc: any
    constructor(pc: any) {
      this.pc = pc;
    }
    setPc(newPc: any){
      this.pc = newPc;
    }
  
    getPc(){
      return this.pc;
    }
  
    plusFour(){
      return this.pc + 4;
    }
  }
  