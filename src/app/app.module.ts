import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import {TableGridModule} from "../table-grid/table-grid.module";
import { AgGridModule } from 'ag-grid-angular';
import {DragToSelectModule} from 'ngx-drag-to-select';
import {NzContextMenuServiceModule} from "ng-zorro-antd/dropdown";
import ru from "date-fns/locale/ru";
import {NZ_DATE_LOCALE, NZ_I18N, ru_RU} from "ng-zorro-antd/i18n";
import localeRu from '@angular/common/locales/ru';
import {registerLocaleData} from "@angular/common";
import {HttpClientModule} from "@angular/common/http";

registerLocaleData(localeRu, 'ru');

@NgModule({
  declarations: [
    AppComponent
  ],
    imports: [
      BrowserModule,
      NzContextMenuServiceModule,
      HttpClientModule,
      TableGridModule,
      AgGridModule.withComponents([]),
      DragToSelectModule.forRoot()
    ],
  providers: [
    {provide: NZ_I18N, useValue: ru_RU},
    {provide: NZ_DATE_LOCALE, useValue: ru},
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
