import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeBarcodeComponent } from './me-barcode.component';

describe('MeBarcodeComponent', () => {
  let component: MeBarcodeComponent;
  let fixture: ComponentFixture<MeBarcodeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeBarcodeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeBarcodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
