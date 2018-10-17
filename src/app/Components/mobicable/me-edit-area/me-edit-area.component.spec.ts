import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeEditAreaComponent } from './me-edit-area.component';

describe('MeEditAreaComponent', () => {
  let component: MeEditAreaComponent;
  let fixture: ComponentFixture<MeEditAreaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeEditAreaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeEditAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
