import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeCreateCustomerComponent } from './me-create-customer.component';

describe('MeCreateCustomerComponent', () => {
  let component: MeCreateCustomerComponent;
  let fixture: ComponentFixture<MeCreateCustomerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeCreateCustomerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeCreateCustomerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
