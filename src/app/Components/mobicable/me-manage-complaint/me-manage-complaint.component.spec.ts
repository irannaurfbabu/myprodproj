import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeManageComplaintComponent } from './me-manage-complaint.component';

describe('MeManageComplaintComponent', () => {
  let component: MeManageComplaintComponent;
  let fixture: ComponentFixture<MeManageComplaintComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeManageComplaintComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeManageComplaintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
