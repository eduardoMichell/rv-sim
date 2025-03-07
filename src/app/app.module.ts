import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { RiscvModule } from './components/riscv.module';
import { CoreModule } from './core/core.module';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    CoreModule,
    RiscvModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }