import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-help-dialog',
  templateUrl: './help-dialog.component.html',
  styleUrls: ['./help-dialog.component.scss']
})
export class HelpDialogComponent {

  operands: any[] = [
    {
      name:"label, target",
      desc: "any textual label"
    },
    {
      name:"t1, t2, t3",
      desc: "any integer label"
    },
    {
      name:"10",
      desc: "unsigned 5-bit integer (0 to 31)"
    },
    {
      name:"-100",
      desc: "signed 16-bit integer (-32768 to 32767)"
    },
    {
      name:"100",
      desc: "unsigned 16-bit integer (0 to 65535)"
    },
    {
      name:"100000",
      desc: "signed 32-bit integer (-2147483648 to 2147483647)"
    },
    {
      name:"(t2)",
      desc: "contents of t2"
    },
    {
      name:"-100(t2)",
      desc: "signed-extended 16-bit integer added to contents of t2"
    },
    {
      name:"100(t2)",
      desc: "zero-extended 16-bit integer added to contents of t2"
    },
    {
      name:"100000(t2)",
      desc: "signed 32-bit integer added to contents of t2"
    },
    {
      name:"label",
      desc: "32-bit address of label"
    }
  ];

  basicInstructions: any[] = [
    {
      name:"add t1, t2, t3",
      desc: "Addition: Set t1 to t2 + t3"
    },
    {
      name:"addi t1, t2, -100",
      desc: "Addition Immediate: Set t1 to t2 + signed 12-bit immediate"
    },
    {
      name:"and t1, t2, t3",
      desc: "Bitwise AND: Set t1 to bitwise AND of t2 and t3"
    },
    {
      name:"andi t1, t2, -100",
      desc: "Bitwise AND Immediate: Set t1 to bitwise AND of t2 and sign-extended 12-bit immediate"
    },
    {
      name:"auipc t1, 100000",
      desc: "Add Upper Immediate: Set t1 to pc + an upper 20-bit immediate"
    },
    {
      name:"beq t1, t2, label",
      desc: "Branch If Equal: Branch to statement at label's address if t1 and t2 are equal"
    },
    {
      name:"bge t1, t2, label",
      desc: "Branch If Greater Than or Equal: Branch to statement at label's address if t1 is greater than or equal to t2"
    },
    {
      name:"bgeu t1, t2, label",
      desc: "Branch If Greater Than or Equal Unsigned: Branch to statement at label's address if t1 is greater than or equal to t2 (with an unsigned interpretation)"
    },
    {
      name:"blt t1, t2, label",
      desc: "Branch If Less Than: Branch to statement at label's address if t1 is less than t2"
    },
    {
      name:"bltu t1, t2, label",
      desc: "Branch If Less Than Unsigned: Branch to statement at label's address if t1 is less than t2 (with an unsigned interpretation)"
    },
    {
      name:"bne t1, t2, label",
      desc: "Branch If Not Equal: Branch to statement at label's address if t1 and t2 are not equal"
    },
    {
      name:"jal t1, target",
      desc: "Jump and Link: Set t1 to Program Counter, then jump to statement at target address"
    },
    {
      name:"jalr t1, t2, -100",
      desc: "Jump and Link Register: Set t1 to Program Counter, then jump to statement at t2 + immediate"
    },
    {
      name:"lb t1, -100(t2)",
      desc: "Load Byte: Set t1 to sign-extended 8-bit value from effective memory byte address"
    },
    {
      name:"lbu t1, -100(t2)",
      desc: "Load Byte Unsigned: Set t1 to zero-extended 8-bit value from effective memory byte address"
    },
    {
      name:"lh t1, -100(t2)",
      desc: "Load Halfword: Set t1 to sign-extended 16-bit value from effective memory halfword address"
    },
    {
      name:"lhu t1, -100(t2)",
      desc: "Load Halfword Unsigned: Set t1 to zero-extended 16-bit value from effective memory halfword address"
    },
    {
      name:"lui t1,100000",
      desc: "Load Upper Immediate: Set t1 to 20-bit followed by 12 0s"
    },
    {
      name:"lw t1, -100(t2)",
      desc: "Load Word: Set t1 to contents of effective memory word address"
    },
    {
      name:"or t1, t2, t3",
      desc: "Bitwise OR: Set t1 to bitwise OR of t2 and t3"
    },
    {
      name:"ori t1, t2, -100",
      desc: "Bitwise OR Immediate: Set t1 to bitwise OR of t2 and sign-extended 12-bit immediate"
    },
    {
      name:"sb t1, -100(t2)",
      desc: "Store byte: Store the low-order 8 bits of t1 into the effective memory byte address"
    },
    {
      name:"sh t1, -100(t2)",
      desc: "Store Halfword: Store the low-order 16 bits of t1 into the effective memory halfword address"
    },
    {
      name:"sll t1, t2, t3",
      desc: "Shift Left Logical: Set t1 to result of shifting t2 left by number of bits specified by value in low-order 5 bits of t3"
    },
    {
      name:"slli t1, t2, 10",
      desc: "Shift Left Logical Immediate: Set t1 to result of shifting t2 left by number of bits specified by immediate"
    },
    {
      name:"slt t1, t2, t3",
      desc: "Set Less Than: If t2 is less than t3, then set t1 to 1 else set t1 to 0"
    },
    {
      name:"slti t1, t2, -100",
      desc: "Set Less Than Immediate: If t2 is less than sign-extended 12-bit immediate, then set t1 to 1 else set t1 to 0"
    },
    {
      name:"sltiu t1, t2, -100",
      desc: "Set Less Than Immediate Unsigned: If t2 is less than sign-extended 16-bit immediate using unsigned comparison, then set t1 to 1 else set t1 to 0"
    },
    {
      name:"sltu t1, t2, -100",
      desc: "Set Less Than Unsigned: If t2 is less than t3 using unsigned comparision, then set t1 to 1 else set t1 to 0"
    },
    {
      name:"sra t1, t2, t3",
      desc: "Shift Right Arithmetic: Set t1 to result of sign-extended shifting t2 right by number of bits specified by value in low-order 5 bits of t3"
    },
    {
      name:"srai t1, t2, 10",
      desc: "Shift Right Arithmetic Immediate: Set t1 to result of sign-extended shifting t2 right by number of bits specified by immediate"
    },
    {
      name:"srl t1, t2, t3",
      desc: "Shift Right Logical: Set t1 to result of shifting t2 right by number of bits specified by value in low-order 5 bits of t3"
    },
    {
      name:"srli t1, t2, 10",
      desc: "Shift Right Logical Immediate: Set t1 to result of shifting t2 right by number of bits specified by immediate"
    },
    {
      name:"sub t1, t2, t3",
      desc: "Subtraction: Set t1 to t2 - t3"
    },
    {
      name:"sw t1, -100(t2)",
      desc: "Store Word: Store contents of t1 into effective memory word address"
    },
    {
      name:"xor t1, t2, t3",
      desc: "Bitwise XOR: Set t1 to bitwise XOR of t2 and t3"
    },
    {
      name:"xori t1, t2, -100 ",
      desc: "Bitwise XOR Immediate: Set t1 to bitwise XOR of t2 and sign-extended 12-bit immediate"
    }
  ];
               
