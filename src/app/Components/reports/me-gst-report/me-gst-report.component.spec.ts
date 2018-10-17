import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeGstReportComponent } from './me-gst-report.component';

describe('MeGstReportComponent', () => {
  let component: MeGstReportComponent;
  let fixture: ComponentFixture<MeGstReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeGstReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeGstReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
