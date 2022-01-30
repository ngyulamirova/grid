import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef, Input, OnChanges, SimpleChanges,
  ViewChild
} from '@angular/core';
import { catchError, finalize, tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { CellValueChangedEvent, GridOptions } from 'ag-grid-community';
import { WithPercentCellRendererComponent } from './renderers/with-percent-cell-renderer';
import { NameCellRendererComponent } from './renderers/name-cell-renderer';
import { GridService } from './grid.service';
import { OptionsEnum } from './renderers/with-percent-cell-renderer/options.enum';
import { SpinnerRendererComponent } from './renderers/spinner-renderer/spinner-renderer.component';
import { RowNode } from 'ag-grid-community/dist/lib/entities/rowNode';
import { EditCellEditorComponent } from './renderers/edit-cell-renderer';
import {ConfigService} from "./renderers/config-service.service";
import {MenuAvailableActionsEnum, MetricsEnum} from "../enums/enums";

const ALL_COL_NAME = 'ALL_AGGREGATED';
const FIRST_COL_NAME = 'name';
const ALL_COL_TITLE = 'Все';
const FIRST_COLUMN_WIDTH = 240;

@Component({
  selector: 'app-table-grid',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'table-grid.component.html',
  styleUrls: ['table-grid.component.scss']
})
export class TableGridComponent implements OnChanges{

  @ViewChild('grid') gridTmp: ElementRef;
  @Input() promo;
  @Input() params;
  @Input() metrics;
  @Input() type;
  @Input() baseForecastVersion;
  @Input() regularForecastVersion;
  @Input() granularity;
  @Input() point;
  forecastTypes;
  editValue;
  modalData;
  cellMouseDownSelected;
  actionTypes = OptionsEnum;
  allCollName = ALL_COL_NAME;
  metricsEnum = MetricsEnum;
  public selectedCells = { rowNodes: [], columns: [], elements: [] };

  @Input() set rawCells(element) {
    const selectedValue = element.find(({checked}) => checked);
    this.forecastTypes = selectedValue.value === 'all' ? element.filter(({value}) => value !== 'all') : element.filter(({checked}) => checked);
  }
  allData$: Observable<any>;
  addingData$: Observable<any>;
  changeCellProps$: Observable<any>;
  sortedList;
  cellParams = {rowHeight: 57, columnWidth: 196};
  loadingOverlayComponent = 'spinnerRendererComponent';

  gridOptions: GridOptions = {
    rowHeight: this.cellParams.rowHeight,
    headerHeight: this.cellParams.rowHeight,
    context: this,
    overlayNoRowsTemplate: 'Ничего не найдено',
    animateRows: true,
    getRowNodeId: ({id}) => id,
    frameworkComponents: {
      withPercentCell: WithPercentCellRendererComponent,
      nameCell: NameCellRendererComponent,
      spinnerRendererComponent: SpinnerRendererComponent,
      editCell: EditCellEditorComponent,
    },
    defaultColDef: {
      sortable: true,
      suppressMovable: true,
      comparator: () => 0,
      cellStyle: (params) => this.gridService?.getCellStyle(params, this.gridOptions?.columnApi?.getColumnState(), this.selectedCells, this.cellMouseDownSelected),
      valueFormatter: ({value}) => (value || value === 0) ? value : '-'
    }
  };

  constructor(
    private gridService: GridService,
    private configService: ConfigService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    const res = {};
    Object.keys(changes).forEach(el => (res[el] = changes[el].currentValue));
    console.log(JSON.stringify(res));
    this.gridOptions?.api?.stopEditing();
    if ((!changes.params || changes.params?.firstChange) && this.metrics && (changes.metrics?.firstChange || !changes.metrics) && this.params && this.forecastTypes) this.getGridData();
    else if (changes.metrics) this.refreshMetricData();
  }

  getGridColumns = (columns) => this.gridOptions.columnApi && this.gridOptions.columnApi['columnController']?.columnDefs?.forEach(({children}) => children.forEach(({field}) => (field !== FIRST_COL_NAME) && columns.push(field)));

  getGridData(){
    this.selectedCells = {rowNodes: [], columns: [], elements: []};
    this.modalData = null;
    this.editValue = null;
    this.showLoading();
    this.allData$ = this.configService.getGridData().pipe(
      tap((data) => {
        setTimeout(() => {
          this.gridOptions.api.setColumnDefs(data?.colGroupDefs);
          this.gridOptions.api.setRowData(data?.rowData);
        });
      }),
      finalize(() => this.hideLoading())
    );
  }

  resizeGrid() {
    const columns = [];
    this.getGridColumns(columns);
    const windowWidth = this.gridOptions.columnApi['columnController'].scrollWidth - 9;
    if (columns.length * this.cellParams.columnWidth < windowWidth) {
      this.cellParams = {...this.cellParams, columnWidth: (windowWidth / columns.length)};
      columns.forEach(column => this.gridOptions.columnApi.setColumnWidth(column, this.cellParams.columnWidth, true));
    }
  }

  refreshMetricData() {
    const columns = [];
    this.getGridColumns(columns);
    this.gridOptions.columnApi.applyColumnState({defaultState: { sort: null }});
    this.gridOptions.api.forEachNode(node => {
      columns.forEach((props) => this.gridService.addDataToNode(node.data, props, this.metrics));
      node.setData(node.data);
    });
    this.gridOptions.api.setColumnDefs(this.gridOptions.columnApi['columnController'].columnDefs.map(el => (el.headerName ? {...el, children: el.children?.map((child) => ({...child, headerName: child.valueName + ' ' + this.point, width: this.cellParams.columnWidth}))} : el)));
  }

  changeStatus(elements, value) {
    this.showLoading();
    const allData = [];
    this.getAllGridData(allData);
    // this.changeCellProps$ = this.overviewService.approveChange(this.params, elements, value, this.granularity, allData, this.forecastTypes, this.metrics, ALL_COL_NAME, this.promo).pipe(
    //   tap(rowData => {
    //     this.gridOptions.api.setRowData(rowData);
    //     elements.forEach(item => this.findRow(item, rowData));
    //   }),
    //   finalize(() => this.hideLoading())
    // );
  }

  changeElementValue(elements, type) {
    this.modalData = {elements, type, value: 0};
    this.cdr.markForCheck();
  }

  lockCellValue(data, value) {
    // this.changeCellProps$ = this.overviewService.lockCellsEditing(this.params, data, value, this.granularity, this.hideRows(data), this.forecastTypes, this.metrics, ALL_COL_NAME, this.promo).pipe(
    //   tap(rowData => {
    //     this.dataChange.emit();
    //     this.gridOptions.api.setRowData(rowData);
    //     data.forEach(item => this.findRow(item, rowData));
    //   }),
    //   finalize(() => this.hideLoading()));
  }

  undoChanges(data) {
    // this.changeCellProps$ = this.overviewService.clearTable(this.params, data, this.granularity, this.metrics, this.hideRows(data), this.forecastTypes, ALL_COL_NAME, this.promo).pipe(
    //   tap(rowData => {
    //     if (data.find(item => item.id === ALL_COL_NAME)) this.dataChange.emit(ALL_COL_NAME);
    //     else this.dataChange.emit();
    //     this.gridOptions.api.setRowData(rowData);
    //     data.forEach(item => this.findRow(item, rowData));
    //   }),
    //   finalize(() => this.hideLoading()));
  }

  addNotifications = (elements, type) => this.modalData = {elements, type, value: elements.length > 1 ? '' : elements[0].comment};

  delNotifications(elements, _) {
    this.addInnerSpinner('notificationSpinner', elements);
    this.showLoading();
    // this.changeCellProps$ = this.overviewService.delNotifications(this.params, elements, this.granularity).pipe(
    //   tap(() => this.delInnerSpinner('notificationSpinner', elements, null)),
    //   finalize(() => this.hideLoading()));
  }

  cellValueChanged(event: CellValueChangedEvent) {
    if (event.newValue || event.newValue === '' ) {
      const cellProps = event.data[`${event.colDef.field}Values`];
      const newValue = (typeof event.newValue === 'number') ? event.newValue : +(event.newValue.replace(/ /g, '')).replace(',', '.');
      if (!isNaN(newValue) && (this.metrics === MetricsEnum.sssg || this.metrics === MetricsEnum.ssacg || this.metrics === MetricsEnum.sstg || newValue >= 0) && event.oldValue !== newValue && !cellProps.fix && event?.data[`${event.colDef.field}Values`]?.parameters[this.metrics]?.available_actions?.find(el => el === MenuAvailableActionsEnum.correct)) {
        this.showLoading();
        const allData = [];
        this.getAllGridData(allData);
        // this.changeCellProps$ = this.overviewService.updateDynamicTableElement(this.params, this.granularity, this.metrics, newValue, event, cellProps, allData, this.forecastTypes, this.metrics, ALL_COL_NAME, this.promo).pipe(
        //   tap(rowData => {
        //     if (event.data.id.split('###')[0] === 'ALL_AGGREGATED') this.dataChange.emit('ALL_AGGREGATED');
        //     else this.dataChange.emit();
        //     this.dataChange.emit(true);
        //     this.gridOptions.api.setRowData(rowData);
        //     const rowNode = this.gridOptions.api.getRowNode(event.node.id);
        //     if (rowNode.data.open) this.delRows(event.rowIndex, rowNode);
        //     if (rowNode.data.name === ALL_COL_TITLE) this.gridOptions.api.forEachNode(node => {
        //       this.delRows(node.rowIndex, node);
        //       node.data._children = [];
        //     });
        //     if (rowNode.data?._children.length) rowNode.data._children = [];
        //   }),
        //   finalize(() => this.hideLoading()));
        event.node.setData({...event.node.data, [event.column['userProvidedColDef'].field]: newValue});
      } else event.node.setData({...event.node.data, [event.column['userProvidedColDef'].field]: event.oldValue});
    }
  }

  chooseRowAction(event) {
    if (event.colDef.field === FIRST_COL_NAME && event.value !== ALL_COL_NAME && event.data.next_level) {
      const rowNode = this.gridOptions.api.getRowNode(event.node.id);
      this.selectCells({rowNodes: [], columns: [], elements: []});
      if (!rowNode.data.open) {
        if (!rowNode.data?._children.length && rowNode.data.name !== ALL_COL_TITLE) this.addRows(rowNode);
        else this.showChildrenRows(rowNode);
      } else this.delRows(event.rowIndex, rowNode);
    }
  }

  checkIfEditingIsPossible(event) {
    if (!event?.data[`${event.colDef.field}Values`]?.parameters[this.metrics]?.available_actions?.find(el => el === MenuAvailableActionsEnum.correct)) {
      this.gridOptions?.api?.stopEditing();
    }
  }

  showChildrenRows(rowNode) {
    let addIndex;
    this.gridOptions.api.forEachNode(({data}, index) => { if (data.id === rowNode.data.id) addIndex = index; });
    const gridData = [];
    this.getAllGridData(gridData);
    if (addIndex || (addIndex === 0)) this.gridOptions.api.applyTransaction({
      add: rowNode.data._children,
      addIndex: addIndex + 1,
    });
    rowNode.setData({...rowNode.data, open: true});
    this.cdr.markForCheck();
  }

  delRows(rowIndex, rowNode) {
    const gridData = [];
    this.getAllGridData(gridData);
    const newChildren = this.getRowChildren(rowIndex, rowNode.data).filter(({id}) => gridData.find(el => el.id));
    rowNode.setData({...rowNode.data, _children: newChildren && newChildren[0]?.id ? this.delRowSpinner(newChildren) : [], open: false});
    this.gridOptions.api.applyTransaction({remove: newChildren});
    this.gridOptions.api.refreshCells({force: true});
    this.addingData$ = of([]);
    this.cdr.markForCheck();
  }

  addRows(rowNode) {
    this.closeEmptyRows();
    const {layout_level, next_level, params, id} = rowNode.data;
    rowNode.setData({...rowNode.data, open: true});
    const loadingData = {};
    for (const el in rowNode.data)  loadingData[el] = null;
    loadingData['loading'] = true;
    loadingData['parentId'] = rowNode.data.id;
    rowNode.data._children = [loadingData];
    this.showChildrenRows(rowNode);
    this.gridOptions.api.refreshCells({rowNodes: [rowNode], columns: [FIRST_COL_NAME], force: true});
    // this.addingData$ = this.overviewService.getDynamicTableInnerRows(
    //   {...this.params, layout_level, parameters: this.gridService.getParameters(params, next_level), layout_type: this.params?.layout_type, aggregate_all: false, granularity: this.granularity},
    //   ALL_COL_NAME, this.forecastTypes, this.metrics, this.promo, this.params, this.type, this.baseForecastVersion, this.regularForecastVersion, id)
    //   .pipe(
    //     tap((addingArr) => {
    //       this.gridOptions.api.applyTransaction({remove: [loadingData]});
    //       if (addingArr.length) {
    //         rowNode.data._children = [...addingArr];
    //         this.showChildrenRows(rowNode);
    //       }
    //       else rowNode.setData({...rowNode.data, next_level: null, open: false});
    //     }), catchError(() => { this.gridOptions.api.applyTransaction({remove: [loadingData]}); this.closeEmptyRows(); return of(); }));
    this.cdr.markForCheck();
  }

  closeEmptyRows() {
    this.gridOptions.api.forEachNode(node => {if (node.data.open && (!node.data._children.length || (node.data._children.length === 1 && node.data._children[0].name === null))) {
      this.gridOptions.api.applyTransaction({remove: node.data._children});
      node.setData({...{...node.data, _children: []}, open: false});
    }
    });
  }

  getRowChildren(rowIndex, {layout_level, id}) {
    const data = [];
    this.getAllGridData(data);
    const treeChildren = this.gridService.addDataToTree(data, layout_level, id)[0]?._children;
    const children = [];
    this.gridService.addTreeToList(treeChildren, children);
    return children;
  }

  selectCells(selected) {
    if (selected.elements.length) setTimeout(() => this.drawSelection(selected));
    else this.drawSelection(selected);
  }

  drawSelection(selected) {
    const prevSelection = {...this.selectedCells};
    this.selectedCells = selected;
    this.gridOptions.api.refreshCells({rowNodes: prevSelection.rowNodes, columns: prevSelection.columns, force: true});
    this.gridOptions.api.refreshCells({rowNodes: this.selectedCells.rowNodes, columns: this.selectedCells.columns, force: true});
    this.cdr.markForCheck();
  }


  closeCellsEditing(wasEdited) {
    if (wasEdited) {
      this.modalData.elements = this.modalData.elements.map(el => ({...el, new_value: this.modalData.value}));
      this.updateItemsAfterChange();
    } else this.modalData = null;
  }

  closeRelativelyCells(wasEdited) {
    if (wasEdited) {
      this.modalData.elements = this.modalData.elements.map((el) => ({...el, new_value: el.parameters[this.metrics].sales * (1 + this.modalData.value / 100)}));
      this.updateItemsAfterChange();
    } else this.modalData = null;
  }

  closeComment(data) {
    if (data) {
      this.addInnerSpinner('notificationSpinner', this.modalData.elements);
      const modalData = {...this.modalData};
      this.modalData = null;
      // this.changeCellProps$ = this.overviewService.addNotifications(this.params, modalData, this.granularity, data).pipe(
      //   tap(() => this.delInnerSpinner('notificationSpinner', modalData.elements, data)),
      //   catchError(() => {
      //     this.delInnerSpinner('notificationSpinner', modalData.elements, null);
      //     return of();
      //   }),
      //   finalize(() => {
      //     this.hideLoading();
      //   }));
    } else this.modalData = null;
  }

  updateItemsAfterChange() {
    this.showLoading();
    const modalData = {...this.modalData};
    this.modalData = null;
    const allData = [];
    this.getAllGridData(allData);
    // this.changeCellProps$ = this.overviewService.updateGridItems(this.params, modalData, this.granularity, this.metrics, allData, this.forecastTypes, this.metrics, ALL_COL_NAME, this.promo, this.params).pipe(
    //   tap(rowData => {
    //     this.gridOptions.api.setRowData(rowData);
    //     modalData.elements.forEach(item => this.findRow(item, rowData));
    //   }),
    //   finalize(() => this.hideLoading()));
  }

  getSortData() {
    this.selectCells({rowNodes: [], columns: [], elements: []});
    let gridData = [];
    this.getAllGridData(gridData);
    const loadingData = gridData.find(({loading}) => loading);
    if (!!loadingData) {
      this.addingData$ = of([]);
      this.closeEmptyRows();
      gridData = [];
      this.getAllGridData(gridData);
    }
    const selectedRow = this.gridOptions.columnApi.getColumnState().find(el => el.sort);
    const {colId, sort} = selectedRow ? selectedRow : {colId: FIRST_COL_NAME, sort: 'asc'};
    const gridTree = this.gridService.addDataToTree(gridData);
    const sortedTree = this.gridService.sortTree(gridTree, colId, sort);
    this.sortedList = [];
    this.gridService.addTreeToList(sortedTree, this.sortedList);
    this.gridOptions.api.setRowData([this.sortedList.find(({name}) => name === ALL_COL_TITLE), ...this.sortedList.filter(({name}) => name !== ALL_COL_TITLE)]);
    this.cdr.markForCheck();
  }

  addInnerSpinner(property, selectedCells) {
    this.gridOptions.api.forEachNode(node => {
      const nodeData = {...node.data};
      const selected = this.selectedCells?.elements?.length ? this.selectedCells.elements : selectedCells;
      selected?.forEach(({field, cell_id}) => {
        if (nodeData[`${field}Values`]?.cell_id === cell_id) {
          nodeData[`${field}Values`] = {...nodeData[`${field}Values`], [property]: true};
          node.setData(nodeData);
        }
      });
    });
    this.cdr.markForCheck();
  }

  delInnerSpinner(property, selectedCells, comment) {
    this.gridOptions.api.forEachNode(node => {
      const nodeData = {...node.data};
      const selected = this.selectedCells?.elements?.length ? this.selectedCells.elements : selectedCells;
      selected?.forEach(({field, cell_id}) => {
        if (nodeData[`${field}Values`]?.cell_id === cell_id) {
          nodeData[`${field}Values`] = {...nodeData[`${field}Values`], [property]: false, comment};
          node.setData(nodeData);
        }
      });
    });
    this.cdr.markForCheck();
  }

  delRowSpinner(children) {
    children.forEach(row => {
      if (!row.id) {
        const parentNodeId = children.findIndex(({id}) => id === row.parentId);
        children[parentNodeId]._children = [];
        children[parentNodeId].open = false;
      }
    });
    return [...children.filter(({id}) => id)];
  }

  hideRows(data) {
    if (data.find(({name}) => name === ALL_COL_TITLE)) {
      this.gridOptions.api.forEachNode((rowNode: RowNode, index: number) => {if (+rowNode.data.layout_level === 1) {this.delRows(index, rowNode)}});
      this.showLoading();
      const allData = [];
      this.getAllGridData(allData);
      return allData.map(el => ({...el, _children: []}));
    } else {
      this.gridOptions.api.forEachNode((rowNode: RowNode, index: number) => {if (data.find(({id}) => rowNode.data.id === id)) {this.delRows(index, rowNode)}});
      this.showLoading();
      const allData = [];
      this.getAllGridData(allData);
      return allData.map(el => (data.find(({id}) => el.id === id) ? {...el, _children: []} : el));
    }
  }

  getAllGridData = (gridData) => this.gridOptions.api.forEachNode(({data}) => gridData.push(data));

  delSortParams = () => setTimeout(() => this.getSortData());

  showLoading = () => {
    this.gridOptions?.api?.showLoadingOverlay();
    this.gridOptions?.api?.stopEditing();
  }

  hideLoading = () => this.gridOptions?.api?.hideOverlay();

  findRow(item, rowData) {
    if (item.name === ALL_COL_TITLE) this.gridOptions.api.forEachNode(node => {
      this.delRows(node.rowIndex, node);
      node.data._children = [];
    });
    if (item.id) this.delRowNode(item, item.id);
    else rowData.filter(({id}) => item.cell_id === id.split('###')[0]).forEach(({id}) => this.delRowNode(item, id));
  }

  delRowNode(item, id) {
    const rowNode = this.gridOptions.api.getRowNode(id);
    if (rowNode?.data.open) this.delRows(item.rowIndex, rowNode);
    if (rowNode?.data._children.length) rowNode.data._children = [];
  }
}
