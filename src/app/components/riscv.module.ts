import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { monacoConfig } from '../core/monaco-config';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { RuntimeComponent } from './runtime/runtime.component';
import { ExecuteComponent } from './runtime/execute/execute.component';
import { RegFileComponent } from './reg-file/reg-file.component';
import { ConsoleComponent } from './console/console.component';
import { ButtonBarComponent } from './button-bar/button-bar.component';
import { SharedModule } from '../shared/shared.module';


@NgModule({
  declarations: [
    RuntimeComponent,
    ExecuteComponent,
    RegFileComponent,
    ConsoleComponent,
    ButtonBarComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    MonacoEditorModule.forRoot(monacoConfig),
  ],
  exports: [
    RuntimeComponent,
    ExecuteComponent,
    RegFileComponent,
    ConsoleComponent,
    ButtonBarComponent
  ]
})
export class RiscvModule { }
