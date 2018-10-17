import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeCollectPaymentComponent } from './me-collect-payment.component';

describe('MeCollectPaymentComponent', () => {
  let component: MeCollectPaymentComponent;
  let fixture: ComponentFixture<MeCollectPaymentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeCollectPaymentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeCollectPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
