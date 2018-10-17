import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeCreateUserComponent } from './me-create-user.component';

describe('MeCreateUserComponent', () => {
  let component: MeCreateUserComponent;
  let fixture: ComponentFixture<MeCreateUserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeCreateUserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeCreateUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
