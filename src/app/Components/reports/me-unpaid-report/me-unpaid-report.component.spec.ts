import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeUnpaidReportComponent } from './me-unpaid-report.component';

describe('MeUnpaidReportComponent', () => {
  let component: MeUnpaidReportComponent;
  let fixture: ComponentFixture<MeUnpaidReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeUnpaidReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeUnpaidReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
