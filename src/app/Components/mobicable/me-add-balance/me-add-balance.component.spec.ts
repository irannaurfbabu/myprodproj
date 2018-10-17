import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeAddBalanceComponent } from './me-add-balance.component';

describe('MeAddBalanceComponent', () => {
  let component: MeAddBalanceComponent;
  let fixture: ComponentFixture<MeAddBalanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeAddBalanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeAddBalanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
