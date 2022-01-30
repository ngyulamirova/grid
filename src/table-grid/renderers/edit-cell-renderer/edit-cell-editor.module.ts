import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {EditCellEditorComponent} from './edit-cell-editor.component';
import {FormsModule} from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule
  ],
  declarations: [EditCellEditorComponent]
})
export class EditCellEditorModule {
}
