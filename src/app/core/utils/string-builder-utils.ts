import { RegFile } from './constants';
import { Text, Data } from './types';
import { ConstantsInit } from 'src/app/core/utils/constants';

export function createText(code: string, data: Array<Data>): Text {
  const lineArrayCode: Array<string[]> = separateElements(separateCode(code));
  if (
    hasSegment(lineArrayCode, '.data') &&
    !hasSegment(lineArrayCode, '.text')
  ) {
    return {
      source: [],
      basic: [],
    };
  }

  let source: Array<string[]> = [];
  if (
    !hasSegment(lineArrayCode, '.data') &&
    !hasSegment(lineArrayCode, '.text')
  ) {
    source = lineArrayCode;
  } else if (
    !hasSegment(lineArrayCode, '.data') &&
    hasSegment(lineArrayCode, '.text')
  ) {
    source = removeOnlyTextDirective(lineArrayCode);
  } else if (
    hasSegment(lineArrayCode, '.data') &&
    hasSegment(lineArrayCode, '.text')
  ) {
    source = removeFromText(lineArrayCode);
  }

  const { newSource, symbolTable } = createSymbolTable(source);
  const basic: Array<string[]> = convertTextBasicLabels(
    createTextBasic(newSource),
    symbolTable
  );

  const text = processPseudoInstructions(newSource, basic, data);
  return {
    source: text.newSource,
    basic: text.newBasic,
    symbolTable,
  };
}

export function createData(code: string): Array<Data> {
  const lineArrayCode: string[][] = separateCode(code);
  let dataToText = [];
  const data: Array<Data> = [];
  let currentMemoryPosition = ConstantsInit.DATA_MEM_INIT;
  if (
    hasSegment(lineArrayCode, '.data') &&
    hasSegment(lineArrayCode, '.text')
  ) {
    let isBetweenDataAndText = false;
    for (const item of lineArrayCode) {
      if (item.includes('.data')) {
        isBetweenDataAndText = true;
        continue;
      }
      if (item.includes('.text')) {
        isBetweenDataAndText = false;
        break;
      }
      if (isBetweenDataAndText) {
        dataToText.push(item);
      }
    }
  } else if (
    hasSegment(lineArrayCode, '.data') &&
    !hasSegment(lineArrayCode, '.text')
  ) {
    for (const item of lineArrayCode) {
      if (!item.includes('.data')) {
        dataToText.push(item);
      }
    }
  }

  dataToText = separateDataLinesByLabel(dataToText);

  for (const line of dataToText) {
    const directive = line[1] ? line[1] : '';
    const label = line[0] ? line[0] : '';

    let source: any[] = [];

    if (line.length > 2) {
      for (let i = 2; i < line.length; i++) {
        source.push(line[i]);
      }
    }
    const basic: any[] = JSON.parse(JSON.stringify(source));

    const memoryPosition = currentMemoryPosition;
    currentMemoryPosition += source.length * 4;

    data.push({
      directive,
      label,
      source,
      basic,
      memoryPosition,
    });
  }
  return data;
}

export function hasSegment(
  lineArrayCode: string[][],
  segment: string
): boolean {
  return lineArrayCode.some((line) =>
    line.some((element) => element.includes(segment))
  );
}

function processPseudoInstructions(
  source: Array<string[]>,
  basic: Array<string[]>,
  data: Array<Data>
) {
  const newSource: Array<string[]> = [];
  const newBasic: Array<any> = [];
  for (let i = 0; i < source.length; i++) {
    const { basicWithPseudo } = createPseudoInstruction(
      basic[i],
      newBasic,
      data
    );
    if (basicWithPseudo.inst.length > 1) {
      for (let j = 0; j < basicWithPseudo.inst.length; j++) {
        newSource.push(j === 0 ? source[i] : []);
        newBasic.push({ inst: basicWithPseudo.inst[j], isPseudo: true });
      }
    } else {
      newSource.push(source[i]);
      newBasic.push({
        inst: basicWithPseudo.inst.flat(),
        isPseudo: basicWithPseudo.isPseudo,
      });
    }
  }
  return { newSource, newBasic };
}

