import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MePageNotFoundComponent } from './me-page-not-found.component';

describe('MePageNotFoundComponent', () => {
  let component: MePageNotFoundComponent;
  let fixture: ComponentFixture<MePageNotFoundComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MePageNotFoundComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MePageNotFoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
