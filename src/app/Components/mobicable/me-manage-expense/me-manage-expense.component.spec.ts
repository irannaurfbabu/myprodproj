import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeManageExpenseComponent } from './me-manage-expense.component';

describe('MeManageExpenseComponent', () => {
  let component: MeManageExpenseComponent;
  let fixture: ComponentFixture<MeManageExpenseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeManageExpenseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeManageExpenseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
