import {Directive, ElementRef, Input} from '@angular/core';
import * as Inputmask from 'inputmask';


@Directive({
  selector: '[app-restrict-input]',
})
export class RestrictInputDirective {

  // map of some of the regex strings I'm using (TODO: add your own)
  private regexMap = {
    integer: '^[0-9]*$',
    amount: '[0-9]{5}',
    float: '^[+-]?([0-9]*[.])?[0-9]+$',
    words: '([A-z]*\\s)*',
    point25: '^\-?[0-9]*(?:\\.25|\\.50|\\.75|)$',
    phone: '[6-9]{1}[0-9]{9}',
    month: '^0*([0-9]|[12][0-9]|3[01])$',
    word: '^([a-zA-Z_][a-zA-Z_ ]*[a-zA-Z_]$',
    alphanumeric: '^([a-zA-Z0-9_][a-zA-Z0-9_ ]*[a-zA-Z0-9_]$',

    // example: '^[^-\s](?=[A-Za-z0-9])([A-Za-z0-9\s]*)(?[A-Za-z0-9])$',
  };

  constructor(private el: ElementRef) {}

  @Input('app-restrict-input')
  public set defineInputType(type: string) {
    Inputmask({regex: this.regexMap[type], placeholder: ''})
      .mask(this.el.nativeElement);
  }

}
