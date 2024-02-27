import { getBinaryRange, resize, resizeSigned, binaryToDecimal, decimalToBinary, binaryToDecimalSigned } from '../riscv-utils';

export class ImmGen {
    constructor() {

    }
    generate(instruction31to0: any, immShamt: any, immUp: any, memWrite: any, jump: any, jalr: any) {
        const immShamtValue = getBinaryRange(24, 20, instruction31to0);
        const immUpValue = getBinaryRange(31, 12, instruction31to0);
        const immUpJValue = getBinaryRange(31, 31, instruction31to0) +
            getBinaryRange(19, 12, instruction31to0) + getBinaryRange(20, 20, instruction31to0) +
            getBinaryRange(30, 21, instruction31to0) + '0';
        const immStoreValue = getBinaryRange(31, 25, instruction31to0) + getBinaryRange(11, 7, instruction31to0);
        const immIValue = getBinaryRange(31, 20, instruction31to0);

        const immShamt32 = resize(immShamtValue, 32);
        const immUp32 = decimalToBinary(binaryToDecimalSigned(resizeSigned(immUpValue, 32)) << 12);
        const immStoreJ32 = resizeSigned(immStoreValue, 32);
        const immUpJ32 = resizeSigned(immUpJValue, 32);
        const immI32 = resizeSigned(immIValue, 32);

        switch (true) {
            case immShamt:
                return binaryToDecimal(immShamt32);
            case immUp:
                return binaryToDecimalSigned(immUp32);
            case memWrite:
                return binaryToDecimalSigned(immStoreJ32);
            case jump && !jalr:
                return binaryToDecimalSigned(immUpJ32);
            default:
                return binaryToDecimalSigned(immI32);
        }
    }
}
