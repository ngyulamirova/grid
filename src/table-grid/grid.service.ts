import { Injectable } from '@angular/core';
import { formatDate } from '@angular/common';
import { ColDef } from 'ag-grid-community';
import {TimesEnum} from "../enums/enums";

@Injectable({
  providedIn: 'root'
})
export class GridService {
  days = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];
  colors = ['#fff', '#f0f8ff', '#e5f3ff', '#d5ecff', '#cae7ff', '#b8deff', '#7ec0fa', '#3ea5ff', '#2097ff', '#0088ff'];

  getWeek(data) {
    const onejan = +new Date(data.getFullYear(), 0, 1);
    const today = +new Date(data.getFullYear(), data.getMonth(), data.getDate());
    const dayOfYear = ((today - onejan + 86400000) / 86400000);
    return Math.ceil(dayOfYear / 7);
  }

  getGridTitle(start, end, total, granularity) {
    if (total) {
      return 'Все';
    } else {
      switch (granularity) {
        case TimesEnum.month: return this.days[start.getMonth()] + ' ' + start.getFullYear();
        case TimesEnum.quarter: {
          const month = start.getMonth();
          const year = start.getFullYear();
          const quarter = month < 3 ? 1 : month < 6 ? 2 : month < 9 ? 3 : 4;
          return `Q${quarter} ${year} `;
        }
        case TimesEnum.week: {
          return `${this.getWeek(start)}W ` +
            start.getDate() + ((start.getMonth() + 1).toString().length > 1 ? '.' : '.0') + (start.getMonth() + 1) + ` - ` +
            end.getDate() + ((end.getMonth() + 1).toString().length > 1 ? '.' : '.0') + (end.getMonth() + 1);
        }
        case TimesEnum.day: return start.getDate() + ((start.getMonth() + 1).toString().length > 1 ? '.' : '.0') + (start.getMonth() + 1) + '.' + start.getFullYear();
        default: return start.getDate() + ((start.getMonth() + 1).toString().length > 1 ? '.' : '.0') + (start.getMonth() + 1) + ` - ` +
          end.getDate() + ((end.getMonth() + 1).toString().length > 1 ? '.' : '.0') + (end.getMonth() + 1);
      }
    }
  }

  sortHeaders = (start, end) => {
    return (start > end) ? 1 : (start < end) ? -1 : 0;
  }

  getColumns(complexColumns, typesArr, measuring, FIRST_COL_NAME) {
    let data = [];
    complexColumns.forEach(() => {
      data = data.map(el => {
        if (el !== 'title') {
          return {
            field: el, caption: typesArr.find(({value}) => {
              return el.indexOf(value) > -1;
            }).label + ' ' + measuring
          };
        } else {
          return {field: FIRST_COL_NAME, header: 'Название'};
        }
      });
    });
    return data;
  }

  getChildren = (forecastTypes, total, ALL_COL_NAME, startDate, point, columnWidth): ColDef[] => forecastTypes.map(({value, label}, i) => {
    const field = total ? ALL_COL_NAME + value : formatDate(startDate, 'ddMMyyyy', 'ru') + value;
    return {
      headerName: label + ' ' + point,
      cellClass: i === (forecastTypes.length - 1) ? 'last-cell' : '',
      field,
      editable: true,
      width: columnWidth,
      valueName: label,
      cellRenderer: 'withPercentCell',
      cellRendererParams: params => ({
        additionalValue: params.data[`${field}%`],
        valueProps: params.data[`${field}Values`]
      }),
      cellEditor: 'editCell'
    };
  });

  addElementsToGridRow({end_date, total, values, start_date}, result, forecastTypeArr, metrics, allColumnName, cell_id, promo, params, addAllColumns = true) {
    forecastTypeArr.forEach(({value}) => {
      const props = (total ? allColumnName : formatDate(start_date, 'ddMMyyyy', 'ru')) + value;
      if (addAllColumns || (!addAllColumns && Object.keys(values).indexOf(value) > -1)) {
        const elementValue = values[value];
        result[`${props}Values`] = {
          ...elementValue,
          end_date, start_date, cell_id,
          report_type: value,
          promo_version_id: promo?.version_id,
          forecast_version_id: params?.forecast_version_ids && params?.forecast_version_ids[value],
          history_values: elementValue?.history_sales,
          old_values: elementValue?.sales
        };
        this.addDataToNode(result, props, metrics);
      }
    });
    return result;
  }

  addDataToNode(data, props, metrics) {
    const metricsValue = data[`${props}Values`]?.parameters && data[`${props}Values`]?.parameters[metrics];
    data[props] = metricsValue?.sales;
    data[`${props}%`] = metricsValue?.weight;
  }

  getCellStyle(params, gridState, selectedCells, mouseDown) {
    if (gridState) {
      const index = gridState.findIndex(({colId}) => colId === params.colDef.field);
      const cellStyleProps = {borderColor: null, backgroundColor: null};
      cellStyleProps['backgroundColor'] = this.colors.length >= params.data?.layout_level ? this.colors[params.data.layout_level - 1] : this.colors[this.colors.length - 1];
      if (selectedCells?.elements.find(({field, rowIndex}) => field === params.colDef.field && rowIndex === params.rowIndex)) cellStyleProps['borderColor'] = '#2196f3';
      else if (mouseDown && selectedCells?.elements.length && (params.colDef.field === mouseDown.colDef.field) && (params.rowIndex === mouseDown.rowIndex)) {
        cellStyleProps['borderColor'] = cellStyleProps['backgroundColor'];
        cellStyleProps['borderRightColor'] = params.colDef?.cellClass === 'last-cell' ? '#d4daf1' : cellStyleProps['backgroundColor'];
      }
      if (!index) cellStyleProps['borderColor'] = cellStyleProps['backgroundColor'];
      return cellStyleProps;
    }
    return null;
  }

  getParameters(params, level) {
    const parameters = {...params};
    delete parameters[level];
    return parameters;
  }

  addDataToTree(gridData, minLevel = 1, selectedId?) {
    let maxLevel = 1;
    gridData.forEach(({layout_level}) => (layout_level > maxLevel) && (maxLevel = layout_level));
    for (let i = maxLevel - 1; i >= minLevel; i--) gridData = gridData.map(el => {
      if ((el.layout_level === i) && el.id) return {
        ...el,
        _children: gridData.filter(({parentId}) => parentId && (parentId === el.id))
      };
      return el;
    });
    return gridData.filter(({layout_level, id}) => id && (layout_level === minLevel) && (!selectedId || id === selectedId));
  }

  sortTree = (gridTree, field, sort = 'asc') => gridTree.sort((a, b) => (a[field] > b[field]) && (sort === 'asc') || (a[field] < b[field]) && (sort === 'desc') ? 1 : -1).map(el => ({
    ...el,
    _children: (el._children?.length) && (el._children = this.sortTree(el._children, field, sort)) || []
  }));

  addTreeToList(tree, res) {
    if (tree) {
      tree.forEach(el => {
        res.push(el);
        if (el._children && el.open) this.addTreeToList(el?._children, res);
      });
      return tree;
    } else return [];
  }

  getAllDataAfterChange(res, allData, forecastTypes, metrics, ALL_COL_NAME, promo) {
    res.updated_data.forEach(updatedData => {
      const index = allData.findIndex(el => el.id === updatedData.id);
      const result = allData[index];
      if (result) {
        result.parametrs = result?.params ? result?.params : result.parametrs;
        updatedData.data.forEach(element => this.addElementsToGridRow(element, result, forecastTypes, metrics, ALL_COL_NAME, updatedData.id, promo, allData[index].parametrs, false));
        allData[index] = {...allData[index], ...result};
      }
    });
    return allData;
  }
}
