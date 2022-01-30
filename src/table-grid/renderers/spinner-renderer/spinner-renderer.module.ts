import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpinnerRendererComponent } from './spinner-renderer.component';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzIconModule } from 'ng-zorro-antd/icon';



@NgModule({
  declarations: [SpinnerRendererComponent],
  imports: [
    CommonModule,
    NzSpinModule,
    NzIconModule
  ],
  exports: [SpinnerRendererComponent]
})
export class SpinnerRendererModule { }
