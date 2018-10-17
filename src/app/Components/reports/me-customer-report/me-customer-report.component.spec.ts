import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeCustomerReportComponent } from './me-customer-report.component';

describe('MeCustomerReportComponent', () => {
  let component: MeCustomerReportComponent;
  let fixture: ComponentFixture<MeCustomerReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeCustomerReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeCustomerReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
