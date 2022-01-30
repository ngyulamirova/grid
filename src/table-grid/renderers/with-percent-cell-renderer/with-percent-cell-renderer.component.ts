import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { NzContextMenuService, NzDropdownMenuComponent } from 'ng-zorro-antd/dropdown';
import { GridService } from '../../grid.service';
import { FixedEnum, OptionsEnum } from './options.enum';
import {ActionTypes, MenuAvailableActionsEnum} from "../../../enums/enums";

interface Params extends ICellRendererParams {
  additionalValue?: number;
  valueProps?: any;
}

@Component({
  selector: 'app-with-percent-cell-renderer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'with-percent-cell-renderer.component.html',
  styleUrls: ['with-percent-cell-renderer.component.scss']
})
export class WithPercentCellRendererComponent implements ICellRendererAngularComp {

  params: Params;
  actionTypes = OptionsEnum;
  actions = ActionTypes;
  menuActions = MenuAvailableActionsEnum;
  showInMenu = {};
  fixActions = FixedEnum;

  agInit = (params: Params) => this.params = params;

  refresh = (): boolean => false;

  constructor(
    private nzContextMenuService: NzContextMenuService,
    private gridService: GridService
  ) {}

  contextMenu($event: MouseEvent, menu: NzDropdownMenuComponent): void {
    const selectedCells = this.params.context.selectedCells?.elements;
    if (!selectedCells.find(({field, rowIndex}) => field === this.params.colDef.field && rowIndex === this.params.rowIndex)) {
      this.showInMenu = {};
      this.params.context.selectCells({rowNodes: [], columns: [], elements: []});
    }
    this.getShowParams(selectedCells);
    if (Object.keys(this.showInMenu).filter(el => this.showInMenu[el]).length) this.nzContextMenuService.create($event, menu);
  }

  closeMenu = () => { this.showInMenu = {}; this.nzContextMenuService.close(); };

  getShowParams(selectedCells) {
    if (this.getIfLevelsEqual(this.params.context.selectedCells?.elements)) {
      if (selectedCells.length) {
        selectedCells.forEach(({parameters}, i) => {
          if (!i) parameters[this.params.context.metrics]?.available_actions?.forEach(el => this.showInMenu[el] = true);
          else for (const prop in this.showInMenu) !parameters[this.params.context.metrics]?.available_actions.find( el => el === prop) && (this.showInMenu[prop] = false);
        });
        this.showInMenu[MenuAvailableActionsEnum.uncomment] = !selectedCells.find( ({comment}) => !comment);
      }
      else {
        this.params.valueProps?.parameters && this.params.valueProps?.parameters[this.params.context.metrics]?.available_actions?.forEach(el => this.showInMenu[el] = true);
        this.showInMenu[MenuAvailableActionsEnum.uncomment] = this.params.valueProps?.comment;
      }
    } else this.showInMenu = {};
  }

  getIfLevelsEqual(elements) {
    if (elements && elements[0]) {
      const level = elements[0].layout_level;
      for (const element of elements) if (element.layout_level !== level) return false;
      const allRowLength =  elements.filter(({cell_id}) => cell_id === this.params.context.allCollName).length;
      const allColumnLength = elements.filter(({field}) => field.indexOf(this.params.context.allCollName) > -1).length;
      if (allRowLength && (allRowLength !== elements.length)) return false;
      if (allColumnLength && (allColumnLength !== elements.length)) return false;
    }
    return true;
  }

  selectOption(option, value?) {
    const {id, layout_level, name, next_level, open, params, this_level} = this.params.data;
    this.params.context[option](this.params.context.selectedCells?.elements?.length ? this.params.context.selectedCells.elements : [{...this.params.valueProps, id, layout_level, name, next_level, open, params, this_level, field: this.params.colDef.field}], value);
  }
}
