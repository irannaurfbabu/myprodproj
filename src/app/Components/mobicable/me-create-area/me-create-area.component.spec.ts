import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeCreateAreaComponent } from './me-create-area.component';

describe('MeCreateAreaComponent', () => {
  let component: MeCreateAreaComponent;
  let fixture: ComponentFixture<MeCreateAreaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeCreateAreaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeCreateAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
