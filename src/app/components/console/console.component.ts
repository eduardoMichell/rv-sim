import { Component } from '@angular/core';
import { UtilsService } from 'src/app/services/utils-service/utils.service';

@Component({
  selector: 'app-console',
  templateUrl: './console.component.html',
  styleUrls: ['./console.component.scss']
})
export class ConsoleComponent {
  input: string = '';
  allowInput: boolean = false; 

  constructor(private utils: UtilsService) {}

  printConsole(func: string, message: string) {
    this.utils.setConsole(func, message);
  }

  getConsole(): string {
    return this.utils.getConsole();
  }

  clearConsole() {
    this.utils.clearConsole();
  }

  onEnter() {
    if (this.allowInput && this.input.trim()) {
      this.printConsole('User Input', `$: ${this.input}`);
      this.input = '';
    }
  }

  enableInput() {
    this.allowInput = true;
  }

  disableInput() {
    this.allowInput = false;
  }
}