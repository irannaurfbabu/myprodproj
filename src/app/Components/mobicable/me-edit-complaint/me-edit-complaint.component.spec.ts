import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeEditComplaintComponent } from './me-edit-complaint.component';

describe('MeEditComplaintComponent', () => {
  let component: MeEditComplaintComponent;
  let fixture: ComponentFixture<MeEditComplaintComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeEditComplaintComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeEditComplaintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
