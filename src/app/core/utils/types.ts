export type Asm = {
    code: Code,
    memories: Memories
}

export type Code = {
    text: Text,
    data?: Array<Data>
}

export type Text = {
    source: Array<string[]>,
    machineCode?: Array<string>,
    basic: Array<any>,
    symbolTable?: Array<any>
}

export type Data = {
    directive: string,
    label: string,
    source: Array<any>,
    basic: Array<any>
}

export type Memories = {
    regFile: any,
    instMem: any,
    dataMem: any,
    memory?: any,
    pc: number
}

export type RegFile = {
    x0: number,
    x1: number,
    x2: number,
    x3: number,
    x4: number,
    x5: number,
    x6: number,
    x7: number,
    x8: number,
    x9: number,
    x10: number,
    x11: number,
    x12: number,
    x13: number,
    x14: number,
    x15: number,
    x16: number,
    x17: number,
    x18: number,
    x19: number,
    x20: number,
    x21: number,
    x22: number,
    x23: number,
    x24: number,
    x25: number,
    x26: number,
    x27: number,
    x28: number,
    x29: number,
    x30: number,
    x31: number
}