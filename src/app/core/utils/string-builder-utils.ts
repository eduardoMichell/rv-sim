
import { RegFile } from './constants';
import { Text, Data } from './types';

export function createText(code: string): Text {
    const lineArrayCode: Array<string[]> = separateElements(separateCode(code));
    if (checkSegment(lineArrayCode, '.data') && !checkSegment(lineArrayCode, '.text')) {
        return {
            source: [],
            basic: []
        }
    }

    let source: Array<string[]> = [];
    if (!checkSegment(lineArrayCode, '.data') && !checkSegment(lineArrayCode, '.text')) {
        source = lineArrayCode;
    } else if (!checkSegment(lineArrayCode, '.data') && checkSegment(lineArrayCode, '.text')) {
        source = removeOnlyTextDirective(lineArrayCode);
    } else if (checkSegment(lineArrayCode, '.data') && checkSegment(lineArrayCode, '.text')) {
        source = removeFromText(lineArrayCode);
    }

    const { newSource, symbolTable } = createSymbolTable(source);

    const basic: Array<string[]> = convertTextBasicLabels(createTextBasic(newSource), symbolTable);
    const text = verifyPseudoInstructions(newSource, basic);
    return {
        source: text.newSouce,
        basic: text.newBasic,
        symbolTable
    };
}

export function createData(code: string): Array<Data> {
    const lineArrayCode: string[][] = separateCode(code);
    let dataToText = [];
    const data: Array<Data> = [];
    if (checkSegment(lineArrayCode, '.data') && checkSegment(lineArrayCode, '.text')) {
        let isBetweenDataAndText = false;
        for (const item of lineArrayCode) {
            if (item.includes(".data")) {
                isBetweenDataAndText = true;
                continue;
            }
            if (item.includes(".text")) {
                isBetweenDataAndText = false;
                break;
            }
            if (isBetweenDataAndText) {
                dataToText.push(item);
            }
        }
    } else if (checkSegment(lineArrayCode, '.data') && !checkSegment(lineArrayCode, '.text')) {
        for (const item of lineArrayCode) {
            if (!item.includes(".data")) {
                dataToText.push(item);
            }
        }
    }

    dataToText = separateDataLinesByLabel(dataToText);

    for (const line of dataToText) {
        const directive = line[1] ? line[1] : "";
        const label = line[0] ? line[0] : "";

        let source: any[] = [];

        if (line.length > 2) {
            for (let i = 2; i < line.length; i++) {
                source.push(line[i]);
            }
        }
        const basic: any[] = JSON.parse(JSON.stringify(source));
        data.push({
            directive,
            label,
            source,
            basic
        })
    }
    return data;
}

export function checkSegment(lineArrayCode: string[][], segment: string): boolean {
    for (const line of lineArrayCode) {
        for (const element of line) {
            if (element.includes(segment)) {
                return true;
            }
        }
    }
    return false;
}

function verifyPseudoInstructions(source: Array<string[]>, basic: Array<string[]>) {
    const newSouce: Array<string[]> = [];
    const newBasic: Array<any> = [];
    for (let i = 0; i < source.length; i++) {
        const { basicWithPseudo } = createPseudo(basic[i], newBasic);
        if (basicWithPseudo.inst.length > 1) {
            for (let j = 0; j < basicWithPseudo.inst.length; j++) {
                if (j == 0) {
                    newSouce.push(source[i]);
                } else {
                    newSouce.push([]);
                }
                newBasic.push({ inst: basicWithPseudo.inst[j], isPseudo: true });
            }
        } else {
            newSouce.push(source[i]);
            newBasic.push({ inst: basicWithPseudo.inst.flat(), isPseudo: basicWithPseudo.isPseudo });
        }
    }
    return { newSouce, newBasic };
}

