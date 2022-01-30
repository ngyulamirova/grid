import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzContextMenuServiceModule, NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { WithPercentCellRendererComponent } from './with-percent-cell-renderer.component';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { CloseMenuPipe } from '../../pipes/close-menu.pipe';

const ANT_DESIGN_MODULES = [
  NzDropDownModule,
  NzContextMenuServiceModule,
  NzPopoverModule
];

@NgModule({
  imports: [
    CommonModule,
    ANT_DESIGN_MODULES,
    NzSpinModule,
    NzIconModule
  ],
  declarations: [WithPercentCellRendererComponent, CloseMenuPipe]
})
export class WithPercentCellRendererModule {
}
