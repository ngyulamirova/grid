import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ILoadingOverlayParams } from 'ag-grid-community';
import { ILoadingOverlayAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-spinner-renderer',
  templateUrl: './spinner-renderer.component.html',
  styleUrls: ['./spinner-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpinnerRendererComponent  implements ILoadingOverlayAngularComp  {

  private params: ILoadingOverlayParams;

  agInit(params: ILoadingOverlayParams): void {
    this.params = params;
  }
}
