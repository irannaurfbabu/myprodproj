import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeEditUserComponent } from './me-edit-user.component';

describe('MeEditUserComponent', () => {
  let component: MeEditUserComponent;
  let fixture: ComponentFixture<MeEditUserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeEditUserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeEditUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
