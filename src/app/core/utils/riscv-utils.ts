import { Code, Text, Data, Asm } from './types';
import { createText, createData } from './string-builder-utils';
import { RegFile, Directives, Bit32Limit } from './constants';

export function assembly(code: Asm) {
    if (code.code.data) {
        const resData = verifyData(code.code.data);
        if (resData.error) {
            return resData;
        }

    }
    // TODO: verificar se algum elemento é alguma diretiva e dizer q nao pode aparecer
    // ".ascii" directive cannot appear in text segment
    const resText = verifyText(code.code.text);
    if (resText.error) {
        return resText;
    }

    return {
        error: false,
        message: ''
    }
}

export function convertWrittenCode(code: string): Code {
    const data: Array<Data> = createData(code);
    const text: Text = createText(code);
    return {
        text,
        data
    }
}

export function shiftLeft(decimal: number, base: number) {
    return decimal << base;
}

export function decimalToBinary(decimal: any) {
    const isNegative = decimal < 0;
    return isNegative ? (decimal >>> 0).toString(2) : parseInt(decimal).toString(2);
}

export function hexadecimalToBinary(hex: string) {
    return (parseInt(hex, 16).toString(2)).padStart(8, '0');
}

export function getBinaryRange(left: number, right: number, imm: string) {
    const reversedBinaryString = imm.split('').reverse().join('');
    const result = reversedBinaryString.substring(right, left + 1);
    return result.split('').reverse().join('');
}

export function binaryToHexadecimal(binary: string) {
    return parseInt(binary, 2).toString(16).toUpperCase();
}

export function binaryToDecimal(binary: string) {
    return parseInt(binary, 2);
}

export function binaryToDecimalSigned(binary: string) {
    const negative = binary[0] === '1';
    if (negative) {
        let inverse = '';
        for (let i = 1; i < binary.length; i++) {
            inverse += binary[i] === '0' ? '1' : '0';
        }
        return (parseInt(inverse, 2) + 1) * -1;
    } else {
        return parseInt(binary, 2);
    }
}

export function convertArrayBinaryToHexadecimal(code: any) {
    const hex = [];
    for (const binary of code) {
        hex.push(hesizeHex(binaryToHexadecimal(binary), 10));
    }
    return hex.toString().replace(/,/g, '\n');
}

export function convertConfigToText(code: any, pc: number) {
    const data: any = {
        address: [],
        code: [],
        basic: [],
        source: []
    }
    let pcCount = pc;
    for (let i = 0; i < code.text.machineCode.length; i++) {
        data.address.push(decimalToHex(pcCount));
        data.code.push(hesizeHex(binaryToHexadecimal(code.text.machineCode[i]), 10));
        data.basic.push(code.text.basic[i]);
        data.source.push(code.text.source[i]);
        pcCount += 4;
    }
    let text = 'Address        Code              Basic                   Line  Source\n';
    for (let i = 0; i < data.address.length; i++) {
      text += `${data.address[i]}     ${data.code[i]}        ${data.basic[i]}${" ".repeat(24 - data.basic[i].toString().length)}${i+1}     ${data.source[i]}\n`;
    }
    return text;
}

export function decimalToHex(decimal: number): string {
    return hesizeHex(decimal.toString(16), 10);
}

export function hesizeHex(instructions: string, quantity: number, number = '0') {
    const increment = quantity - instructions.length;
    for (let i = 0; i < increment; i++) {
        instructions = (i === increment - 2 ? 'x' : number) + instructions;
    }
    return instructions;
}

export function resize(instruction: string, quantity: number, number = '0') {
    const increment = quantity - instruction.length;
    for (let i = 0; i < increment; i++) {
        instruction = number + instruction;
    }
    return instruction;
}

export function resizeSigned(instruction: string, quantity: number) {
    const number = instruction[0] === '1' ? '1' : '0';
    const increment = quantity - instruction.length;
    for (let i = 0; i < increment; i++) {
        instruction = number + instruction;
    }
    return instruction;
}

export function toUnsigned32(num: number) {
    return num >>> 0;
}

export function getOpcode(instruction: string) {
    return getBinaryRange(6, 0, instruction);
}

export function getFunct3(instruction: string) {
    return getBinaryRange(14, 12, instruction);

}

export function getFunct7(instruction: string) {
    return getBinaryRange(31, 25, instruction);

}

