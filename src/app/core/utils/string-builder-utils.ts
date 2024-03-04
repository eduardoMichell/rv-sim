
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
    } else {
        if (!checkSegment(lineArrayCode, '.data') && checkSegment(lineArrayCode, '.text')) {
            source = removeOnlyTextDirective(lineArrayCode);
        } else {
            if (checkSegment(lineArrayCode, '.data') && checkSegment(lineArrayCode, '.text')) {
                source = removeFromText(lineArrayCode);
            }
        }
    }
    const { newSource, symbolTable } = createSymbolTable(source);

    const basic: Array<string[]> = convertTextBasicLabels(createTextBasic(newSource), symbolTable);
    console.log(newSource)
    console.log(basic)
    console.log(symbolTable)
    // const text = verifyPseudoInstructions(newSource, basic);

    return {
        source,
        basic,
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
    for (const line of source) {

    }
    return source;
}

function createPseudo(line: string[]) {
    //'bgt', 'bgtu', 'ble', 'bleu', 'j', 'jr', 'la', 'lb', 'lh', 'lw', 'nop', 'sb', 'sw', 'sh', jal

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
