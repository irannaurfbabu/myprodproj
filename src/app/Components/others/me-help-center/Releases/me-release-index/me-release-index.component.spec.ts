import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeReleaseIndexComponent } from './me-release-index.component';

describe('MeReleaseIndexComponent', () => {
  let component: MeReleaseIndexComponent;
  let fixture: ComponentFixture<MeReleaseIndexComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeReleaseIndexComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeReleaseIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
