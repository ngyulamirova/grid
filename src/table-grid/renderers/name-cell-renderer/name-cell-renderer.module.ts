import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NameCellRendererComponent } from './name-cell-renderer.component';
import { NzIconModule } from 'ng-zorro-antd/icon';

const ANT_DESIGN_MODULES = [
  NzIconModule
];

@NgModule({
  imports: [
    CommonModule,
    ANT_DESIGN_MODULES
  ],
  declarations: [NameCellRendererComponent]
})
export class NameCellRendererModule {
}