function createPseudo(line: string[], newBasic: Array<string[]>) {
    let basicWithPseudo: any = {};
    const instruction = line[0];
    switch (instruction) {
        case "bgt":
        case "bgtu":
            basicWithPseudo = convertBranchIfGreater(line);
            break;
        case "ble":
        case "bleu":
            basicWithPseudo = convertBranchIfLess(line);
            break;
        case "j":
            basicWithPseudo = converJump(line);
            break;
        case "jr":
            basicWithPseudo = converJumpRegister(line);
            break;
        case "jal":
            basicWithPseudo = converJumpAndLinkWithOnlyLabel(line);
            break;
        case "nop":
            basicWithPseudo = { inst: [['addi', 'x0', 'x0', '0']], isPseudo: true }
            break;
        case "la":
            basicWithPseudo = converLoadAddressWithOnlyLabel(line, newBasic.length);
            break;
        case "lb":
        case "lbu":
            basicWithPseudo = converLoadByte(line);
            break;
        case "lh":
        case "lhu":
            basicWithPseudo = converLoadHalfWord(line);
            break; 
        case "lw":
            basicWithPseudo = converLoadWord(line);
            break;
        case "li":
            basicWithPseudo = converLoadImmediate(line);
            break;
        case "jalr":
            basicWithPseudo = converJumpAndLinkRegister(line);
            break;
        case "sb":
            basicWithPseudo = convertStores(line, "sb");
            break;
        case "sw":
            basicWithPseudo = convertStores(line, "sw");
            break;
        case "sh":
            basicWithPseudo = convertStores(line, "sh");
            break;
        case "not":
            basicWithPseudo = converNot(line);
            break;
        case "mv":
            basicWithPseudo = convertMove(line);
            break;
        case "sgt":
        case "sgtu":
            basicWithPseudo = convertSetGreaterThan(line);
            break;
        case "sltz":
            basicWithPseudo = convertSetLessThanZero(line);
            break;
        case "snez":
            basicWithPseudo = convertSetNotEqualToZero(line);
            break;
        case "bgtz":
            basicWithPseudo = convertBranchIfGreaterThanZero(line);
            break;
        case "blez":
            basicWithPseudo = convertBranchIfLessThanOrEqualZero(line);
            break;
        case "bltz":
            basicWithPseudo = convertBranchIfLessThanZero(line);
            break;
        case "bnez":
            basicWithPseudo = convertBranchIfNotEqualZero(line);
            break;
        case "beqz":
            basicWithPseudo = convertBranchIfEqualZero(line);
            break;
        case "bgez":
            basicWithPseudo = convertBranchIfGreaterThanOrEqualZero(line);
            break;
        case "seqz":
            basicWithPseudo = convertSetEqualToZero(line);
            break;
        case "sgtz":
            basicWithPseudo = convertSetGreaterThanZero(line);
            break;
        default:
            basicWithPseudo = { inst: [line], isPseudo: false };
    }
    return {
        basicWithPseudo
    }
}

function convertStores(line: string[], instruction: string) {
    if (line.length === 3) {
        const t1 = line[1];
        const left = line[2].slice(0, line[2].indexOf('('))
        const right = line[2].slice(line[2].indexOf('(') + 1, line[2].length - 1);
        const t2 = line[2].includes("(") && line[2].includes(")") ? `${left ? left : "0"}(${right})` : `${line[2]}(x0)`;
        return { inst: [[instruction, t1, t2]], isPseudo: true };
    } else {
        return { inst: [line], isPseudo: false };
    }
}

function convertSetGreaterThanZero(line: string[]) {
    if (line.length === 3) {
        const t1 = line[1];
        const t2 = line[2];
        return { inst: [['slt', t1, 'x0', t2]], isPseudo: true };
    } else {
        return { inst: [line], isPseudo: false };
    }
}

function convertSetEqualToZero(line: string[]) {
    if (line.length === 3) {
        const t1 = line[1];
        const t2 = line[2];
        return { inst: [['sltiu', t1, t2, '1']], isPseudo: true };
    } else {
        return { inst: [line], isPseudo: false };
    }
}

function convertBranchIfGreaterThanOrEqualZero(line: string[]) {
    if (line.length === 3) {
        const t1 = line[1];
        const label = line[2];
        return { inst: [['bge', t1, 'x0', label]], isPseudo: true };
    } else {
        return { inst: [line], isPseudo: false };
    }
}

function convertBranchIfEqualZero(line: string[]) {
    if (line.length === 3) {
        const t1 = line[1];
        const label = line[2];
        return { inst: [['beq', t1, 'x0', label]], isPseudo: true };
    } else {
        return { inst: [line], isPseudo: false };
    }
}

function convertBranchIfNotEqualZero(line: string[]) {
    if (line.length === 3) {
        const t1 = line[1];
        const label = line[2];
        return { inst: [['bne', t1, 'x0', label]], isPseudo: true };
    } else {
        return { inst: [line], isPseudo: false };
    }
}

