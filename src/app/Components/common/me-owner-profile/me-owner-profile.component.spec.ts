import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeOwnerProfileComponent } from './me-owner-profile.component';

describe('MeOwnerProfileComponent', () => {
  let component: MeOwnerProfileComponent;
  let fixture: ComponentFixture<MeOwnerProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeOwnerProfileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeOwnerProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
