import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeLoginComponent } from './me-login.component';

describe('MeLoginComponent', () => {
  let component: MeLoginComponent;
  let fixture: ComponentFixture<MeLoginComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeLoginComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
