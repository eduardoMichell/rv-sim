import { NgModule } from '@angular/core';
import { monacoConfig } from './core/monaco-config';
import { AppComponent } from './app.component';
import { DumpFileDialogComponent } from './core/dialogs/dump-file-dialog/dump-file-dialog.component';
import { HelpDialogComponent } from './core/dialogs/help-dialog/help-dialog.component';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ConsoleComponent } from './components/console/console.component';
import { ButtonBarComponent } from './components/button-bar/button-bar.component';
import { RegFileComponent } from './components/reg-file/reg-file.component';
import { RuntimeComponent } from './components/runtime/runtime.component';
import { ExecuteComponent } from './components/runtime/execute/execute.component';

@NgModule({
  declarations: [
    AppComponent,
    DumpFileDialogComponent,
    HelpDialogComponent,
    ConsoleComponent,
    ButtonBarComponent,
    RegFileComponent,
    RuntimeComponent,
    ExecuteComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatSnackBarModule,
    MonacoEditorModule.forRoot(monacoConfig),
    MatMenuModule,
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatTabsModule,
    MatTooltipModule,
    MatDialogModule,
    MatSelectModule,
    MatFormFieldModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }