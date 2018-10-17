import {Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ViewEncapsulation} from '@angular/core'
import {DEFAULT_TEMPLATE, DEFAULT_STYLES} from './template';

/**
 * The default pagination controls component. Actually just a default implementation of a custom template.
 */
@Component({
    selector: 'pagination-control',
    template: DEFAULT_TEMPLATE,
    styles: [DEFAULT_STYLES],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class MePaginationComponent {

    @Input() id: string;
    @Input() maxSize: number = 7;
    @Input()
    get directionLinks(): boolean {
        return this._directionLinks;
    }
    set directionLinks(value: boolean) {
        this._directionLinks = !!value && <any>value !== 'false';
    }
    @Input()
    get autoHide(): boolean {
        return this._autoHide;
    }
    set autoHide(value: boolean) {
        this._autoHide = !!value && <any>value !== 'false';
    }
    @Input() previousLabel: string = '';
    @Input() nextLabel: string = '';
    @Input() screenReaderPaginationLabel: string = 'Pagination';
    @Input() screenReaderPageLabel: string = 'page';
    @Input() screenReaderCurrentLabel: string = `You're on page`;
    @Output() pageChange: EventEmitter<number> = new EventEmitter<number>();

    private _directionLinks: boolean = true;
    private _autoHide: boolean = false;
}