  pseudoInstructions: any[] = [
    {
      name:"beqz t1, label",
      desc: "Branch if Equal Zero: Branch to statement at label if t1 == 0"
    },
    {
      name:"bgez t1, label",
      desc: "Branch if Greater Than or Equal to Zero: Branch to statement at label if t1 >= 0"
    },
    {
      name:"bgt t1, t2, label",
      desc: "Branch if Greater Than: Branch to statement at label if t1 > t2"
    },
    {
      name:"bgtu t1, t2, label",
      desc: "Branch if Greater Than Unsigned: Branch to statement at label if t1 > t2 (unsigned compare)"
    },
    {
      name:"bgtz t1, label",
      desc: "Branch if Greater Than Zero: Branch to statement at label if t1 > 0"
    },
    {
      name:"ble t1, t2, label",
      desc: "Branch if Less or Equal: Branch to statement at label if t1 <= t2"
    },
    {
      name:"bleu t1, t2, label",
      desc: "Branch if Less or Equal Unsigned: Branch to statement at label if t1 <= t2 (unsigned compare)"
    },
    {
      name:"blez t1, label",
      desc: "Branch if Less than or Equal to Zero: Branch to statement at label if t1 <= 0"
    },
    {
      name:"bltz t1, label",
      desc: "Branch if Less Than Zero: Branch to statement at label if t1 < 0"
    },
    {
      name:"bnez t1, label",
      desc: "Branch if Not Equal Zero: Branch to statement at label if t1 != 0"
    },
    {
      name:"j label",
      desc: "Jump: Jump to statement at label"
    },
    {
      name:"jal label",
      desc: "Jump And Link: Jump to statement at label and set the return address to ra"
    },
    {
      name:"jalr t0",
      desc: "Jump And Link Register: Jump to address in t0 and set the return address to ra"
    },
    {
      name:"jalr t0, -100",
      desc: "Jump And Link Register: Jump to address in t0 and set the return address to ra"
    },
    {
      name:"jalr t0, -100(t1)",
      desc: "Jump And Link Register: Jump to address in t1 and set the return address to t0"
    },
    {
      name:"jr t0",
      desc: "Jump Register: Jump to address in t0"
    },
    {
      name:"jr t0, -100",
      desc: "Jump Register: Jump to address in t0"
    },
    {
      name:"la t1, label",
      desc: "Load Address: Set t1 to label's address"
    },
    {
      name:"lb t1, (t2)",
      desc: "Load Byte: Set t1 to t2 value from effective memory byte address"
    },
    {
      name:"lb t1, -100",
      desc: "Load Byte: Set t1 to sign-extended 16-bit immediate from effective memory byte address"
    },
    {
      name:"lb t1, 10000000",
      desc: "Load Byte: Set t1 to sign-extended 32-bit immediate from effective memory byte address"
    },
    {
      name:"lbu t1, (t2)",
      desc: "Load Byte Unsigned: Set t1 to t2 value from effective memory byte address (unsigned)"
    },
    {
      name:"lbu t1, -100",
      desc: "Load Byte Unsigned: Set t1 to zero-extended 16-bit immediate from effective memory byte address"
    },
    {
      name:"lbu t1, 10000000",
      desc: "Load Byte Unsigned: Set t1 to zero-extended 32-bit immediate from effective memory byte address"
    },
    {
      name:"lh t1, (t2)",
      desc: "Load Halfword: Set t1 to t2 value from effective memory halfword address"
    },
    {
      name:"lh t1, -100",
      desc: "Load Halfword: Set t1 to sign-extended 16-bit immediate from effective memory halfword address"
    },
    {
      name:"lh t1, 10000000",
      desc: "Load Halfword: Set t1 to sign-extended 32-bit immediate from effective memory halfword address"
    },
    {
      name:"lhu t1, (t2)",
      desc: "Load Halfword Unsigned: Set t1 to t2 value from effective memory halfword address (unsigned)"
    },
    {
      name:"lhu t1, -100",
      desc: "Load Halfword Unsigned: Set t1 to zero-extended 16-bit immediate from effective memory halfword address"
    },
    {
      name:"lhu t1, 10000000",
      desc: "Load Halfword Unsigned: Set t1 to zero-extended 32-bit immediate from effective memory halfword address"
    },
    {
      name:"li t1, -100 ",
      desc: "Load Immediate : Set t1 to 16-bit immediate (sign-extended)"
    },
    {
      name:"li t1, 10000000 ",
      desc: "Load Immediate : Set t1 to 32-bit immediate"
    },
    {
      name:"lw t1, (t2)",
      desc: "Load Word: Set t1 to t2 value from effective memory word address"
    },
    {
      name:"lw t1, -100",
      desc: "Load Word: Set t1 to sign-extended 16-bit immediate from effective memory word address"
    },
    {
      name:"lw t1, 10000000",
      desc: "Load Word: Set t1 to sign-extended 32-bit immediate from effective memory word address"
    },
    {
      name:"mv t1, t2",
      desc: "Move: Set t1 to contents of t2"
    },
    {
      name:"nop",
      desc: "Nop Operation"
    },
    {
      name:"not t1, t2",
      desc: "Bitwise NOT: Bit inversion"
    },
    {
      name:"sb t1, (t2)",
      desc: "tore Byte: Store the low-order 8 bits of t1 into the effective memory byte address"
    },
    {
      name:"sb t1, -100",
      desc: "Store Byte: Store the low-order 8 bits of t1 into the effective memory byte address"
    },
    {
      name:"seqz t1, t2",
      desc: "Set Equal to Zero: If t2 == 0 then set t1 to 1 else 0"
    },
    {
      name:"sgt  t1, t2, t3",
      desc: "Set Greater Than: If t2 greater than t3 then set t1 to 1 else 0"
    },
    {
      name:"sgtu t1, t2, t3",
      desc: "Set Greater Than Unsigned: If t2 greater than t3 (unsigned compare) then set t1 to 1 else 0"
    },
    {
      name:"sgtz t1, t2",
      desc: "Set Greater Than Zero: If t2 >  0 then set t1 to 1 else 0"
    },
    {
      name:"sh t1, (t2)",
      desc: "Store Halfword: Store the low-order 16 bits of t1 into the effective memory halfword address"
    },
    {
      name:"sh t1, -100",
      desc: "Store Halfword: Store the low-order 16 bits of t1 into the effective memory halfword address"
    },
    {
      name:"sltz t1, t2",
      desc: "Set Less Than Zero: If t2 <  0 then set t1 to 1 else 0"
    },
    {
      name:"snez t1, t2",
      desc: "Set Not Equal to Zero: If t2 != 0 then set t1 to 1 else 0"
    },
    {
      name:"sw t1, (t2)",
      desc: "Store Word: Store t1 contents into effective memory word address"
    },
    {
      name:"sw t1, -100",
      desc: "Store Word: Store t1 contents into effective memory word address"
    }  
  ];

  directives: any[] = [
    {
      name:".ascii",
      desc: "Store the string in the Data Segment"
    },
    {
      name:".word",
      desc: "Store the listed value(s) as 32 bits on word boundary"
    },
    {
      name:".string",
      desc: "Alias for .ascii"
    },
  ];

  constructor(
    public dialogRef: MatDialogRef<HelpDialogComponent>) {
  }


  closeDialog() {
    this.dialogRef.close();
  }

   
}