function checkInstructions(line: string[], symbolTable: Array<any>) {
    const instruction = line[0] ? line[0] : '';
    switch (instruction) {
        case 'add':
        case 'sub':
        case 'sll':
        case 'slt':
        case 'sltu':
        case 'xor':
        case 'srl':
        case 'sra':
        case 'or':
        case 'and':
            return checkRFormatInst(line);
        case 'lb':
        case 'lh':
        case 'lw':
        case 'lbu':
        case 'lhu':
        case 'sb':
        case 'sh':
        case 'sw':
            return checkMemFormatInst(line);
        case 'addi':
        case 'jalr':
        case 'slti':
        case 'sltiu':
        case 'xori':
        case 'ori':
        case 'andi':
        case 'slli':
        case 'srli':
        case 'srai':
            // case 'fence':
            // case 'fence.i':
            // case 'ecall':
            // case 'ebreak':
            // case 'csrrw':
            // case 'csrrs':
            // case 'csrrc':
            // case 'csrrwi':
            // case 'csrrsi':
            // case 'csrrci': 
            return checkIFormatInst(line);
        case 'beq':
        case 'bne':
        case 'blt':
        case 'bge':
        case 'bltu':
        case 'bgeu':
            return checkBFormatInst(line, symbolTable);
        case 'lui':
        case 'auipc':
            return checkUFormatInst(line);
        case 'jal':
            return checkJFormatInst(line);
        default:
            return {
                error: true,
                message: `"${instruction}" is not a recognized operator`,
            }

    }
}

function verifyText(text: Text) {
    for (const line of text.source) {
        const res = checkInstructions(line, text.symbolTable ? text.symbolTable : []);
        if (res.error) {
            return res
        }

    }
    return {
        error: false,
        message: ''
    }
}

function verifyData(data: Data[]) {
    const duplicated = checkDuplicateLabel(data);
    if (duplicated.error) {
        return duplicated;
    }
    for (const line of data) {
        const res = checkDataElement(line);
        if (res.error) {
            return res;
        }
    }
    return {
        error: false,
        message: ''
    }
}

function checkDataElement(element: Data) {
    if (!element.label.includes(":")) {
        return {
            error: true,
            message: `"${element.label}" is not a valid label`
        }
    }

    if (/[^a-zA-Z0-9:]/.test(element.label)) {
        return {
            error: true,
            message: `"${element.label}" cannot have special characters`
        }
    }
    console.log(element.directive)
    switch (element.directive) {
        case ".ascii":
        case ".string":
            return checkDataAscii(element);
        case ".word":
            return checkDataWord(element);
        default:
            const message = element.directive.length > 0 ? `"${element.directive}" is not a valid directive` :
                `Non-existent directive`
            return {
                error: true,
                message
            }
    }
}

function checkDuplicateLabel(data: Data[]) {
    const duplicated = data.find((item, index) => data.findIndex(el => el.label === item.label) !== index);
    if (duplicated) {
        const label = duplicated?.label.slice(0, duplicated?.label.length - 1);
        return { error: true, message: `label "${label}" already defined` };
    } else {
        return { error: false, message: "" };
    }
}

