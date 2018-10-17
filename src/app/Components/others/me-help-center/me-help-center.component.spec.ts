import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeHelpCenterComponent } from './me-help-center.component';

describe('MeHelpCenterComponent', () => {
  let component: MeHelpCenterComponent;
  let fixture: ComponentFixture<MeHelpCenterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeHelpCenterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeHelpCenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
