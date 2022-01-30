import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

interface Params extends ICellRendererParams {
  open?;
  next_level?;
}

@Component({
  selector: 'app-name-cell-renderer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'name-cell-renderer.component.html',
  styleUrls: ['name-cell-renderer.component.scss'],
})
export class NameCellRendererComponent implements ICellRendererAngularComp {

  params: Params;

  agInit = (params: Params) => this.params = params;

  refresh = (): boolean => false;
}
