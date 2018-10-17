import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeAddRebateComponent } from './me-add-rebate.component';

describe('MeAddRebateComponent', () => {
  let component: MeAddRebateComponent;
  let fixture: ComponentFixture<MeAddRebateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeAddRebateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeAddRebateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
