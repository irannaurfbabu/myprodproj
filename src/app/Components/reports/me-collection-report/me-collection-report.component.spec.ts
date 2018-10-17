import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeCollectionReportComponent } from './me-collection-report.component';

describe('MeCollectionReportComponent', () => {
  let component: MeCollectionReportComponent;
  let fixture: ComponentFixture<MeCollectionReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeCollectionReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeCollectionReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
