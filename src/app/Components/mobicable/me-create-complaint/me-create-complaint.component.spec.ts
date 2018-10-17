import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeCreateComplaintComponent } from './me-create-complaint.component';

describe('MeCreateComplaintComponent', () => {
  let component: MeCreateComplaintComponent;
  let fixture: ComponentFixture<MeCreateComplaintComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeCreateComplaintComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeCreateComplaintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
