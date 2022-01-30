import { Directive, ElementRef, Input, EventEmitter, Output, OnInit } from '@angular/core';
import { fromEvent } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { CellMouseDownEvent } from 'ag-grid-community';

const CLASS_NAMES = ['ag-header-group-text', 'ag-header-cell-resize', 'ag-header-group-cell-label', 'ag-header-cell-label', 'ag-header-cell-text', 'ag-header-group-cell', 'ag-header-cell', 'ag-header-group-cell-with-group' ];

@Directive({
  selector: '[appSelectCells]'
})
export class SelectCellsDirective implements OnInit {
  @Input() cellMouseDownSelected: CellMouseDownEvent;
  @Input() cellParams: { rowHeight, columnWidth };
  @Input() gridOptions;
  @Input() metrics;
  @Input() selectedCells;
  @Output() cellMouseDownSelectedChange = new EventEmitter<CellMouseDownEvent>();
  @Output() selectedDataChange = new EventEmitter();
  firstClickParams;

  constructor(private el: ElementRef) {}

  ngOnInit() {
    const mouseDown$ = fromEvent(this.el.nativeElement, 'mousedown');
    const mouseUp$ = fromEvent(this.el.nativeElement, 'mouseup');
    const click$ = fromEvent(this.el.nativeElement, 'click');
    const clickStream$ = click$.pipe(
      tap((e: MouseEvent) => this.firstEventHandler(e)));
    const stream$ = mouseDown$.pipe(
      tap((e: MouseEvent) => this.firstEventHandler(e)),
      switchMap(() => this.firstClickParams ? mouseUp$ : null));

    clickStream$.subscribe((event: MouseEvent) =>  (event.ctrlKey || event.metaKey) ? this.getSelection(event, false) : this.selectedDataChange.emit({rowNodes: [], columns: [], elements: []}));
    stream$.subscribe((event: MouseEvent) => !event.ctrlKey && !event.metaKey && this.getSelection(event, true));

  }

  getRows(minRow, maxRow) {
    const rows = [];
    this.gridOptions.api.forEachNode((node, index) => {
      if ((index >= minRow) && (index <= maxRow)) rows.push(node);
    });
    return rows;
  }

  getElements(rows, columns) {
    const elements = [];
    rows.forEach(({data, rowIndex}) => columns.forEach(field => {
      if (data[`${field}Values`] && data[`${field}Values`]?.parameters[this.metrics]?.available_actions.length) elements.push({...data[`${field}Values`], ...data[field], params: data.params, layout_level: data.layout_level, field, rowIndex});
    }));
    return elements;
  }
  countColumns = (clientX, offsetX, columnId) =>  Math.max(Math.ceil((clientX - offsetX - this.firstClickParams?.clientX) / this.cellParams.columnWidth) + columnId, 0);

  countRows = (clientY, offsetY, rowIndex) => Math.max(Math.ceil((clientY - offsetY - this.firstClickParams?.clientY) / this.cellParams.rowHeight) + rowIndex, 0);

  firstEventHandler(e) {
    let display = 'block';
    if (typeof e.target['className'] === 'string' && CLASS_NAMES.find(el => e?.target && e.target['className']?.indexOf(el) > -1)) display = 'none';
    else this.firstClickParams = e;
    this.el.nativeElement.parentElement.lastChild.style.display = display;
  }

  getSelection(event, selection) {
    const {clientX, clientY, button, offsetX, offsetY} = event;
    if (!button) {
      const allRows = event['toElement'] && (event['toElement'].className === 'ag-center-cols-viewport' || event['toElement'].className === 'ag-body-viewport');
      if (allRows) this.selectedDataChange.emit({rowNodes: [], columns: [], elements: []});
       else {
        if (this.cellMouseDownSelected && this.cellMouseDownSelected.colDef?.field !== 'name') {
          const columnState = this.gridOptions.columnApi.getColumnState();
          const columnId = columnState.findIndex(({colId}) => colId === this.cellMouseDownSelected.colDef.field);
          const {lastRow, lastColumn} = {
            lastRow: this.countRows(clientY, offsetY, this.cellMouseDownSelected.rowIndex),
            lastColumn: this.countColumns(clientX, offsetX, columnId)
          };
          if (selection) {
            const {minRow, maxRow, minColumn, maxColumn} = {
              minRow: Math.min(lastRow, this.cellMouseDownSelected.rowIndex),
              maxRow: Math.max(lastRow, this.cellMouseDownSelected.rowIndex),
              minColumn: Math.min(lastColumn ? lastColumn : 1, columnId),
              maxColumn: Math.max(lastColumn, columnId)
            };
            const {rowNodes, columns} = {
              rowNodes: this.getRows(minRow, maxRow),
              columns: columnState.slice(minColumn, maxColumn + 1).map(({colId}) => colId)
            };
            if ((minRow !== maxRow) || (minColumn !== maxColumn)) {
              this.selectedDataChange.emit({rowNodes, columns, elements: this.getElements(rowNodes, columns)});
            } else this.selectedDataChange.emit({rowNodes: [], columns: [], elements: []});
          }
          else this.getControlElements(lastRow, lastColumn, columnState);
        }
        this.cellMouseDownSelectedChange.emit(null);
        this.firstClickParams = null;
      }
    }
  }

  getControlElements(lastRow, lastColumn, columnState) {
    const rows = this.getRows(lastRow, lastRow);
    const columns = columnState.slice(lastColumn, lastColumn + 1).map(({colId}) => colId);
    const id = this.selectedCells.elements.findIndex(({field, rowIndex}) => (field === columns[0]) && (rowIndex === rows[0].rowIndex));
    if (id > -1) this.selectedDataChange.emit({rowNodes: this.selectedCells.rowNodes, columns: this.selectedCells.columns, elements: [...this.selectedCells.elements.filter((_, i) => i !== id)]});
    else this.selectedDataChange.emit({rowNodes: [...this.selectedCells.rowNodes, ...rows ], columns: [...this.selectedCells.columns, ...columns ], elements: [...this.getElements(rows, columns), ...this.selectedCells.elements]});
  }
}
