import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeAddReversalComponent } from './me-add-reversal.component';

describe('MeAddReversalComponent', () => {
  let component: MeAddReversalComponent;
  let fixture: ComponentFixture<MeAddReversalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeAddReversalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeAddReversalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
