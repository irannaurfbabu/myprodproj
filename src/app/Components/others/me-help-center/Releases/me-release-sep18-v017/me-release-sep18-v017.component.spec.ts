import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeReleaseSep18V017Component } from './me-release-sep18-v017.component';

describe('MeReleaseSep18V017Component', () => {
  let component: MeReleaseSep18V017Component;
  let fixture: ComponentFixture<MeReleaseSep18V017Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeReleaseSep18V017Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeReleaseSep18V017Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