function createPseudoInstruction(
  line: string[],
  newBasic: Array<string[]>,
  data: Array<Data>
) {
  let basicWithPseudo: any = {};
  const instruction = line[0];
  switch (instruction) {
    case 'bgt':
    case 'bgtu':
      basicWithPseudo = convertBranchIfGreater(line);
      break;
    case 'ble':
    case 'bleu':
      basicWithPseudo = convertBranchIfLess(line);
      break;
    case 'j':
      basicWithPseudo = convertJump(line);
      break;
    case 'jr':
      basicWithPseudo = convertJumpRegister(line);
      break;
    case 'jal':
      basicWithPseudo = convertJumpAndLinkWithOnlyLabel(line);
      break;
    case 'nop':
      basicWithPseudo = { inst: [['addi', 'x0', 'x0', '0']], isPseudo: true };
      break;
    case 'la':
      const labelData = data.find((entry) => {
        const cleanLabel = entry.label.replace(':', '');
        return cleanLabel === line[2];
      });
      basicWithPseudo = convertLoadAddressWithOnlyLabel(
        line,
        newBasic.length,
        labelData?.memoryPosition || 0
      );
      break;
    case 'lb':
    case 'lbu':
      basicWithPseudo = convertLoadByte(line);
      break;
    case 'lh':
    case 'lhu':
      basicWithPseudo = convertLoadHalfWord(line);
      break;
    case 'lw':
      basicWithPseudo = convertLoadWord(line, newBasic.length, data);
      break;
    case 'li':
      basicWithPseudo = convertLoadImmediate(line);
      break;
    case 'jalr':
      basicWithPseudo = convertJumpAndLinkRegister(line);
      break;
    case 'sb':
    case 'sw':
    case 'sh':
      basicWithPseudo = convertStore(line, instruction);
      break;
    case 'not':
      basicWithPseudo = convertNot(line);
      break;
    case 'mv':
      basicWithPseudo = convertMove(line);
      break;
    case 'sgt':
    case 'sgtu':
      basicWithPseudo = convertSetGreaterThan(line);
      break;
    case 'sltz':
      basicWithPseudo = convertSetLessThanZero(line);
      break;
    case 'snez':
      basicWithPseudo = convertSetNotEqualToZero(line);
      break;
    case 'bgtz':
      basicWithPseudo = convertBranchIfGreaterThanZero(line);
      break;
    case 'blez':
      basicWithPseudo = convertBranchIfLessThanOrEqualZero(line);
      break;
    case 'bltz':
      basicWithPseudo = convertBranchIfLessThanZero(line);
      break;
    case 'bnez':
      basicWithPseudo = convertBranchIfNotEqualZero(line);
      break;
    case 'beqz':
      basicWithPseudo = convertBranchIfEqualZero(line);
      break;
    case 'bgez':
      basicWithPseudo = convertBranchIfGreaterThanOrEqualZero(line);
      break;
    case 'seqz':
      basicWithPseudo = convertSetEqualToZero(line);
      break;
    case 'sgtz':
      basicWithPseudo = convertSetGreaterThanZero(line);
      break;
    default:
      basicWithPseudo = { inst: [line], isPseudo: false };
  }
  return { basicWithPseudo };
}

function convertStore(line: string[], instruction: string) {
  if (line.length === 3) {
    const t1 = line[1];
    const left = line[2].slice(0, line[2].indexOf('('));
    const right = line[2].slice(line[2].indexOf('(') + 1, line[2].length - 1);
    const t2 = `${left ? left : '0'}(${right})`;
    return { inst: [[instruction, t1, t2]], isPseudo: true };
  }
  return { inst: [line], isPseudo: false };
}

function convertSetGreaterThanZero(line: string[]) {
  return line.length === 3
    ? { inst: [['slt', line[1], 'x0', line[2]]], isPseudo: true }
    : { inst: [line], isPseudo: false };
}

function convertSetEqualToZero(line: string[]) {
  return line.length === 3
    ? { inst: [['sltiu', line[1], line[2], '1']], isPseudo: true }
    : { inst: [line], isPseudo: false };
}

function convertBranchIfGreaterThanOrEqualZero(line: string[]) {
  return line.length === 3
    ? { inst: [['bge', line[1], 'x0', line[2]]], isPseudo: true }
    : { inst: [line], isPseudo: false };
}

function convertBranchIfEqualZero(line: string[]) {
  return line.length === 3
    ? { inst: [['beq', line[1], 'x0', line[2]]], isPseudo: true }
    : { inst: [line], isPseudo: false };
}

function convertBranchIfNotEqualZero(line: string[]) {
  return line.length === 3
    ? { inst: [['bne', line[1], 'x0', line[2]]], isPseudo: true }
    : { inst: [line], isPseudo: false };
}

