import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeEditCustomerComponent } from './me-edit-customer.component';

describe('MeEditCustomerComponent', () => {
  let component: MeEditCustomerComponent;
  let fixture: ComponentFixture<MeEditCustomerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeEditCustomerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeEditCustomerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