function convertBranchIfLessThanZero(line: string[]) {
    if (line.length === 3) {
        const t1 = line[1];
        const label = line[2];
        return { inst: [['blt', t1, 'x0', label]], isPseudo: true };
    } else {
        return { inst: [line], isPseudo: false };
    }
}

function convertBranchIfLessThanOrEqualZero(line: string[]) {
    if (line.length === 3) {
        const t1 = line[1];
        const label = line[2];
        return { inst: [['bge', 'x0', t1, label]], isPseudo: true };
    } else {
        return { inst: [line], isPseudo: false };
    }
}

function convertBranchIfGreaterThanZero(line: string[]) {
    if (line.length === 3) {
        const t1 = line[1];
        const label = line[2];
        return { inst: [['blt', 'x0', t1, label]], isPseudo: true };
    } else {
        return { inst: [line], isPseudo: false };
    }
}

function convertSetNotEqualToZero(line: string[]) {
    if (line.length === 3) {
        const t1 = line[1];
        const t2 = line[2];
        return { inst: [['sltu', t1, 'x0', t2]], isPseudo: true };
    } else {
        return { inst: [line], isPseudo: false };
    }
}

function convertSetLessThanZero(line: string[]) {
    if (line.length === 3) {
        const t1 = line[1];
        const t2 = line[2];
        return { inst: [['slt', t1, t2, 'x0']], isPseudo: true };
    } else {
        return { inst: [line], isPseudo: false };
    }
}

function convertSetGreaterThan(line: string[]) {
    const instruction = line[0].includes('u') ? 'sltu' : 'slt';
    if (line.length === 4) {
        const t1 = line[1];
        const t2 = line[2];
        const t3 = line[3];
        return { inst: [[instruction, t1, t3, t2]], isPseudo: true };
    } else {
        return { inst: [line], isPseudo: false };
    }
}

function convertMove(line: string[]) {
    if (line.length === 3) {
        const t1 = line[1];
        const t2 = line[2];
        return { inst: [['add', t1, "x0", t2]], isPseudo: true };
    } else {
        return { inst: [line], isPseudo: false };
    }
}

function converNot(line: string[]) {
    if (line.length === 3) {
        const t1 = line[1];
        const t2 = line[2];
        return { inst: [['xori', t1, t2, '-1']], isPseudo: true };
    } else {
        return { inst: [line], isPseudo: false };
    }
}

function converJumpAndLinkRegister(line: string[]) {
    if (line.length === 2) {
        const t1 = line[1];
        return { inst: [['jal', 'x1', t1, '0']], isPseudo: true };
    } else {
        if (line.length === 3) {
            const t1 = line[2].includes("(") || line[2].includes(")") ? line[1] : 'x1';
            const regex = line[2].match(/\((.*?)\)/);
            const t2 = line[2].includes("(") || line[2].includes(")") ? regex?.[1] || line[1] : line[1];
            const t3 = line[2].includes("(") ? line[2].slice(0, line[2].indexOf('(')) : line[2];
            return { inst: [["jal", t1, t2, t3]], isPseudo: true };
        } else {
            return { inst: [line], isPseudo: false };
        }
    }
}

function converJump(line: string[]) {
    const label = line[1] ? line[1] : '';
    return { inst: [['jal', 'x0', label]], isPseudo: true };
}

function converJumpRegister(line: string[]) {
    if (line.length === 2) {
        const t1 = line[1];
        return { inst: [['jalr', 'x0', t1, '0']], isPseudo: true };
    } else {
        return { inst: [line], isPseudo: false };
    }
}

function converLoadImmediate(line: string[]) {
    if (line.length === 3) {
        const t1 = line[1];
        const immediate = line[2];
        return { inst: [["addi", t1, "x0", immediate]], isPseudo: true };
    } else {
        return { inst: [line], isPseudo: false };
    }
}

function converLoadWord(line: string[]) {
    if (line.length === 3) {
        const t1 = line[1];
        const left = line[2].slice(0, line[2].indexOf('('))
        const right = line[2].slice(line[2].indexOf('(') + 1, line[2].length - 1);
        const t2 = line[2].includes("(") && line[2].includes(")") ? `${left ? left : "0"}(${right})` : `${line[2]}(x0)`;
        return { inst: [["lw", t1, t2]], isPseudo: true };
    } else {
        return { inst: [line], isPseudo: false };
    }
}

