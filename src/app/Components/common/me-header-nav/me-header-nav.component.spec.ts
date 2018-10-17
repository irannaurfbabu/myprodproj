import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeHeaderNavComponent } from './me-header-nav.component';

describe('MeHeaderNavComponent', () => {
  let component: MeHeaderNavComponent;
  let fixture: ComponentFixture<MeHeaderNavComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeHeaderNavComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeHeaderNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
