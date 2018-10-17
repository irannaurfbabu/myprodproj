import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeCreatePackComponent } from './me-create-pack.component';

describe('MeCreatePackComponent', () => {
  let component: MeCreatePackComponent;
  let fixture: ComponentFixture<MeCreatePackComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeCreatePackComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeCreatePackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