function converLoadHalfWord(line: string[]) {
    const instruction = line[0].includes('u') ? 'lhu' : 'lh';
    if (line.length === 3) {
        const t1 = line[1];
        const t2 = line[2].includes("(") || line[2].includes(")") ? `0${line[2]}` : `${line[2]}(x0)`;
        return { inst: [[instruction, t1, t2]], isPseudo: true };
    } else {
        return { inst: [line], isPseudo: false };
    }
}

function converLoadByte(line: string[]) {
    const instruction = line[0].includes('u') ? 'lbu' : 'lb';
    if (line.length === 3) {
        const t1 = line[1];
        const t2 = line[2].includes("(") || line[2].includes(")") ? `0${line[2]}` : `${line[2]}(x0)`;
        return { inst: [[instruction, t1, t2]], isPseudo: true };
    } else {
        return { inst: [line], isPseudo: false };
    }
}

function converLoadAddressWithOnlyLabel(line: string[], numberOfInstructions: number) {
    if (line.length === 3) {
        const label = line[1] ? line[1] : '';
        const newBasicWithPseudo: Array<string[]> = [];
        newBasicWithPseudo.push(["auipc", label, "64528"]);
        newBasicWithPseudo.push(["addi", line[1], line[1], ((numberOfInstructions) * -4).toString()]);
        return { inst: newBasicWithPseudo, isPseudo: true };
    } else {
        return { inst: [line], isPseudo: false };
    }
}

function converJumpAndLinkWithOnlyLabel(line: string[]) {
    if (line.length === 2) {
        const label = line[1] ? line[1] : '';
        return { inst: [['jal', 'x1', label]], isPseudo: true };
    } else {
        return { inst: [line], isPseudo: false };
    }
}

function convertBranchIfGreater(line: string[]) {
    const instruction = line[0].includes('u') ? 'bltu' : 'blt';
    const t1 = line[1] ? line[1] : '';
    const t2 = line[2] ? line[2] : '';
    const label = line[3] ? line[3] : '';
    return { inst: [[instruction, t2, t1, label]], isPseudo: true };
}

function convertBranchIfLess(line: string[]) {
    const instruction = line[0].includes('u') ? 'bgeu' : 'bge';
    const t1 = line[1] ? line[1] : '';
    const t2 = line[2] ? line[2] : '';
    const label = line[3] ? line[3] : '';
    return { inst: [[instruction, t2, t1, label]], isPseudo: true };
}

function separateDataLinesByLabel(data: string[][]) {
    const newData: string[][] = JSON.parse(JSON.stringify(data));
    for (let i = 0; i < newData.length; i++) {
        if (i > 0) {
            const currentLabel = newData[i][0];
            const previousLabel = newData[i - 1][0];

            if (!currentLabel.includes(":") || !previousLabel.includes(":")) {
                newData[i - 1] = newData[i - 1].concat(newData[i]);
                newData.splice(i, 1);
                i--;
            }
        }
    }
    return newData;
}

function convertTextBasicLabels(basic: Array<string[]>, symbolTable: Array<any>): Array<string[]> {
    const transformedInstructions = basic.map(instr => [...instr]);
    if (symbolTable) {
        symbolTable.forEach(labelObj => {
            const labelName = labelObj.label;
            const labelPos = labelObj.labelPosition;
            transformedInstructions.forEach((instr, idx) => {
                for (let i = 1; i <= 3; i++) {
                    if (instr[i] === labelName) {
                        const instrIndex = labelPos - idx;
                        instr[i] = (instrIndex * 4).toString();
                        break;
                    }
                }
            });
        });
    }
    return transformedInstructions;
}

function createSymbolTable(source: string[][]): { newSource: string[][], symbolTable: Array<any> } {
    const symbolTable: Array<any> = [];
    for (let i = 0; i < source.length; i++) {
        const line = source[i];
        for (let j = 0; j < line.length; j++) {
            const element = line[j];
            if (line.length === 1 && element.includes(':')) {
                symbolTable.push({
                    label: element.slice(0, element.length - 1),
                    labelPosition: i
                });
                source.splice(i, 1);
                i--;
            }
        }
    }
    const newSource: string[][] = source;
    return { newSource, symbolTable }
}

function removeOnlyTextDirective(array: Array<string[]>): Array<string[]> {
    for (let i = 0; i < array.length; i++) {
        const subArray = array[i];
        if (subArray.includes(".text")) {
            array.splice(i, 1);
            break;
        }
    }
    return array;
}