function convertBranchIfLessThanZero(line: string[]) {
  return line.length === 3
    ? { inst: [['blt', line[1], 'x0', line[2]]], isPseudo: true }
    : { inst: [line], isPseudo: false };
}

function convertBranchIfLessThanOrEqualZero(line: string[]) {
  return line.length === 3
    ? { inst: [['bge', 'x0', line[1], line[2]]], isPseudo: true }
    : { inst: [line], isPseudo: false };
}

function convertBranchIfGreaterThanZero(line: string[]) {
  return line.length === 3
    ? { inst: [['blt', 'x0', line[1], line[2]]], isPseudo: true }
    : { inst: [line], isPseudo: false };
}

function convertSetNotEqualToZero(line: string[]) {
  return line.length === 3
    ? { inst: [['sltu', line[1], 'x0', line[2]]], isPseudo: true }
    : { inst: [line], isPseudo: false };
}

function convertSetLessThanZero(line: string[]) {
  return line.length === 3
    ? { inst: [['slt', line[1], line[2], 'x0']], isPseudo: true }
    : { inst: [line], isPseudo: false };
}

function convertSetGreaterThan(line: string[]) {
  const instruction = line[0].includes('u') ? 'sltu' : 'slt';
  return line.length === 4
    ? { inst: [[instruction, line[1], line[3], line[2]]], isPseudo: true }
    : { inst: [line], isPseudo: false };
}

function convertMove(line: string[]) {
  return line.length === 3
    ? { inst: [['add', line[1], 'x0', line[2]]], isPseudo: true }
    : { inst: [line], isPseudo: false };
}

function convertNot(line: string[]) {
  return line.length === 3
    ? { inst: [['xori', line[1], line[2], '-1']], isPseudo: true }
    : { inst: [line], isPseudo: false };
}

function convertJumpAndLinkRegister(line: string[]) {
  if (line.length === 2) {
    return { inst: [['jalr', 'x0', line[1], '0']], isPseudo: true };
  } else if (line.length === 3) {
    const t1 = line[2].includes('(') || line[2].includes(')') ? line[1] : 'x1';
    const regex = line[2].match(/\((.*?)\)/);
    const t2 = regex?.[1] || line[1];
    const t3 = line[2].includes('(')
      ? line[2].slice(0, line[2].indexOf('('))
      : line[2];
    return { inst: [['jalr', t1, t2, t3]], isPseudo: true };
  } else {
    return { inst: [line], isPseudo: false };
  }
}

function convertJump(line: string[]) {
  return { inst: [['jal', 'x0', line[1] || '']], isPseudo: true };
}

function convertJumpRegister(line: string[]) {
  return line.length === 2
    ? { inst: [['jalr', 'x0', line[1], '0']], isPseudo: true }
    : { inst: [line], isPseudo: false };
}

function convertLoadImmediate(line: string[]) {
  return line.length === 3
    ? { inst: [['addi', line[1], 'x0', line[2]]], isPseudo: true }
    : { inst: [line], isPseudo: false };
}

function convertLoadWord(
  line: string[],
  numberOfInstructions: number,
  data: Array<Data>
) {
  if (line.length === 3) {
    const t1 = line[1] || '';
    const t2 = line[2] || '';
    if (isNaN(Number(t2)) && !t2.includes('(') && !t2.includes(')')) {
      const labelData = data.find((data: Data) => data.label === `${t2}:`);
      const pcAddress = ConstantsInit.INST_MEM_INIT + numberOfInstructions * 4;
      const auipcImm = 64528 << 12;
      const newBasicWithPseudo: Array<string[]> = [
        ['auipc', t1, '64528'],
        [
          'lw',
          t1,
          `${(labelData?.memoryPosition || 0) - (pcAddress + auipcImm)}(${t1})`,
        ],
      ];
      return { inst: newBasicWithPseudo, isPseudo: true };
    } else if (!isNaN(Number(t2)) && !t2.includes('(') && !t2.includes(')')) {
      if (Number(t2) < -2048 || Number(t2) > 2047) {
        const superior = Math.round(Number(t2) / 2 ** 12);
        const newBasicWithPseudo: Array<string[]> = [
          ['lui', t1, `${superior}`],
          ['lw', t1, `${Number(t2) - superior * 2 ** 12}(${t1})`],
        ];
        return { inst: newBasicWithPseudo, isPseudo: false };
      } else {
        return { inst: [['lw', t1, `${Number(t2)}(${t1})`]], isPseudo: true };
      }
    } else {
      const t1 = line[1];
      const t2 = line[2].includes('(')
        ? `${line[2].slice(0, line[2].indexOf('('))}(${line[2].slice(
            line[2].indexOf('(') + 1,
            line[2].length - 1
          )})`
        : `0(${line[2]})`;
      return { inst: [['lw', t1, t2]], isPseudo: true };
    }
  } else {
    return { inst: [line], isPseudo: false };
  }
}

