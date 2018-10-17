import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MePaymentHistoryComponent } from './me-payment-history.component';

describe('MePaymentHistoryComponent', () => {
  let component: MePaymentHistoryComponent;
  let fixture: ComponentFixture<MePaymentHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MePaymentHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MePaymentHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