function removeFromText(array: Array<string[]>): Array<string[]> {
    let index = -1;
    for (let i = 0; i < array.length; i++) {
        const subArray = array[i];
        if (subArray.includes(".text")) {
            index = i;
            break;
        }
    }

    if (index !== -1) {
        return array.slice(index + 1);
    }

    return [];
}

function separateCode(code: string): Array<string[]> {
    const codeWithoutBreakLine = code.replace(/\n\s*\n/g, '\n');
    const codeWithtoutLineSpace = codeWithoutBreakLine.replace(/^\s+/gm, '');
    const separatedLineCode = codeWithtoutLineSpace.split('\n').filter(line => line.trim() !== '');
    const lineArrayCode = createLineArrayCode(separatedLineCode)
    const codeArrayDiretives = separateDirectives(lineArrayCode);
    const codeWithoutComments = removeComments(codeArrayDiretives);
    return codeWithoutComments;
}

function separateDirectives(array: Array<string[]>): Array<string[]> {
    const newArray = [];
    for (const element of array) {
        if (element.length > 1 && (element[0].startsWith('.data') || element[0].startsWith('.text'))) {
            newArray.push([element[0]]);
            newArray.push(element.slice(1));

        } else {
            newArray.push(element);
        }
    }

    return newArray;
}

function separateElements(code: Array<string[]>) {
    let newCode = [];
    for (const line of code) {
        if (line.some(element => element.includes(":"))) {
            let index = line.findIndex(element => element.includes(":"));
            let splitArray
            if (line[index].split(":")[1]) {
                splitArray = line.splice(index + 1);
                splitArray.unshift(line[index].split(":")[1]);
                newCode.push([]);
                newCode[newCode.length - 1].push(line[index].split(":")[0] + ":");
            } else {
                splitArray = line.splice(index + 1);
                newCode.push([]);
                newCode[newCode.length - 1].push(line.splice(index)[0]);
            }
            if (splitArray.length > 0) {
                newCode.push(splitArray);
            }
        } else {
            newCode.push(line);
        }
    }
    return newCode;
}

function removeComments(code: Array<string[]>): Array<string[]> {
    for (let i = 0; i < code.length; i++) {
        if (Array.isArray(code[i])) {
            code[i] = code[i].map(element => element.replace(/\t/g, ""));
            code[i] = code[i].filter(element => !element.includes("#"));
        }
    }
    return code.filter(element => element.length > 0);
}

function createTextBasic(source: string[][]): string[][] {
    const basic = JSON.parse(JSON.stringify(source));
    for (let i = 0; i < basic.length; i++) {
        for (let j = 0; j < basic[i].length; j++) {
            let element = basic[i][j];
            const registerKeys = Object.keys(RegFile);
            const exist = registerKeys.some(key => element.includes(key));
            if (exist) {
                element = registerKeys.reduce((acc, chave) => {
                    if (element.includes(chave)) {
                        return acc.replace(chave, `x${RegFile[chave].value}`);
                    }
                    return acc;
                }, element);
                basic[i][j] = element;
            }
        }
    }
    return basic;
}

function createLineArrayCode(separatedLineCode: string[]): Array<string[]> {
    const lineArrayCode: string[][] = [];
    for (const line of separatedLineCode) {
        let words = line.split(/("[^"]*"\s*|\s+)/).filter(word => word.trim() !== '');
        let tempWords: string[] = [];
        for (const word of words) {
            if (word.includes('#') && !word.startsWith('#') && word.length !== 1) {
                const parts = word.split('#');
                const firstPart = parts.shift();
                tempWords.push(firstPart || "");
                tempWords.push('#' + parts.join('#'));
            } else {
                tempWords.push(word);
            }
        }
        let finalWords: string[] = [];

        for (const word of tempWords) {
            if (word.includes(',') && !word.includes('#') && !word.includes('"')) {
                finalWords = finalWords.concat(word.split(',').filter(line => line.trim() !== ''));
            } else {
                finalWords.push(word);
            }
        }

        if (!finalWords[0].startsWith("#")) {
            lineArrayCode.push(combineAfterHash(finalWords));
        }
    }
    return lineArrayCode;
}

function combineAfterHash(array: string[]): string[] {
    const hashIndex = array.findIndex(element => element.includes('#'));
    if (hashIndex === -1) {
        return array;
    }
    const combinedString = array.slice(hashIndex).join(' ');
    const newArray = array.slice(0, hashIndex + 1);
    newArray[newArray.length - 1] = combinedString;
    return newArray;
}
