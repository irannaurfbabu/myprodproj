import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeEditExpenseComponent } from './me-edit-expense.component';

describe('MeEditExpenseComponent', () => {
  let component: MeEditExpenseComponent;
  let fixture: ComponentFixture<MeEditExpenseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeEditExpenseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeEditExpenseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
