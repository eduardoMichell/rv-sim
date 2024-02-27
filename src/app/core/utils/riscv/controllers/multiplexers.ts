export function multiplexer2x1 (in1: any, in2: any, sel: any) {
    if (!sel){
      return in1;
    } else {
      return in2;
    }
  }
  