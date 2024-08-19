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

    // TODO: verifySymbolTable;
    // TODO: verificar se algum elemento é alguma diretiva e dizer q nao pode aparecer (".ascii" directive cannot appear in text segment)
    const resText = verifyText(code.code.text, code.code.data || []);
    if (resText.error) {
        return resText;
    }

    return {
        error: false,
        message: ''
    };
}

export function convertWrittenCode(code: string): Code {
    const data: Array<Data> = createData(code);
    const text: Text = createText(code, data);
    return {
        text,
        data
    }
}

export function shiftLeft(decimal: number, base: number) {
    return decimal << base;
}

export function decimalToBinary(decimal: number | string) {
    const isNegative = Number(decimal) < 0;
    return isNegative ? (Number(decimal) >>> 0).toString(2) : parseInt(decimal.toString()).toString(2);
}

export function hexadecimalToBinary(hex: string) {
    return parseInt(hex, 16).toString(2).padStart(8, '0');
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
    }
    return parseInt(binary, 2);
}

export function convertArrayBinaryToHexadecimal(code: string[]): string {
    return code
        .map(binary => resizeHex(binaryToHexadecimal(binary), 10))
        .join('\n');
}

export function convertConfigToText(code: any, pc: number) {
    const data: any = { address: [], code: [], basic: [], source: [] };
    let pcCount = pc;

    code.text.machineCode.forEach((machineCode: string, i: number) => {
        data.address.push(decimalToHex(pcCount));
        data.code.push(resizeHex(binaryToHexadecimal(machineCode), 10));
        data.basic.push(code.text.basic[i]);
        data.source.push(code.text.source[i]);
        pcCount += 4;
    });

    let text = 'Address        Code              Basic                   Line  Source\n';
    data.address.forEach((address: string, i: number) => {
        text += `${address}     ${data.code[i]}        ${data.basic[i].inst}${" ".repeat(24 - data.basic[i].inst.toString().length)}${i + 1}     ${data.source[i]}\n`;
    });

    return text;
}

export function decimalToHex(decimal: number): string {
    return resizeHex(decimal.toString(16), 10);
}

export function resizeHex(instructions: string, quantity: number, fillChar = '0') {
    return instructions.padStart(quantity - 2, fillChar).padStart(quantity, 'x');
}

export function resize(instruction: string, quantity: number, fillChar = '0') {
    return instruction.padStart(quantity, fillChar);
}

export function resizeSigned(instruction: string, quantity: number) {
    const fillChar = instruction[0] === '1' ? '1' : '0';
    return instruction.padStart(quantity, fillChar);
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

function checkInstructions(basicLine: any, sourceLine: string[], symbolTable: Array<any>, data: Data[]) {
    const isPseudo = basicLine.isPseudo;
    const instruction = isPseudo ? basicLine.inst[0] : sourceLine[0];
    const line = isPseudo ? basicLine.inst : sourceLine;
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
            return checkIFormatInst(line);
        case 'beq':
        case 'bne':
        case 'blt':
        case 'bge':
        case 'bltu':
        case 'bgeu':
        case "bgt":
        case "bgtu":
        case "ble":
        case "bleu":
            return checkBFormatInst(line, symbolTable, isPseudo, sourceLine);
        case 'lui':
        case 'auipc':
            return checkUFormatInst(line, sourceLine, data);
        case 'jal':
            return checkJFormatInst(line);
        default:
            return {
                error: true,
                message: `"${instruction}" is not a recognized operator`,
            };
    }
}

function verifyText(text: Text, data: Data[]) {
    for (let i = 0; i < text.basic.length; i++) {
        const res = checkInstructions(text.basic[i], text.source[i], text.symbolTable || [], data);
        if (res.error) {
            return res;
        }
    }
    return { error: false, message: '' };
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
    return { error: false, message: '' };
}

function checkDataElement(element: Data) {
    const elementLabel = validateLabel(element.label);
    if (elementLabel.error) {
        return elementLabel;
    }

    switch (element.directive) {
        case ".ascii":
        case ".string":
            return checkDataAscii(element);
        case ".word":
            return checkDataWord(element);
        default:
            const message = element.directive.length > 0 ? `"${element.directive}" is not a valid directive` : `Non-existent directive`;
            return { error: true, message };
    }
}

function validateLabel(label: string) {
    if (!label.endsWith(":")) {
        return { error: true, message: `"${label}" is not a valid label` };
    }

    const labelWithoutColon = label.slice(0, -1);

    if (/^[0-9]/.test(labelWithoutColon)) {
        return { error: true, message: `"${labelWithoutColon}" cannot start with a number` };
    }

    const regex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
    if (!regex.test(labelWithoutColon)) {
        return { error: true, message: `"${labelWithoutColon}" cannot have special characters` };
    }

    return { error: false, message: '' };
}

