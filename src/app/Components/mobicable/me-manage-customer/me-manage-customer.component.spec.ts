import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeManageCustomerComponent } from './me-manage-customer.component';

describe('MeManageCustomerComponent', () => {
  let component: MeManageCustomerComponent;
  let fixture: ComponentFixture<MeManageCustomerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeManageCustomerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeManageCustomerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
