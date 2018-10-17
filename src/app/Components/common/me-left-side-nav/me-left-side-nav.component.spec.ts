import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeLeftSideNavComponent } from './me-left-side-nav.component';

describe('MeLeftSideNavComponent', () => {
  let component: MeLeftSideNavComponent;
  let fixture: ComponentFixture<MeLeftSideNavComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeLeftSideNavComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeLeftSideNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
