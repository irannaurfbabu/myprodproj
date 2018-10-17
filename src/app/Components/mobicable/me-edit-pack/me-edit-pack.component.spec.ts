import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeEditPackComponent } from './me-edit-pack.component';

describe('MeEditPackComponent', () => {
  let component: MeEditPackComponent;
  let fixture: ComponentFixture<MeEditPackComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeEditPackComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeEditPackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
