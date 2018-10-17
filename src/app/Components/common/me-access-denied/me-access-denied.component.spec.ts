import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeAccessDeniedComponent } from './me-access-denied.component';

describe('MeAccessDeniedComponent', () => {
  let component: MeAccessDeniedComponent;
  let fixture: ComponentFixture<MeAccessDeniedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeAccessDeniedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeAccessDeniedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
