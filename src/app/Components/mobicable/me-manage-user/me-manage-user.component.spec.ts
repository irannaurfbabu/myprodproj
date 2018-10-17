import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeManageUserComponent } from './me-manage-user.component';

describe('MeManageUserComponent', () => {
  let component: MeManageUserComponent;
  let fixture: ComponentFixture<MeManageUserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeManageUserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeManageUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
