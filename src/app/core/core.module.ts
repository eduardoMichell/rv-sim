import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DumpFileDialogComponent } from './dialogs/dump-file-dialog/dump-file-dialog.component';
import { HelpDialogComponent } from './dialogs/help-dialog/help-dialog.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    DumpFileDialogComponent,
    HelpDialogComponent
  ],
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [
    DumpFileDialogComponent,
    HelpDialogComponent
  ]
})
export class CoreModule { }
