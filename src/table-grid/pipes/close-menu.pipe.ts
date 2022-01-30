import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'closeMenuPipe'
})
export class CloseMenuPipe implements PipeTransform {

  transform(value, selection) {
    return selection.elements.length ? value() : value;
  }

}