function convertLoadHalfWord(line: string[]) {
  const instruction = line[0].includes('u') ? 'lhu' : 'lh';
  return line.length === 3
    ? { inst: [[instruction, line[1], `0${line[2]}`]], isPseudo: true }
    : { inst: [line], isPseudo: false };
}

function convertLoadByte(line: string[]) {
  const instruction = line[0].includes('u') ? 'lbu' : 'lb';
  return line.length === 3
    ? { inst: [[instruction, line[1], `0${line[2]}`]], isPseudo: true }
    : { inst: [line], isPseudo: false };
}

function convertLoadAddressWithOnlyLabel(
  line: string[],
  numberOfInstructions: number,
  labelAddr: number
) {
  if (line.length === 3) {
    const label = line[1] || '';
    const offset = labelAddr - (ConstantsInit.PC + numberOfInstructions * 4);
    const offsetUpper = (offset + 0x800) >> 12;
    const offsetLower = offset - (offsetUpper << 12);
    const newBasicWithPseudo: Array<string[]> = [
      ['auipc', label, '64528'],
      ['addi', line[1], line[1], offsetLower.toString()],
    ];
    return { inst: newBasicWithPseudo, isPseudo: true };
  } else {
    return { inst: [line], isPseudo: false };
  }
}

function convertJumpAndLinkWithOnlyLabel(line: string[]) {
  return line.length === 2
    ? { inst: [['jal', 'x1', line[1] || '']], isPseudo: true }
    : { inst: [line], isPseudo: false };
}

function convertBranchIfGreater(line: string[]) {
  const instruction = line[0].includes('u') ? 'bltu' : 'blt';
  return {
    inst: [[instruction, line[2], line[1], line[3] || '']],
    isPseudo: true,
  };
}

function convertBranchIfLess(line: string[]) {
  const instruction = line[0].includes('u') ? 'bgeu' : 'bge';
  return {
    inst: [[instruction, line[2], line[1], line[3] || '']],
    isPseudo: true,
  };
}

function separateDataLinesByLabel(data: string[][]): string[][] {
  const newData: string[][] = JSON.parse(JSON.stringify(data));
  for (let i = 0; i < newData.length; i++) {
    if (i > 0) {
      const currentLabel = newData[i][0];
      const previousLabel = newData[i - 1][0];

      if (!currentLabel.includes(':') || !previousLabel.includes(':')) {
        newData[i - 1] = newData[i - 1].concat(newData[i]);
        newData.splice(i, 1);
        i--;
      }
    }
  }
  return newData;
}
function convertTextBasicLabels(
  basic: Array<string[]>,
  symbolTable: Array<any>
): Array<string[]> {
  const transformedInstructions = basic.map((instr) => [...instr]);

  const pseudoCountMap: Record<string, number> = {
    la: 2,
  };

  const instructionPCMap: number[] = [];
  let currentPC = 0;

  for (let i = 0; i < basic.length; i++) {
    instructionPCMap[i] = currentPC;

    const opcode = basic[i][0];
    const count = pseudoCountMap[opcode] ?? 1;
    currentPC += count * 4;
  }

  if (symbolTable) {
    symbolTable.forEach(({ label, labelPosition }) => {
      const labelPC = instructionPCMap[labelPosition];
      transformedInstructions.forEach((instr, idx) => {
        const instrPC = instructionPCMap[idx];
        for (let i = 1; i <= 3; i++) {
          if (instr[i] === label) {
            const offset = labelPC - instrPC;
            instr[i] = offset.toString();
            break;
          }
        }
      });
    });
  }

  return transformedInstructions;
}

