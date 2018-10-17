import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeCustomerReportOldComponent } from './me-customer-report-old.component';

describe('MeCustomerReportOldComponent', () => {
  let component: MeCustomerReportOldComponent;
  let fixture: ComponentFixture<MeCustomerReportOldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeCustomerReportOldComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeCustomerReportOldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
