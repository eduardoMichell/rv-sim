export function add(in1: any, in2: any) {
    return in1 + in2;
}

export function aluDataSelector(
    auipc: any,
    jump: any,
    jalr: any,
    aluSrcImm: any,
    pc: any,
    instImm: any,
    rgData1: any,
    rgData2: any
) {
    let aluInput1 = 0;
    let aluInput2 = 0;

    if (auipc || (jump && !jalr)) {
        aluInput1 = pc;
    } else {
        aluInput1 = rgData1;
    }
    if (aluSrcImm) {
        aluInput2 = instImm;
    } else {
        aluInput2 = rgData2;
    }


    return { aluInput1, aluInput2 };
}

export function memDataSelector(
    memRead: any,
    loadUpImm: any,
    jump: any,
    dataMemData: any,
    instImm: any,
    pcPlusFour: any,
    aluResult: any
) {
    let result;
    switch (true) {
        case memRead:
            result = dataMemData;
            break;
        case loadUpImm:
            result = instImm;
            break;
        case jump:
            result = pcPlusFour;
            break;
        default:
            result = aluResult;
            break;
    }
    return result;
}