function createSymbolTable(source: string[][]): {
  newSource: string[][];
  symbolTable: Array<any>;
} {
  const symbolTable: Array<any> = [];
  for (let i = 0; i < source.length; i++) {
    const line = source[i];
    for (let j = 0; j < line.length; j++) {
      const element = line[j];
      if (line.length === 1 && element.includes(':')) {
        symbolTable.push({
          label: element.slice(0, element.length - 1),
          labelPosition: i,
        });
        source.splice(i, 1);
        i--;
      }
    }
  }
  return { newSource: source, symbolTable };
}

function removeOnlyTextDirective(array: Array<string[]>): Array<string[]> {
  for (let i = 0; i < array.length; i++) {
    if (array[i].includes('.text')) {
      array.splice(i, 1);
      break;
    }
  }
  return array;
}

function removeFromText(array: Array<string[]>): Array<string[]> {
  const textIndex = array.findIndex((subArray) => subArray.includes('.text'));
  return textIndex !== -1 ? array.slice(textIndex + 1) : [];
}

function separateCode(code: string): Array<string[]> {
  const codeWithoutBreakLine = code.replace(/\n\s*\n/g, '\n');
  const codeWithoutLineSpace = codeWithoutBreakLine.replace(/^\s+/gm, '');
  const separatedLineCode = codeWithoutLineSpace
    .split('\n')
    .filter((line) => line.trim() !== '');
  const lineArrayCode = createLineArrayCode(separatedLineCode);
  const codeArrayDirectives = separateDirectives(lineArrayCode);
  return removeComments(codeArrayDirectives);
}

function separateDirectives(array: Array<string[]>): Array<string[]> {
  const newArray: Array<string[]> = [];
  for (const element of array) {
    if (
      element.length > 1 &&
      (element[0].startsWith('.data') || element[0].startsWith('.text'))
    ) {
      newArray.push([element[0]]);
      newArray.push(element.slice(1));
    } else {
      newArray.push(element);
    }
  }
  return newArray;
}

function separateElements(code: Array<string[]>): Array<string[]> {
  const newCode: Array<string[]> = [];
  for (const line of code) {
    if (line.some((element) => element.includes(':'))) {
      const index = line.findIndex((element) => element.includes(':'));
      let splitArray: string[];
      if (line[index].split(':')[1]) {
        splitArray = line.splice(index + 1);
        splitArray.unshift(line[index].split(':')[1]);
        newCode.push([line[index].split(':')[0] + ':']);
      } else {
        splitArray = line.splice(index + 1);
        newCode.push([line.splice(index)[0]]);
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
  return code
    .map((line) =>
      line
        .map((element) => element.replace(/\t/g, ''))
        .filter((element) => !element.includes('#'))
    )
    .filter((line) => line.length > 0);
}

function createTextBasic(source: string[][]): string[][] {
  const basic = JSON.parse(JSON.stringify(source));
  const registerKeys = Object.keys(RegFile);

  for (let i = 0; i < basic.length; i++) {
    for (let j = 0; j < basic[i].length; j++) {
      let element = basic[i][j];

      if (registerKeys.includes(element)) {
        basic[i][j] = `x${RegFile[element].value}`;
      }
    }
  }

  return basic;
}

function createLineArrayCode(separatedLineCode: string[]): Array<string[]> {
  const lineArrayCode: string[][] = [];
  for (const line of separatedLineCode) {
    const words = line
      .split(/("[^"]*"\s*|\s+)/)
      .filter((word) => word.trim() !== '');
    const tempWords = words.reduce<string[]>((acc, word) => {
      if (word.includes('#') && !word.startsWith('#') && word.length !== 1) {
        const parts = word.split('#');
        acc.push(parts.shift() || '');
        acc.push('#' + parts.join('#'));
      } else {
        acc.push(word);
      }
      return acc;
    }, []);
    const finalWords = tempWords.reduce<string[]>((acc, word) => {
      return word.includes(',') && !word.includes('#') && !word.includes('"')
        ? acc.concat(word.split(',').filter((line) => line.trim() !== ''))
        : acc.concat(word);
    }, []);
    if (!finalWords[0].startsWith('#')) {
      lineArrayCode.push(combineAfterHash(finalWords));
    }
  }
  return lineArrayCode;
}

function combineAfterHash(array: string[]): string[] {
  const hashIndex = array.findIndex((element) => element.includes('#'));
  if (hashIndex === -1) return array;
  const combinedString = array.slice(hashIndex).join(' ');
  return [...array.slice(0, hashIndex), combinedString];
}
