import { ChangeDetectionStrategy, Component } from '@angular/core';
import {ICellEditorParams } from 'ag-grid-community';
import {ICellEditorAngularComp} from 'ag-grid-angular';

@Component({
  selector: 'app-edit-cell-editor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'edit-cell-editor.component.html',
  styleUrls: ['edit-cell-editor.component.scss'],
})
export class EditCellEditorComponent implements ICellEditorAngularComp {

  params: ICellEditorParams;
  value = '';

  agInit = (params) => {
    this.params = params;
    this.value = params?.value?.toString().replace('.', ',');
  }

  getValue = () => this.value;

  refresh = (): boolean => false;
}
