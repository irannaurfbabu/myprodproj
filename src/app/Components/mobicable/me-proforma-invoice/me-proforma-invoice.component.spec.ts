import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeProformaInvoiceComponent } from './me-proforma-invoice.component';

describe('MeProformaInvoiceComponent', () => {
  let component: MeProformaInvoiceComponent;
  let fixture: ComponentFixture<MeProformaInvoiceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeProformaInvoiceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeProformaInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