function checkDuplicateLabel(data: Data[]) {
    const duplicated = data.find((item, index) => data.findIndex(el => el.label === item.label) !== index);
    if (duplicated) {
        const label = duplicated.label.slice(0, -1);
        return { error: true, message: `label "${label}" already defined` };
    }
    return { error: false, message: '' };
}

function checkDataAscii(line: Data) {
    if (containsString(line.basic)) {
        if (containsDifferentDirectives(line.basic, ['.ascii', '.string'])) {
            return {
                error: true,
                message: 'It is not possible to define more than one directive in a label'
            }
        }
        const elementWithoutDirectives = removeDirectives(line.basic);
        const elementNoString = firstInvalidStringElement(elementWithoutDirectives);
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
    if (!containsString(line.basic)) {
        if (containsDifferentDirectives(line.basic, ['.word'])) {
            return { error: true, message: 'It is not possible to define more than one directive in a label' };
        }
        const basicWithoutDirectives = removeDirectives(line.basic);
        const areAllIntegersRes = areAllIntegers(basicWithoutDirectives);
        if (areAllIntegersRes.error) {
            return areAllIntegersRes;
        }
        line.basic = restrictNumber(basicWithoutDirectives);
    } else {
        if (line.basic.length > 0) {
            return { error: true, message: `This directive only accepts numbers` };
        }
    }
    return { error: false, message: '' };
}

function areAllIntegers(array: string[]) {
    for (const item of array) {
        if (!/^-?\d+$/.test(item)) {
            return { error: true, message: `"${item}" is not a valid integer number` };
        }
    }
    return { error: false, message: '' };
}

function restrictNumber(numbers: string[]) {
    const lowerLimit = Bit32Limit.lowerLimit;
    const upperLimit = Bit32Limit.upperLimit;
    const newBasic = numbers.map(num => {
        const range = upperLimit - lowerLimit + 1;
        let number = parseInt(num);
        if (number > upperLimit) {
            return lowerLimit + (number - upperLimit - 1) % range;
        }
        if (number < lowerLimit) {
            return upperLimit - (lowerLimit - number - 1) % range;
        }
        return number;
    });

    return newBasic;
}

function containsDifferentDirectives(array: string[], directivesToIgnore: string[]) {
    const ignoreSet = new Set(directivesToIgnore);
    const directivesAux = Directives.filter((element: string) => !ignoreSet.has(element));
    return array.some(element => directivesAux.some((directive: string) => element.includes(directive)));
}

function removeDirectives(array: string[]) {
    const regex = new RegExp(Directives.join('|'), 'g');
    return array.map(element => element.replace(regex, '')).filter(Boolean);
}

function firstInvalidStringElement(array: string[]): any {
    let incompleteString = '';
    for (const string of array) {
        if (!string.startsWith('"') || !string.endsWith('"')) {
            incompleteString += string + ' ';
            if (string === array[array.length - 1]) {
                return { error: true, message: `"${incompleteString.trim()}" is not a valid string` };
            }
        } else if (incompleteString !== '') {
            return { error: true, message: `"${incompleteString.trim()}" is not a valid string` };
        }
    }
    return { error: false, message: '' }
}

function convertStringToNumberArray(string: string): number[] {
    const stringArrayNumber: number[] = [];
    const words = string.match(/.{1,4}/g) || [];

    words.forEach(word => {
        let hexString = '0x';
        for (let i = word.length - 1; i >= 0; i--) {
            const charCode = word.charCodeAt(i).toString(16);
            hexString += charCode.padStart(2, '0');
        }
        stringArrayNumber.push(parseInt(hexString, 16));
    });

    return stringArrayNumber;
}

function containsString(line: string[]): boolean {
    return line.some(element => element.includes('"'));
}

function checkRFormatInst(line: string[]) {
    const [instruction, t1, t2, t3] = line;

    if (!t1 || !t2 || !t3 || line[4]) {
        return { error: true, message: `"${instruction}" Too few or incorrectly formatted operands. Expected: ${instruction} t1,t2,t3` };
    }

    if (!RegFile[t1] || !RegFile[t2] || !RegFile[t3]) {
        return { error: true, message: `"${t1}" or "${t2}" or "${t3}" operand is of incorrect type` };
    }

    return { error: false, message: '' };
}

function checkIFormatInst(line: string[]) {
   
    const [instruction, t1, t2, immediate] = line;

    if (!t1 || !t2 || !immediate || line[4]) {
        return { error: true, message: `"${instruction}" Too few or incorrectly formatted operands. Expected: ${instruction} t1,t2,-100` };
    }

    if (!RegFile[t1] || !RegFile[t2]) {
        return { error: true, message: `"${t1}" or "${t2}" operand is of incorrect type` };
    }

    if (!isValidImmediateIFormat(immediate)) {
        console.log("I format")
        return { error: true, message: `"${immediate}" operand is out of range or is not a valid number` };
    }

    return { error: false, message: '' };
}

function checkMemFormatInst(line: string[]) {
    const [instruction, t1, mem] = line;

    if (!RegFile[t1] || !mem || !checkInstructionFormatWithParentheses(mem)) {
        return { error: true, message: `"${instruction}" Too few or incorrectly formatted operands. Expected: ${instruction} t1, -100(t2)` };
    }

    const { imm, reg } = extractInstructionMemoryPosition(mem);
    if (!isValidImmediateIFormat(imm) || !RegFile[reg]) {
        console.log("M format")
        return { error: true, message: `"${imm}" operand is out of range or is not a valid number, or "${reg}" is not a valid register` };
    }

    return { error: false, message: '' };
}

function checkBFormatInst(line: string[], symbolTable: Array<any>, isPseudo: boolean, sourceLine: string[]) {
    let label = line[3];

    if (isPseudo) {
        label = sourceLine[sourceLine.length - 1];
    }

    const [instruction, t1, t2] = line;

    if (!t1 || !t2 || !label || line[4]) {
        return { error: true, message: `"${instruction}" Too few or incorrectly formatted operands. Expected: ${instruction} t1,t2,label` };
    }

    if (!RegFile[t1] || !RegFile[t2]) {
        return { error: true, message: `"${t1}" or "${t2}" operand is of incorrect type` };
    }
    if (!labelExist(label, symbolTable)) {
        console.log(!labelExist(label, symbolTable), label, symbolTable, line)

        return { error: true, message: `"${label}" not found in symbol table` };
    }

    return { error: false, message: '' };
}

function checkUFormatInst(line: string[], loadAddressLine: string[], data: Data[]) {
   
    const [instruction, t1, immediate] = line;
    const isLa = loadAddressLine[0] === 'la';

    if (!t1 || !immediate || line[3]) {
        return { error: true, message: `"${instruction}" Too few or incorrectly formatted operands. Expected: ${instruction} t1, immediate` };
    }

    if (!RegFile[t1]) {
        return { error: true, message: `"${t1}" operand is of incorrect type` };
    }

    if (isLa && !data.some(obj => obj.label === `${loadAddressLine?.[2]}:`)) {
        return { error: true, message: `symbol "${loadAddressLine?.[2]}" not found in symbol table` };
    }

    if (!isValidImmediateUFormat(immediate)) {
        console.log("U format")
        return { error: true, message: `"${immediate}" operand is out of range or is not a valid number` };
    }

    return { error: false, message: '' };
}

function checkJFormatInst(line: string[]) {
   
    const [instruction, t1, immediate] = line;

    if (!t1 || !immediate || line[3]) {
        return { error: true, message: `"${instruction}" Too few or incorrectly formatted operands. Expected: ${instruction} t1, target` };
    }

    if (!RegFile[t1]) {
        return { error: true, message: `"${t1}" operand is of incorrect type` };
    }

    if (!isValidImmediateUFormat(immediate)) {
        console.log("J format")
        return { error: true, message: `"${immediate}" operand is out of range or is not a valid number` };
    }

    return { error: false, message: '' };
}

function labelExist(label: string, symbolTable: Array<any>): boolean {
    return symbolTable.some(symbol => symbol.label === label);
}

function isValidImmediateIFormat(imm: string): boolean {
    const number = parseInt(imm);
    return !isNaN(number) && number >= -2048 && number <= 2047;
}

function isValidImmediateUFormat(imm: string): boolean {
    const number = parseInt(imm);
    return !isNaN(number) && number >= -1048576 && number <= 1048575;
}

function checkInstructionFormatWithParentheses(str: string): boolean {
    const regex = /^-?\d+\s?\([a-zA-Z0-9]+\)$/;
    return regex.test(str);
}

function extractInstructionMemoryPosition(str: string) {
    const regex = /^(-?\d+)\s?\((\w+)\)$/;
    const match = str.match(regex);
    return match ? { imm: match[1], reg: match[2] } : { imm: '', reg: '' };
}