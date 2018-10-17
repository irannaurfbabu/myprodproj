import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeBillHistoryComponent } from './me-bill-history.component';

describe('MeBillHistoryComponent', () => {
  let component: MeBillHistoryComponent;
  let fixture: ComponentFixture<MeBillHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeBillHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeBillHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
