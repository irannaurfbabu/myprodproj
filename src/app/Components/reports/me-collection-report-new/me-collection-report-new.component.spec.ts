import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeCollectionReportNewComponent } from './me-collection-report-new.component';

describe('MeCollectionReportNewComponent', () => {
  let component: MeCollectionReportNewComponent;
  let fixture: ComponentFixture<MeCollectionReportNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeCollectionReportNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeCollectionReportNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