function checkDataAscii(line: Data) {
    if (haveString(line.basic)) {
        if (checkIfHaveDifferentDirectives(line.basic, ['.ascii', '.string'])) {
            return {
                error: true,
                message: 'It is not possible to define more than one directive in a label'
            }
        }
        const elementWithoutDirectives = removeDirectives(line.basic);
        const elementNoString = firstElementNoString(elementWithoutDirectives);
        if (elementNoString.error) {
            return elementNoString;
        }
        const basicWithoutQuote = elementWithoutDirectives.map(element => element.replace(/"/g, '')).filter(Boolean);
        line.basic = convertStringToNumberArray(basicWithoutQuote.join(' ').replace(/\.string/g, '.ascii'));
    } else {
        if (line.basic.length > 0) {
            return {
                error: true,
                message: `The element does not have a valid character string`
            }
        }
    }
    return {
        error: false,
        message: ''
    }
}

function checkDataWord(line: Data) {
    if (!haveString(line.basic)) {
        if (checkIfHaveDifferentDirectives(line.basic, ['.word'])) {
            return {
                error: true,
                message: 'It is not possible to define more than one directive in a label'
            }
        }

        const elementWithoutDirectives = removeDirectives(line.basic);
        const areAllIntegersRes = areAllIntegers(elementWithoutDirectives);
        if (areAllIntegersRes.error) {
            return areAllIntegersRes
        }
        line.basic = restrictNumber(elementWithoutDirectives);
    } else {
        if (line.basic.length > 0) {
            return {
                error: true,
                message: `This directive only accepts numbers`
            }
        }
    }
    return {
        error: false,
        message: ''
    }
}

function areAllIntegers(array: string[]) {
    for (let i = 0; i < array.length; i++) {
        if (!/^-?\d+$/.test(array[i])) {
            return { error: true, message: `"${array[i]}" is not a valid integer number` };
        }
    }
    return { error: false, message: "" };
}

function restrictNumber(numbers: string[]) {
    const lowerLimit = Bit32Limit.lowerLimit;
    const upperLimit = Bit32Limit.upperLimit;
    const newBasic = [];
    for (const number of numbers) {
        const range = upperLimit - lowerLimit + 1;
        if (Number.parseInt(number) > upperLimit) {
            newBasic.push(lowerLimit + (Number.parseInt(number) - upperLimit - 1) % range);
            continue;
        }
        if (Number.parseInt(number) < lowerLimit) {
            newBasic.push(upperLimit - (lowerLimit - Number.parseInt(number) - 1) % range);
            continue;
        }
        newBasic.push(Number.parseInt(number));
    }

    return newBasic;
}

function checkIfHaveDifferentDirectives(array: string[], directivesToIgnore: string[]) {
    const ignoreSet = new Set(directivesToIgnore);
    const directivesAux = Directives.filter((element: string) => !ignoreSet.has(element));
    for (const element of array) {
        for (const directive of directivesAux) {
            if (element.includes(directive)) {
                return true;
            }
        }
    }
    return false;
}

function removeDirectives(array: string[]) {
    const newData = [];
    for (let element of array) {
        const regex = new RegExp(Directives.join('|'), 'g');
        const aux = element.replace(regex, '');
        if (aux.length > 0) {
            newData.push(aux);
        }
    }
    return newData;
}

function firstElementNoString(array: string[]): any {
    let incompleteString = '';
    for (let i = 0; i < array.length; i++) {
        const string = array[i];
        if (!string.startsWith('"') || !string.endsWith('"')) {
            incompleteString += string + ' ';
            if (i === array.length - 1) {
                return {
                    error: true,
                    message: `"${incompleteString.trim()}" is not a valid string`
                };
            }
        } else if (incompleteString !== '') {
            console.log(array[i])
            return {
                error: true,
                message: `"${incompleteString.trim()}" is not a valid string`
            };
        }
    }
    return {
        error: false,
        message: ""
    };
}

function convertStringToNumberArray(string: string): number[] {
    const stringArrayNumber: number[] = [];
    const words = [];
    let cont = 0;
    while (cont < string.length) {
        words.push(string.substr(cont, 4));
        cont += 4;
    }
    for (let word of words) {
        let hexString = '0x';
        for (let i = word.length - 1; i >= 0; i--) {
            const charCode = word.charCodeAt(i).toString(16);
            hexString += charCode.padStart(2, '0');
        }
        stringArrayNumber.push(parseInt(hexString.substring(2), 16));
    }
    return stringArrayNumber;
}

function haveString(line: string[]): boolean {
    for (const element of line) {
        if (element.includes('"')) {
            return true;
        }
    }
    return false;
}

function checkRFormatInst(line: string[]) {
    const instruction = line[0] ? line[0] : '';
    const t1 = line[1] ? line[1] : '';
    const t2 = line[2] ? line[2] : '';
    const t3 = line[3] ? line[3] : '';

    if (t1 === '' || t2 === '' || t3 === '' || line[4]) {
        return {
            error: true,
            message: `"${instruction}" Too few or incorrectly formatted operands. Expected: ${instruction} t1,t2,t3`
        }
    }

    if (!RegFile[t1]) {
        return {
            error: true,
            message: `"${t1}" operand is of incorrect type`
        }
    }
    if (!RegFile[t2]) {
        return {
            error: true,
            message: `"${t2}" operand is of incorrect type`
        }
    }
    if (!RegFile[t3]) {
        return {
            error: true,
            message: `"${t3}" operand is of incorrect type`
        }
    }
    return {
        error: false,
        message: ''
    }
}

function checkIFormatInst(line: string[]) {
    const t1 = line[1] ? line[1] : '';
    const t2 = line[2] ? line[2] : '';
    const immediate = line[3] ? line[3] : '';

    const instruction = line[0] ? line[0] : '';

    if (t1 === '' || t2 === '' || immediate === '' || line[4]) {
        return {
            error: true,
            message: `"${instruction}" Too few or incorrectly formatted operands. Expected: ${instruction} t1,t2,-100`
        }
    }

    if (!RegFile[t1]) {
        return {
            error: true,
            message: `"${t1}" operand is of incorrect type`
        }
    }

    if (!RegFile[t2]) {
        return {
            error: true,
            message: `"${t2}" operand is of incorrect type`
        }
    }

    if (!isValidImmediateIFormat(immediate)) {
        return {
            error: true,
            message: `"${immediate}" operand is out of range or is not a valid number`
        }
    }

    return {
        error: false,
        message: ''
    }
}

function checkMemFormatInst(line: string[]) {
    const t1 = line[1] ? line[1] : '';
    const instruction = line[0];

    if (!RegFile[t1]) {
        return {
            error: true,
            message: `"${t1}" operand is of incorrect type`
        }
    }
    const mem = line[2] ? line[2] : '';

    if (!checkInstructionFormatWithParentheses(mem) || t1 === '' || line[2]) {
        return {
            error: true,
            message: `"${instruction}" Too few or incorrectly formatted operands. Expected: ${instruction} t1, -100(t2)`
        }
    }

    const { imm, reg } = extractInstructionMemoryPosition(mem);

    if (!isValidImmediateIFormat(imm)) {
        return {
            error: true,
            message: `"${imm}" operand is out of range or is not a valid number`
        }
    }

    if (!RegFile[reg]) {
        return {
            error: true,
            message: `"${t1}" operand is of incorrect type`
        }
    }

    return {
        error: false,
        message: ''
    }
}

function checkBFormatInst(line: string[], symbolTable: Array<any>) {
    const instruction = line[0] ? line[0] : '';
    const t1 = line[1] ? line[1] : '';
    const t2 = line[2] ? line[2] : '';
    const label = line[3] ? line[3] : '';

    if (t1 === '' || t2 === '' || label === '' || line[4]) {
        return {
            error: true,
            message: `"${instruction}" Too few or incorrectly formatted operands. Expected: ${instruction} t1,t2,label`
        }
    }

    if (!RegFile[t1]) {
        return {
            error: true,
            message: `"${t1}" operand is of incorrect type`
        }
    }

    if (!RegFile[t2]) {
        return {
            error: true,
            message: `"${t2}" operand is of incorrect type`
        }
    }

    // if (!isValidLabel(label)) {
    //     return {
    //         error: true,
    //         message: `"${label}" Invalid language element`
    //     }
    // }

    if (!labelExist(label, symbolTable)) {
        return {
            error: true,
            message: `"${label}" not found in symbol table`
        }
    }

    return {
        error: false,
        message: ''
    }
}

function checkUFormatInst(line: string[]) {
    const instruction = line[0] ? line[0] : '';
    const t1 = line[1] ? line[1] : '';
    const immediate = line[2] ? line[2] : '';

    if (t1 === '' || immediate === '' || line[3]) {
        return {
            error: true,
            message: `"${instruction}" Too few or incorrectly formatted operands. Expected: ${instruction} t1, immediate`
        }
    }

    if (!RegFile[t1]) {
        return {
            error: true,
            message: `"${t1}" operand is of incorrect type`
        }
    }

    if (!isValidUmmediateIFormat(immediate)) {
        return {
            error: true,
            message: `"${immediate}" operand is out of range or is not a valid number`
        }
    }

    return {
        error: false,
        message: ''
    }
}

function checkJFormatInst(line: string[]) {
    const t1 = line[1] ? line[1] : '';
    const immediate = line[2] ? line[2] : '';
    const instruction = line[0] ? line[0] : '';

    if (t1 === '' || immediate === '' || line[3]) {
        return {
            error: true,
            message: `"${instruction}" Too few or incorrectly formatted operands. Expected: ${instruction} t1, target`
        }
    }

    if (!RegFile[t1]) {
        return {
            error: true,
            message: `"${t1}" operand is of incorrect type`
        }
    }

    if (!isValidUmmediateIFormat(immediate)) {
        return {
            error: true,
            message: `"${immediate}" operand is out of range or is not a valid number`
        }
    }

    return {
        error: false,
        message: ''
    }
}

function labelExist(newLabel: string, symbolTable: Array<any>): boolean {
    for (const label of symbolTable) {
        if (label.label === newLabel) {
            return true;
        }
    }
    return false;
}

function isValidImmediateIFormat(imm: string): boolean {
    const number = parseInt(imm);
    if (!isNaN(number) && number >= -2048 && number <= 2047) {
        return true;
    } else {
        return false;
    }
}

function isValidUmmediateIFormat(imm: string): boolean {
    const number = parseInt(imm);
    if (!isNaN(number) && number >= -1048576 && number <= 1048575) {
        return true;
    } else {
        return false;
    }
}

function checkInstructionFormatWithParentheses(str: string): boolean {
    const regex = /^-?\d+\s?\([a-zA-Z0-9]+\)$/;
    return regex.test(str);
}

function extractInstructionMemoryPosition(str: string) {
    const regex = /^(-?\d+)\s?\((\w+)\)$/;
    const match = str.match(regex);
    if (match) {
        return { imm: match[1], reg: match[2] };
    } else {
        return { imm: '', reg: '' };
    }
}