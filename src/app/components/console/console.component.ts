import { Component } from '@angular/core';
import { UtilsService } from 'src/app/services/utils-service/utils.service';

@Component({
  selector: 'app-console',
  templateUrl: './console.component.html',
  styleUrls: ['./console.component.scss']
})
export class ConsoleComponent {
  constructor(private utils: UtilsService) {
  }

  printConsole(func: string, message: string) {
    this.utils.setConsole(func, message);
  }

  getConsole(): string {
    return this.utils.getConsole();
  }

  clearConsole() {
    this.utils.clearConsole();
  }
}
