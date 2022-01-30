import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TableGridComponent} from './table-grid.component';
import { AgGridModule } from 'ag-grid-angular';
import { DragToSelectModule } from 'ngx-drag-to-select';
import { SelectCellsDirective } from './directives/select-cells.directive';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { SpinnerRendererModule } from './renderers/spinner-renderer/spinner-renderer.module';


@NgModule({
  declarations: [TableGridComponent, SelectCellsDirective],
  exports: [
    TableGridComponent
  ],
  imports: [
    CommonModule,
    AgGridModule.withComponents([]),
    DragToSelectModule,
    NzModalModule,
    NzIconModule,
    NzSpinModule,
    SpinnerRendererModule,
  ]
})
export class TableGridModule {
}
