import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { RuntimeService } from "./services/runtime-service/runtime.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {


  constructor(
    private runtimeService: RuntimeService,
    public dialog: MatDialog
  ) {
  }

  ngOnInit() {
    this.initSimulator();
  }

  ngOnDestroy() {
  }

  initSimulator() {
    this.runtimeService.setCheckboxes({
      isHexAddresses: true,
      isHexValues: true,
      isAscii: false
    });

  }
}


