import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeHomeComponent } from './me-home.component';

describe('MeHomeComponent', () => {
  let component: MeHomeComponent;
  let fixture: ComponentFixture<MeHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeHomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
