import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeCreateExpenseComponent } from './me-create-expense.component';

describe('MeCreateExpenseComponent', () => {
  let component: MeCreateExpenseComponent;
  let fixture: ComponentFixture<MeCreateExpenseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeCreateExpenseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeCreateExpenseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
