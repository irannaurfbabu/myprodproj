import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeReleaseIndexSidebarComponent } from './me-release-index-sidebar.component';

describe('MeReleaseIndexSidebarComponent', () => {
  let component: MeReleaseIndexSidebarComponent;
  let fixture: ComponentFixture<MeReleaseIndexSidebarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeReleaseIndexSidebarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeReleaseIndexSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
